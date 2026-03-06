export type CampaignType = 'exclusive_service' | 'open_marketplace';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface AdCampaign {
  id: string;
  business_id: string;

  // Setup
  name: string;
  type: CampaignType;
  status: CampaignStatus;

  // Targeting
  target_species: string[];
  target_regions: string[];
  target_age_min_months: number | null;
  target_age_max_months: number | null;

  // Content
  headline: string;
  body: string;
  cta_text: string | null;
  cta_url: string | null;
  image_url: string | null;

  // Budget (open marketplace only)
  daily_budget: number | null;
  cpc_bid: number | null;
  total_budget: number | null;

  // Performance
  impressions: number;
  clicks: number;
  total_spend: number;

  // Schedule
  start_date: string | null;
  end_date: string | null;

  created_at: string;
  updated_at: string;
}
