import { supabase } from './supabase';
import type { BusinessType, PortalTier } from '../types/business';

export interface OnboardingData {
  // Step 1: Business type
  type: BusinessType;

  // Step 2: Details
  name: string;
  email: string;
  phone: string;
  description: string;
  license_number: string;
  specializations: string[];

  // Shelter-specific (Step 2, shown when type is shelter/rescue)
  is_nonprofit: boolean;
  tax_id: string;
  intake_capacity: string;
  shelter_services: string[];

  // Step 3: Location
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  country: string;
  postal_code: string;

  // Step 4: Plan
  portal_tier: PortalTier;
}

export const INITIAL_ONBOARDING: OnboardingData = {
  type: 'vet',
  name: '',
  email: '',
  phone: '',
  description: '',
  license_number: '',
  specializations: [],
  is_nonprofit: false,
  tax_id: '',
  intake_capacity: '',
  shelter_services: [],
  address_line1: '',
  address_line2: '',
  city: '',
  region: '',
  country: 'CA',
  postal_code: '',
  portal_tier: 'free',
};

export async function createBusiness(data: OnboardingData, userId: string) {
  // 1) Insert business
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .insert({
      owner_user_id: userId,
      name: data.name,
      type: data.type,
      email: data.email,
      phone: data.phone || null,
      description: data.description || null,
      license_number: data.license_number || null,
      specializations: data.specializations.length ? data.specializations : null,
      address_line1: data.address_line1 || null,
      address_line2: data.address_line2 || null,
      city: data.city || null,
      region: data.region || null,
      country: data.country,
      postal_code: data.postal_code || null,
      portal_tier: data.portal_tier,
      // Shelter-specific fields
      ...(data.type === 'shelter' || data.type === 'rescue'
        ? {
            is_nonprofit: data.is_nonprofit,
            tax_id: data.tax_id || null,
            intake_capacity: data.intake_capacity ? parseInt(data.intake_capacity, 10) : null,
            shelter_services: data.shelter_services.length ? data.shelter_services : null,
          }
        : {}),
    })
    .select()
    .single();

  if (bizError) throw bizError;

  // 2) Create owner team member record
  const { error: teamError } = await supabase
    .from('business_team_members')
    .insert({
      business_id: business.id,
      user_id: userId,
      role: 'owner',
      name: data.name,
      email: data.email,
      accepted_at: new Date().toISOString(),
    });

  if (teamError) throw teamError;

  return business;
}

/** Common specializations by business type */
export const SPECIALIZATIONS: Record<BusinessType, string[]> = {
  vet: ['Small animals', 'Exotic pets', 'Reptiles', 'Emergency', 'Surgery', 'Dentistry', 'Dermatology', 'Orthopedics'],
  groomer: ['Dogs', 'Cats', 'Large breeds', 'Hand stripping', 'Creative grooming', 'Mobile grooming'],
  trainer: ['Obedience', 'Agility', 'Behavioral', 'Puppy classes', 'Service dogs', 'Trick training'],
  pet_store: ['Food & nutrition', 'Accessories', 'Aquatics', 'Reptile supplies', 'Natural/organic'],
  insurance: ['Health plans', 'Accident coverage', 'Wellness plans', 'Multi-pet discount'],
  shelter: ['Dogs', 'Cats', 'Small animals', 'Exotics', 'Farm animals', 'Wildlife rehab', 'Senior pets', 'Special needs'],
  rescue: ['Breed-specific', 'Dogs', 'Cats', 'Small animals', 'Exotics', 'Senior pets', 'Special needs', 'Hoarding cases'],
};
