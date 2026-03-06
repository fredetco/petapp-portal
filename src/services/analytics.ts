import { supabase, isSupabaseConfigured } from './supabase';

export interface DashboardStats {
  linkedPets: number;
  pendingLinks: number;
  totalRecords: number;
  scheduledReminders: number;
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
