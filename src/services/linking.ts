import { supabase, isSupabaseConfigured } from './supabase';
import type { BusinessType } from '../types/business';

export interface PetLookupResult {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  photo_url: string | null;
  owner_id: string;
  owner_name: string | null;
  existing_link_status: string | null;
}

/** Look up a pet by QR token or ID */
export async function lookupPet(
  query: string,
  businessId: string,
): Promise<PetLookupResult | null> {
  if (!isSupabaseConfigured) return null;

  // Try by qr_token first, then by id
  let petData = null;

  const { data: byToken } = await supabase
    .from('pets')
    .select('id, name, species, breed, photo_url, owner_id, owner:profiles(full_name)')
    .eq('qr_token', query)
    .single();

  if (byToken) {
    petData = byToken;
  } else {
    const { data: byId } = await supabase
      .from('pets')
      .select('id, name, species, breed, photo_url, owner_id, owner:profiles(full_name)')
      .eq('id', query)
      .single();
    petData = byId;
  }

  if (!petData) return null;

  // Check if there's already a link
  const { data: existingLink } = await supabase
    .from('service_links')
    .select('status')
    .eq('pet_id', petData.id)
    .eq('business_id', businessId)
    .in('status', ['pending', 'active'])
    .single();

  return {
    id: petData.id,
    name: petData.name,
    species: petData.species,
    breed: petData.breed,
    photo_url: petData.photo_url,
    owner_id: petData.owner_id,
    owner_name: (petData.owner as unknown as { full_name: string })?.full_name ?? null,
    existing_link_status: existingLink?.status ?? null,
  };
}

/** Send a link request to a pet owner */
export async function sendLinkRequest(
  petId: string,
  businessId: string,
  serviceCategory: BusinessType,
  notes: string,
) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('service_links')
    .insert({
      pet_id: petId,
      business_id: businessId,
      service_category: serviceCategory,
      status: 'pending',
      initiated_by: 'business_qr_scan',
      notes: notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Create notification for pet owner
  const { data: pet } = await supabase
    .from('pets')
    .select('owner_id, name')
    .eq('id', petId)
    .single();

  if (pet) {
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single();

    await supabase.from('notifications').insert({
      user_id: pet.owner_id,
      type: 'link_request',
      title: 'New service link request',
      body: `${business?.name ?? 'A business'} wants to link with ${pet.name}`,
      data: { link_id: data.id, pet_id: petId, business_id: businessId },
    });
  }

  return data;
}

/** Revoke a service link */
export async function revokeLink(linkId: string, revokedBy: 'owner' | 'business') {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('service_links')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
    })
    .eq('id', linkId);

  if (error) throw error;
}

/** Approve a pending link (called by pet owner in main app) */
export async function approveLink(linkId: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('service_links')
    .update({
      status: 'active',
      linked_at: new Date().toISOString(),
    })
    .eq('id', linkId);

  if (error) throw error;
}
