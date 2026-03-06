import type { BusinessType } from './business';

export type ServiceLinkStatus = 'pending' | 'active' | 'revoked' | 'expired';
export type LinkInitiator = 'business_qr_scan' | 'owner_request' | 'manual';

export interface ServiceLink {
  id: string;
  pet_id: string;
  business_id: string;
  service_category: BusinessType;

  // Lifecycle
  status: ServiceLinkStatus;
  initiated_by: LinkInitiator;
  linked_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;

  // On-chain reference
  blockchain_tx_hash: string | null;

  // Metadata
  notes: string | null;
  created_at: string;
}

/** Expanded service link with joined pet + business data for list views */
export interface ServiceLinkWithDetails extends ServiceLink {
  pet?: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    photo_url: string | null;
    owner_id: string;
  };
  business?: {
    id: string;
    name: string;
    type: BusinessType;
    logo_url: string | null;
  };
}
