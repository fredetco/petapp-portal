export type BusinessType = 'vet' | 'groomer' | 'trainer' | 'pet_store' | 'insurance' | 'shelter' | 'rescue';
export type PortalTier = 'free' | 'pro' | 'enterprise';
export type TeamRole = 'owner' | 'admin' | 'staff' | 'viewer';

export interface HoursOfOperation {
  [day: string]: { open: string; close: string } | null;
}

export interface Business {
  id: string;
  owner_user_id: string;

  // Profile
  name: string;
  type: BusinessType;
  description: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  logo_url: string | null;

  // Address
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;

  // Details
  license_number: string | null;
  specializations: string[];
  hours_of_operation: HoursOfOperation | null;
  is_24hr: boolean;
  is_emergency: boolean;

  // Subscription
  portal_tier: PortalTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;

  // Stats
  linked_pets_count: number;
  total_reminders_sent: number;
  total_records_added: number;

  // Shelter-specific (only for type = 'shelter' | 'rescue')
  is_nonprofit: boolean;
  tax_id: string | null;
  adoption_fee_range: { min: number; max: number; currency: string } | null;
  intake_capacity: number | null;
  animals_currently_housed: number;
  shelter_services: string[] | null;
  partner_vets: string[] | null;

  // Status
  verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Helper to check if a business is a shelter or rescue */
export function isShelterType(type: BusinessType | undefined): boolean {
  return type === 'shelter' || type === 'rescue';
}

export interface BusinessTeamMember {
  id: string;
  business_id: string;
  user_id: string;
  role: TeamRole;
  name: string | null;
  email: string | null;
  invited_at: string;
  accepted_at: string | null;
  active: boolean;
}

/** Tier limits for enforcing feature gates */
export const TIER_LIMITS: Record<PortalTier, {
  maxLinkedPets: number;
  monthlyRemindersPerPet: number;
  hasAdCampaigns: boolean;
  hasTeamMembers: boolean;
}> = {
  free: {
    maxLinkedPets: 50,
    monthlyRemindersPerPet: 0,
    hasAdCampaigns: false,
    hasTeamMembers: false,
  },
  pro: {
    maxLinkedPets: 500,
    monthlyRemindersPerPet: 5,
    hasAdCampaigns: true,
    hasTeamMembers: true,
  },
  enterprise: {
    maxLinkedPets: Infinity,
    monthlyRemindersPerPet: Infinity,
    hasAdCampaigns: true,
    hasTeamMembers: true,
  },
};
