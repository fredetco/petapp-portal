import { supabase, isSupabaseConfigured } from './supabase';
import type { AdoptionApplication } from './adoptionApplications';

// ── Types ──────────────────────────────────────────────────────

export type HandoffStatus = 'pending' | 'accepted' | 'completed' | 'failed';
export type HandoffType = 'standard' | 'foster_adopt' | 'transfer';

export interface AdoptionHandoff {
  id: string;
  application_id: string | null;
  shelter_animal_id: string;
  shelter_id: string;
  adopter_id: string;
  pet_id: string | null;

  transferred_data: Record<string, unknown>;
  care_plan_generated: boolean;
  care_plan_id: string | null;

  handoff_type: HandoffType;
  adoption_fee_paid: number;
  fee_currency: string;

  status: HandoffStatus;

  initiated_at: string;
  accepted_at: string | null;
  completed_at: string | null;

  created_at: string;

  // Joined
  shelter_animal?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    primary_photo_url: string | null;
  };
  adopter?: {
    id: string;
    display_name: string | null;
    email: string | null;
  };
}

// ── Constants ──────────────────────────────────────────────────

export const HANDOFF_STATUS_LABELS: Record<HandoffStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  completed: 'Completed',
  failed: 'Failed',
};

export const HANDOFF_STATUS_COLORS: Record<HandoffStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

// ── API ────────────────────────────────────────────────────────

export async function fetchHandoffs(shelterId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('adoption_handoffs')
    .select(`
      *,
      shelter_animal:shelter_animals(id, name, species, breed, primary_photo_url),
      adopter:profiles!adoption_handoffs_adopter_id_fkey(id, display_name, email)
    `)
    .eq('shelter_id', shelterId)
    .order('initiated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdoptionHandoff[];
}

export async function fetchHandoff(handoffId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('adoption_handoffs')
    .select(`
      *,
      shelter_animal:shelter_animals(id, name, species, breed, primary_photo_url),
      adopter:profiles!adoption_handoffs_adopter_id_fkey(id, display_name, email)
    `)
    .eq('id', handoffId)
    .single();

  if (error) throw error;
  return data as AdoptionHandoff;
}

/**
 * Initiate a handoff from an approved application.
 *
 * 1. Fetch the full shelter_animal data for the snapshot
 * 2. Create the adoption_handoffs row with transferred_data
 * 3. Update animal status → adoption_pending
 * 4. Update the related listing → paused
 * 5. Update application → completed
 */
export async function initiateHandoff(application: AdoptionApplication, shelterId: string) {
  // 1. Fetch full animal data for snapshot
  const { data: animal, error: animalError } = await supabase
    .from('shelter_animals')
    .select('*')
    .eq('id', application.shelter_animal_id)
    .single();

  if (animalError) throw animalError;

  // 2. Create handoff row
  const { data: handoff, error: handoffError } = await supabase
    .from('adoption_handoffs')
    .insert({
      application_id: application.id,
      shelter_animal_id: application.shelter_animal_id,
      shelter_id: shelterId,
      adopter_id: application.applicant_id,
      transferred_data: animal,
      handoff_type: 'standard',
      status: 'pending',
    })
    .select()
    .single();

  if (handoffError) throw handoffError;

  // 3. Update animal status → adoption_pending
  const { error: statusError } = await supabase
    .from('shelter_animals')
    .update({ status: 'adoption_pending', updated_at: new Date().toISOString() })
    .eq('id', application.shelter_animal_id);

  if (statusError) throw statusError;

  // 4. Pause the listing
  if (application.listing_id) {
    await supabase
      .from('adoption_listings')
      .update({ listing_status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', application.listing_id);
  }

  // 5. Mark application as completed
  const { error: appError } = await supabase
    .from('adoption_applications')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', application.id);

  if (appError) throw appError;

  return handoff as AdoptionHandoff;
}
