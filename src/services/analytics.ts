import { supabase, isSupabaseConfigured } from './supabase';

export interface DashboardStats {
  linkedPets: number;
  pendingLinks: number;
  totalRecords: number;
  scheduledReminders: number;
}

export interface ShelterDashboardStats {
  animalsInCare: number;
  activeListings: number;
  pendingApplications: number;
  adoptionsThisMonth: number;
  adoptionsThisYear: number;
  returnRate: number;
  // For capacity gauge
  animalsCurrentlyHoused: number;
  intakeCapacity: number | null;
}

export interface ShelterActivityItem {
  id: string;
  type: 'intake' | 'application' | 'adoption' | 'listing' | 'handoff';
  title: string;
  description: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  type: 'record_added' | 'link_approved' | 'link_requested' | 'reminder_sent';
  title: string;
  description: string;
  created_at: string;
}

export interface UpcomingReminder {
  id: string;
  pet_name: string;
  title: string;
  type: string;
  scheduled_for: string;
}

export async function fetchDashboardStats(businessId: string): Promise<DashboardStats> {
  if (!isSupabaseConfigured) {
    return { linkedPets: 0, pendingLinks: 0, totalRecords: 0, scheduledReminders: 0 };
  }

  const [linksRes, pendingRes, recordsRes, remindersRes] = await Promise.all([
    supabase
      .from('service_links')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'active'),
    supabase
      .from('service_links')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'pending'),
    supabase
      .from('business_records')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('business_reminders')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'scheduled'),
  ]);

  return {
    linkedPets: linksRes.count ?? 0,
    pendingLinks: pendingRes.count ?? 0,
    totalRecords: recordsRes.count ?? 0,
    scheduledReminders: remindersRes.count ?? 0,
  };
}

export async function fetchRecentActivity(businessId: string, limit = 10): Promise<ActivityItem[]> {
  if (!isSupabaseConfigured) return [];

  // Fetch recent records as activity items
  const { data: records } = await supabase
    .from('business_records')
    .select('id, title, type, created_at, pet:pets(name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (records ?? []).map((r) => ({
    id: r.id,
    type: 'record_added' as const,
    title: r.title,
    description: `Added ${r.type} for ${(r.pet as unknown as { name: string })?.name ?? 'pet'}`,
    created_at: r.created_at,
  }));
}

export async function fetchUpcomingReminders(businessId: string, limit = 5): Promise<UpcomingReminder[]> {
  if (!isSupabaseConfigured) return [];

  const { data } = await supabase
    .from('business_reminders')
    .select('id, title, type, scheduled_for, pet:pets(name)')
    .eq('business_id', businessId)
    .eq('status', 'scheduled')
    .gte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(limit);

  return (data ?? []).map((r) => ({
    id: r.id,
    pet_name: (r.pet as unknown as { name: string })?.name ?? 'Pet',
    title: r.title,
    type: r.type,
    scheduled_for: r.scheduled_for,
  }));
}

// ── Shelter-specific analytics ──────────────────────────────────

export async function fetchShelterDashboardStats(businessId: string): Promise<ShelterDashboardStats> {
  if (!isSupabaseConfigured) {
    return {
      animalsInCare: 0, activeListings: 0, pendingApplications: 0,
      adoptionsThisMonth: 0, adoptionsThisYear: 0, returnRate: 0,
      animalsCurrentlyHoused: 0, intakeCapacity: null,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

  const [
    animalsRes,
    listingsRes,
    appsRes,
    monthRes,
    yearRes,
    returnsRes,
    totalAdoptedRes,
    bizRes,
  ] = await Promise.all([
    // Animals in care (not adopted/deceased/transferred)
    supabase
      .from('shelter_animals')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .in('status', ['intake', 'available', 'foster', 'medical_hold']),
    // Active listings
    supabase
      .from('adoption_listings')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('listing_status', 'active'),
    // Pending applications
    supabase
      .from('adoption_applications')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .in('status', ['submitted', 'under_review', 'interview_scheduled', 'home_check']),
    // Adoptions this month
    supabase
      .from('shelter_animals')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'adopted')
      .gte('outcome_date', startOfMonth),
    // Adoptions this year
    supabase
      .from('shelter_animals')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'adopted')
      .gte('outcome_date', startOfYear),
    // Returns (for return rate)
    supabase
      .from('shelter_animals')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_return', true),
    // Total ever adopted (for return rate denominator)
    supabase
      .from('shelter_animals')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'adopted'),
    // Business capacity info
    supabase
      .from('businesses')
      .select('intake_capacity, animals_currently_housed')
      .eq('id', businessId)
      .single(),
  ]);

  const totalAdopted = totalAdoptedRes.count ?? 0;
  const returns = returnsRes.count ?? 0;

  return {
    animalsInCare: animalsRes.count ?? 0,
    activeListings: listingsRes.count ?? 0,
    pendingApplications: appsRes.count ?? 0,
    adoptionsThisMonth: monthRes.count ?? 0,
    adoptionsThisYear: yearRes.count ?? 0,
    returnRate: totalAdopted > 0 ? Math.round((returns / totalAdopted) * 100) : 0,
    animalsCurrentlyHoused: bizRes.data?.animals_currently_housed ?? 0,
    intakeCapacity: bizRes.data?.intake_capacity ?? null,
  };
}

export async function fetchShelterActivity(businessId: string, limit = 10): Promise<ShelterActivityItem[]> {
  if (!isSupabaseConfigured) return [];

  // Fetch recent shelter animals as activity (intakes + adoptions)
  const { data: animals } = await supabase
    .from('shelter_animals')
    .select('id, name, status, species, intake_date, outcome_date, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (animals ?? []).map((a) => {
    const isAdopted = a.status === 'adopted';
    return {
      id: a.id,
      type: isAdopted ? 'adoption' as const : 'intake' as const,
      title: isAdopted ? `${a.name} adopted` : `${a.name} intake`,
      description: isAdopted
        ? `${a.species} was adopted on ${a.outcome_date ?? 'unknown date'}`
        : `New ${a.species} arrived — status: ${a.status}`,
      created_at: a.created_at,
    };
  });
}
