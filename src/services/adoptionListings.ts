import { supabase, isSupabaseConfigured } from './supabase';
import type { ShelterAnimal } from './shelterAnimals';

// ── Types ──────────────────────────────────────────────────────

export type ListingStatus = 'draft' | 'active' | 'paused' | 'closed';

export interface AdoptionListing {
  id: string;
  shelter_animal_id: string;
  shelter_id: string;

  // Content
  title: string;
  description: string;
  description_fr: string | null;

  // Adoption terms
  adoption_fee: number;
  fee_currency: string;
  fee_includes: string[];
  requirements: string | null;
  requirements_fr: string | null;

  // Settings
  is_featured: boolean;
  is_urgent: boolean;
  listing_status: ListingStatus;
  published_at: string | null;
  expires_at: string | null;

  // Location
  location_city: string | null;
  location_region: string | null;
  location_country: string;
  location_postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  delivery_options: string[];

  // Stats
  view_count: number;
  favorite_count: number;
  application_count: number;

  created_at: string;
  updated_at: string;

  // Joined data (optional)
  shelter_animal?: ShelterAnimal;
}

export interface ListingFormData {
  shelter_animal_id: string;
  title: string;
  description: string;
  description_fr: string;
  adoption_fee: string;
  fee_currency: string;
  fee_includes: string[];
  requirements: string;
  requirements_fr: string;
  is_featured: boolean;
  is_urgent: boolean;
  location_city: string;
  location_region: string;
  location_country: string;
  location_postal_code: string;
  delivery_options: string[];
}

export const INITIAL_LISTING_FORM: ListingFormData = {
  shelter_animal_id: '',
  title: '',
  description: '',
  description_fr: '',
  adoption_fee: '0',
  fee_currency: 'CAD',
  fee_includes: [],
  requirements: '',
  requirements_fr: '',
  is_featured: false,
  is_urgent: false,
  location_city: '',
  location_region: '',
  location_country: 'CA',
  location_postal_code: '',
  delivery_options: ['pickup'],
};

// ── Constants ──────────────────────────────────────────────────

export const FEE_INCLUDES_OPTIONS = [
  { value: 'spay_neuter', label: 'Spay/Neuter' },
  { value: 'vaccinations', label: 'Vaccinations' },
  { value: 'microchip', label: 'Microchip' },
  { value: 'first_vet_visit', label: 'First Vet Visit' },
  { value: 'starter_kit', label: 'Starter Kit' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'flea_treatment', label: 'Flea Treatment' },
];

export const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'Pickup at Shelter' },
  { value: 'local_delivery', label: 'Local Delivery' },
  { value: 'transport_available', label: 'Transport Available' },
];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  closed: 'Closed',
};

export const LISTING_STATUS_COLORS: Record<ListingStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  closed: 'bg-neutral-200 text-neutral-500',
};

// ── API ────────────────────────────────────────────────────────

export async function fetchListings(shelterId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('adoption_listings')
    .select('*, shelter_animal:shelter_animals(*)')
    .eq('shelter_id', shelterId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdoptionListing[];
}

export async function fetchListing(listingId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('adoption_listings')
    .select('*, shelter_animal:shelter_animals(*)')
    .eq('id', listingId)
    .single();

  if (error) throw error;
  return data as AdoptionListing;
}

export async function createListing(shelterId: string, form: ListingFormData) {
  const { data, error } = await supabase
    .from('adoption_listings')
    .insert({
      shelter_id: shelterId,
      shelter_animal_id: form.shelter_animal_id,
      title: form.title,
      description: form.description,
      description_fr: form.description_fr || null,
      adoption_fee: parseFloat(form.adoption_fee) || 0,
      fee_currency: form.fee_currency,
      fee_includes: form.fee_includes.length ? form.fee_includes : null,
      requirements: form.requirements || null,
      requirements_fr: form.requirements_fr || null,
      is_featured: form.is_featured,
      is_urgent: form.is_urgent,
      location_city: form.location_city || null,
      location_region: form.location_region || null,
      location_country: form.location_country,
      location_postal_code: form.location_postal_code || null,
      delivery_options: form.delivery_options.length ? form.delivery_options : null,
      listing_status: 'draft',
    })
    .select('*, shelter_animal:shelter_animals(*)')
    .single();

  if (error) throw error;
  return data as AdoptionListing;
}

export async function updateListing(listingId: string, updates: Partial<ListingFormData>) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.description_fr !== undefined) payload.description_fr = updates.description_fr || null;
  if (updates.adoption_fee !== undefined) payload.adoption_fee = parseFloat(updates.adoption_fee) || 0;
  if (updates.fee_currency !== undefined) payload.fee_currency = updates.fee_currency;
  if (updates.fee_includes !== undefined) payload.fee_includes = updates.fee_includes;
  if (updates.requirements !== undefined) payload.requirements = updates.requirements || null;
  if (updates.requirements_fr !== undefined) payload.requirements_fr = updates.requirements_fr || null;
  if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured;
  if (updates.is_urgent !== undefined) payload.is_urgent = updates.is_urgent;
  if (updates.location_city !== undefined) payload.location_city = updates.location_city || null;
  if (updates.location_region !== undefined) payload.location_region = updates.location_region || null;
  if (updates.location_country !== undefined) payload.location_country = updates.location_country;
  if (updates.location_postal_code !== undefined) payload.location_postal_code = updates.location_postal_code || null;
  if (updates.delivery_options !== undefined) payload.delivery_options = updates.delivery_options;

  const { error } = await supabase
    .from('adoption_listings')
    .update(payload)
    .eq('id', listingId);

  if (error) throw error;
}

export async function updateListingStatus(listingId: string, status: ListingStatus) {
  const payload: Record<string, unknown> = {
    listing_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'active') {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('adoption_listings')
    .update(payload)
    .eq('id', listingId);

  if (error) throw error;
}

/** Build a default title from animal data */
export function buildDefaultTitle(animal: ShelterAnimal): string {
  const age = animal.estimated_age_months;
  const ageStr = age
    ? age < 12 ? `${age}-month-old` : `${Math.round(age / 12)}-year-old`
    : '';
  const breed = animal.breed || animal.species;
  return `Meet ${animal.name} — ${ageStr ? `a ${ageStr} ` : 'a lovely '}${breed}`.trim();
}
