import { supabase, isSupabaseConfigured } from './supabase';
import type { AdCampaign, CampaignStatus } from '../types/campaign';

export interface CreateCampaignInput {
  businessId: string;
  name: string;
  type: 'exclusive_service' | 'open_marketplace';
  targetSpecies: string[];
  targetRegions: string[];
  headline: string;
  body: string;
  ctaText: string | null;
  ctaUrl: string | null;
  dailyBudget: number | null;
  cpcBid: number | null;
  totalBudget: number | null;
  startDate: string | null;
  endDate: string | null;
}

export async function createCampaign(input: CreateCampaignInput): Promise<AdCampaign> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('ad_campaigns')
    .insert({
      business_id: input.businessId,
      name: input.name,
      type: input.type,
      status: 'draft',
      target_species: input.targetSpecies,
      target_regions: input.targetRegions,
      headline: input.headline,
      body: input.body,
      cta_text: input.ctaText,
      cta_url: input.ctaUrl,
      daily_budget: input.dailyBudget,
      cpc_bid: input.cpcBid,
      total_budget: input.totalBudget,
      start_date: input.startDate,
      end_date: input.endDate,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AdCampaign;
}

export async function fetchCampaigns(businessId: string): Promise<AdCampaign[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdCampaign[];
}

export async function updateCampaignStatus(
  campaignId: string,
  status: CampaignStatus,
) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('ad_campaigns')
    .update({ status })
    .eq('id', campaignId);

  if (error) throw error;
}

export async function deleteCampaign(campaignId: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('ad_campaigns')
    .delete()
    .eq('id', campaignId);

  if (error) throw error;
}
