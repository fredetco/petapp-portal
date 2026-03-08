import { supabase, isSupabaseConfigured } from './supabase';

// ── Types ──────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'home_check_scheduled'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'completed';

export type LivingSituation =
  | 'house_owned'
  | 'house_rented'
  | 'apartment_owned'
  | 'apartment_rented'
  | 'farm'
  | 'other';

export interface AdoptionApplication {
  id: string;
  listing_id: string;
  shelter_animal_id: string;
  shelter_id: string;
  applicant_id: string;

  // Form
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  household_description: string | null;
  pet_experience: string | null;
  existing_pets: string | null;
  living_situation: LivingSituation | null;
  has_yard: boolean | null;
  landlord_allows_pets: boolean | null;
  work_schedule: string | null;
  veterinarian_reference: string | null;
  why_this_pet: string | null;
  additional_notes: string | null;

  // Shelter-side
  status: ApplicationStatus;
  reviewer_notes: string | null;
  reviewer_id: string | null;
  rejection_reason: string | null;
  interview_date: string | null;
  home_check_date: string | null;

  // Timeline
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;

  // Joined
  shelter_animal?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    primary_photo_url: string | null;
    status: string;
  };
  adoption_listing?: {
    id: string;
    title: string;
  };
}

// ── Constants ──────────────────────────────────────────────────

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  interview_scheduled: 'Interview',
  home_check_scheduled: 'Home Check',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  completed: 'Completed',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-indigo-100 text-indigo-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  home_check_scheduled: 'bg-violet-100 text-violet-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-neutral-100 text-neutral-500',
  completed: 'bg-emerald-100 text-emerald-700',
};

/** Kanban column ordering */
export const KANBAN_COLUMNS: ApplicationStatus[] = [
  'submitted',
  'under_review',
  'interview_scheduled',
  'home_check_scheduled',
  'approved',
  'completed',
];

/** Valid next statuses */
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['under_review', 'rejected'],
  under_review: ['interview_scheduled', 'home_check_scheduled', 'approved', 'rejected'],
  interview_scheduled: ['under_review', 'home_check_scheduled', 'approved', 'rejected'],
  home_check_scheduled: ['approved', 'rejected'],
  approved: ['completed'],
  rejected: [],
  withdrawn: [],
  completed: [],
};

export const REJECTION_TEMPLATES = [
  'Living situation not suitable',
  'Species experience required',
  'Existing pet incompatibility',
  'Applicant unresponsive',
  'Application incomplete',
  'Other',
];

export const LIVING_SITUATION_LABELS: Record<LivingSituation, string> = {
  house_owned: 'House (Owned)',
  house_rented: 'House (Rented)',
  apartment_owned: 'Apartment (Owned)',
  apartment_rented: 'Apartment (Rented)',
  farm: 'Farm',
  other: 'Other',
};

// ── API ────────────────────────────────────────────────────────

export async function fetchApplications(shelterId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('adoption_applications')
    .select(`
      *,
      shelter_animal:shelter_animals(id, name, species, breed, primary_photo_url, status),
      adoption_listing:adoption_listings(id, title)
    `)
    .eq('shelter_id', shelterId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdoptionApplication[];
}

export async function fetchApplication(applicationId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('adoption_applications')
    .select(`
      *,
      shelter_animal:shelter_animals(id, name, species, breed, primary_photo_url, status),
      adoption_listing:adoption_listings(id, title)
    `)
    .eq('id', applicationId)
    .single();

  if (error) throw error;
  return data as AdoptionApplication;
}

export async function advanceApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  extra?: { reviewer_notes?: string; rejection_reason?: string; interview_date?: string; home_check_date?: string }
) {
  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'under_review') payload.reviewed_at = new Date().toISOString();
  if (status === 'approved') payload.approved_at = new Date().toISOString();
  if (status === 'completed') payload.completed_at = new Date().toISOString();
  if (extra?.reviewer_notes !== undefined) payload.reviewer_notes = extra.reviewer_notes;
  if (extra?.rejection_reason) payload.rejection_reason = extra.rejection_reason;
  if (extra?.interview_date) payload.interview_date = extra.interview_date;
  if (extra?.home_check_date) payload.home_check_date = extra.home_check_date;

  const { error } = await supabase
    .from('adoption_applications')
    .update(payload)
    .eq('id', applicationId);

  if (error) throw error;
}
