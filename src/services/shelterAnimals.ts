import { supabase, isSupabaseConfigured } from './supabase';

// ── Types ──────────────────────────────────────────────────────

export type AnimalStatus =
  | 'intake' | 'medical_hold' | 'available' | 'application_pending'
  | 'adoption_pending' | 'adopted' | 'foster' | 'transferred' | 'returned' | 'deceased';

export type IntakeType =
  | 'stray' | 'surrender' | 'transfer' | 'rescue' | 'confiscation' | 'return' | 'born_in_care';

export type IntakeCondition = 'healthy' | 'minor_issues' | 'needs_treatment' | 'critical';

export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'extra_large';

export interface ShelterAnimal {
  id: string;
  shelter_id: string;

  // Identity
  name: string;
  species: string;
  breed: string;
  color: string | null;
  markings: string | null;
  sex: 'male' | 'female' | 'unknown';
  is_neutered: boolean;
  estimated_age_months: number | null;
  date_of_birth: string | null;
  microchip_id: string | null;

  // Physical
  weight: number | null;
  weight_unit: 'g' | 'kg' | 'lb' | 'oz';
  size_category: SizeCategory | null;

  // Intake
  intake_date: string;
  intake_type: IntakeType;
  intake_notes: string | null;
  intake_condition: IntakeCondition | null;
  source_info: string | null;

  // Health & behavior
  health_notes: string | null;
  behavioral_notes: string | null;
  temperament: string[];
  special_needs: string | null;
  dietary_needs: string | null;
  is_house_trained: boolean | null;
  good_with_dogs: boolean | null;
  good_with_cats: boolean | null;
  good_with_children: boolean | null;

  // Status
  status: AnimalStatus;

  // Media
  photo_urls: string[];
  primary_photo_url: string | null;

  // Care
  care_complexity_score: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface IntakeFormData {
  // Step 1: Basic Info
  name: string;
  species: string;
  breed: string;
  color: string;
  markings: string;
  sex: 'male' | 'female' | 'unknown';
  is_neutered: boolean;
  estimated_age_months: string;
  date_of_birth: string;
  microchip_id: string;
  weight: string;
  weight_unit: 'g' | 'kg' | 'lb' | 'oz';
  size_category: SizeCategory | '';

  // Step 2: Intake Details
  intake_type: IntakeType;
  intake_date: string;
  intake_condition: IntakeCondition | '';
  source_info: string;
  intake_notes: string;

  // Step 3: Health & Behavior
  health_notes: string;
  behavioral_notes: string;
  temperament: string[];
  special_needs: string;
  dietary_needs: string;
  is_house_trained: boolean | null;
  good_with_dogs: boolean | null;
  good_with_cats: boolean | null;
  good_with_children: boolean | null;

  // Step 4: Photos (handled separately via upload)
  photo_urls: string[];
  primary_photo_url: string;

  // Step 5: Care Complexity
  care_complexity_score: number;
}

export const INITIAL_INTAKE: IntakeFormData = {
  name: '',
  species: 'dog',
  breed: '',
  color: '',
  markings: '',
  sex: 'unknown',
  is_neutered: false,
  estimated_age_months: '',
  date_of_birth: '',
  microchip_id: '',
  weight: '',
  weight_unit: 'kg',
  size_category: '',
  intake_type: 'stray',
  intake_date: new Date().toISOString().split('T')[0],
  intake_condition: '',
  source_info: '',
  intake_notes: '',
  health_notes: '',
  behavioral_notes: '',
  temperament: [],
  special_needs: '',
  dietary_needs: '',
  is_house_trained: null,
  good_with_dogs: null,
  good_with_cats: null,
  good_with_children: null,
  photo_urls: [],
  primary_photo_url: '',
  care_complexity_score: 3,
};

// ── Constants ──────────────────────────────────────────────────

export const SPECIES_OPTIONS = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Hamster', 'Guinea Pig', 'Ferret', 'Reptile', 'Other'];

export const TEMPERAMENT_OPTIONS = [
  'Friendly', 'Shy', 'Playful', 'Calm', 'Energetic', 'Anxious',
  'Aggressive', 'Affectionate', 'Independent', 'Curious', 'Vocal',
  'Food-motivated', 'Leash-trained', 'Crate-trained',
];

export const STATUS_LABELS: Record<AnimalStatus, string> = {
  intake: 'Intake',
  medical_hold: 'Medical Hold',
  available: 'Available',
  application_pending: 'Application Pending',
  adoption_pending: 'Adoption Pending',
  adopted: 'Adopted',
  foster: 'Foster',
  transferred: 'Transferred',
  returned: 'Returned',
  deceased: 'Deceased',
};

export const STATUS_COLORS: Record<AnimalStatus, string> = {
  intake: 'bg-blue-100 text-blue-700',
  medical_hold: 'bg-red-100 text-red-700',
  available: 'bg-green-100 text-green-700',
  application_pending: 'bg-amber-100 text-amber-700',
  adoption_pending: 'bg-purple-100 text-purple-700',
  adopted: 'bg-emerald-100 text-emerald-700',
  foster: 'bg-indigo-100 text-indigo-700',
  transferred: 'bg-neutral-100 text-neutral-600',
  returned: 'bg-orange-100 text-orange-700',
  deceased: 'bg-neutral-200 text-neutral-500',
};

// ── API ────────────────────────────────────────────────────────

export async function fetchShelterAnimals(shelterId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('shelter_animals')
    .select('*')
    .eq('shelter_id', shelterId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ShelterAnimal[];
}

export async function fetchShelterAnimal(animalId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('shelter_animals')
    .select('*')
    .eq('id', animalId)
    .single();

  if (error) throw error;
  return data as ShelterAnimal;
}

export async function createShelterAnimal(shelterId: string, form: IntakeFormData) {
  const { data, error } = await supabase
    .from('shelter_animals')
    .insert({
      shelter_id: shelterId,
      name: form.name,
      species: form.species.toLowerCase(),
      breed: form.breed || '',
      color: form.color || null,
      markings: form.markings || null,
      sex: form.sex,
      is_neutered: form.is_neutered,
      estimated_age_months: form.estimated_age_months ? parseInt(form.estimated_age_months) : null,
      date_of_birth: form.date_of_birth || null,
      microchip_id: form.microchip_id || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      weight_unit: form.weight_unit,
      size_category: form.size_category || null,
      intake_type: form.intake_type,
      intake_date: form.intake_date,
      intake_condition: form.intake_condition || null,
      source_info: form.source_info || null,
      intake_notes: form.intake_notes || null,
      health_notes: form.health_notes || null,
      behavioral_notes: form.behavioral_notes || null,
      temperament: form.temperament.length ? form.temperament : null,
      special_needs: form.special_needs || null,
      dietary_needs: form.dietary_needs || null,
      is_house_trained: form.is_house_trained,
      good_with_dogs: form.good_with_dogs,
      good_with_cats: form.good_with_cats,
      good_with_children: form.good_with_children,
      photo_urls: form.photo_urls.length ? form.photo_urls : null,
      primary_photo_url: form.primary_photo_url || null,
      care_complexity_score: form.care_complexity_score,
      status: 'intake',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ShelterAnimal;
}

export async function updateAnimalStatus(animalId: string, status: AnimalStatus) {
  const { error } = await supabase
    .from('shelter_animals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', animalId);

  if (error) throw error;
}

/** Auto-calculate care complexity: 1–5 based on species, special needs, and age */
export function calculateCareComplexity(form: IntakeFormData): number {
  let score = 2; // Base

  // Exotic species are higher complexity
  const exotic = ['bird', 'reptile', 'ferret', 'other'];
  if (exotic.includes(form.species.toLowerCase())) score += 1;

  // Special needs
  if (form.special_needs?.trim()) score += 1;

  // Very young animals need more care
  const age = parseInt(form.estimated_age_months);
  if (!isNaN(age) && age < 3) score += 1;

  // Critical condition
  if (form.intake_condition === 'critical' || form.intake_condition === 'needs_treatment') score += 1;

  return Math.min(Math.max(score, 1), 5);
}

// ── Photo upload ───────────────────────────────────────────────

export async function uploadAnimalPhoto(shelterId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${shelterId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('shelter-photos')
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from('shelter-photos').getPublicUrl(path);
  return data.publicUrl;
}
