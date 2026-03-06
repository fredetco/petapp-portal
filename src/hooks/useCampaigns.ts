import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortalAuth } from '../context/PortalAuthContext';
import {
  fetchCampaigns,
  createCampaign,
  updateCampaignStatus,
  deleteCampaign,
  type CreateCampaignInput,
} from '../services/campaigns';
import type { CampaignStatus } from '../types/campaign';

export function useCampaigns() {
  const { business } = usePortalAuth();

  return useQuery({
    queryKey: ['campaigns', business?.id],
    queryFn: () => fetchCampaigns(business!.id),
    enabled: !!business,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCampaignInput) => createCampaign(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, status }: { campaignId: string; status: CampaignStatus }) =>
      updateCampaignStatus(campaignId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => deleteCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
