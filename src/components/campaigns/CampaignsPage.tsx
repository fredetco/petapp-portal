import { useState } from 'react';
import { PortalHeader } from '../layout/PortalHeader';
import { useCampaigns, useUpdateCampaignStatus, useDeleteCampaign } from '../../hooks/useCampaigns';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { TIER_LIMITS } from '../../types/business';
import { CampaignCard } from './CampaignCard';
import { CreateCampaignForm } from './CreateCampaignForm';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Button } from '../shared/Button';
import { Megaphone, Plus, Lock } from 'lucide-react';
import type { CampaignStatus } from '../../types/campaign';

export function CampaignsPage() {
  const { business } = usePortalAuth();
  const { data: campaigns, isLoading } = useCampaigns();
  const updateStatus = useUpdateCampaignStatus();
  const deleteCampaign = useDeleteCampaign();
  const [showCreate, setShowCreate] = useState(false);

  const canUseCampaigns = business ? TIER_LIMITS[business.portal_tier].hasAdCampaigns : false;

  const handleStatusChange = (campaignId: string, status: CampaignStatus) => {
    updateStatus.mutate({ campaignId, status });
  };

  const handleDelete = (campaignId: string) => {
    deleteCampaign.mutate(campaignId);
  };

  return (
    <>
      <PortalHeader title="Campaigns" />
      <div className="p-6">
        {!canUseCampaigns ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-lg mx-auto">
            <Lock size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-700 mb-2">
              Ad Campaigns — Pro Feature
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Upgrade to Pro or Enterprise to create ad campaigns and reach pet owners
              in the PetApp marketplace.
            </p>
            <Button variant="primary" onClick={() => { /* TODO: navigate to billing */ }}>
              Upgrade Plan
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-neutral-500">
                  {campaigns?.length ?? 0} campaign{(campaigns?.length ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
                Create Campaign
              </Button>
            </div>

            {/* Content */}
            {!campaigns || campaigns.length === 0 ? (
              <EmptyState
                icon={<Megaphone size={48} />}
                title="No campaigns yet"
                description="Create your first ad campaign to promote your services to pet owners."
                actionLabel="Create Campaign"
                onAction={() => setShowCreate(true)}
              />
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Create modal */}
            {showCreate && (
              <CreateCampaignForm
                open={showCreate}
                onClose={() => setShowCreate(false)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
