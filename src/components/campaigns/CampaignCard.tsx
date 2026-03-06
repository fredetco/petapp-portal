import { format } from 'date-fns';
import type { AdCampaign, CampaignStatus } from '../../types/campaign';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Eye, BarChart3, MousePointerClick, DollarSign, Play, Pause, Trash2 } from 'lucide-react';

interface Props {
  campaign: AdCampaign;
  onStatusChange: (campaignId: string, status: CampaignStatus) => void;
  onDelete: (campaignId: string) => void;
}

const statusBadge: Record<CampaignStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  active: { variant: 'success', label: 'Active' },
  paused: { variant: 'warning', label: 'Paused' },
  completed: { variant: 'info' as 'default', label: 'Completed' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

export function CampaignCard({ campaign, onStatusChange, onDelete }: Props) {
  const badge = statusBadge[campaign.status];
  const ctr = campaign.impressions > 0
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-neutral-800">{campaign.name}</h3>
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <Badge variant={campaign.type === 'exclusive_service' ? 'info' : 'default'}>
              {campaign.type === 'exclusive_service' ? 'Exclusive' : 'Marketplace'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-400">
            Created {format(new Date(campaign.created_at), 'MMM d, yyyy')}
            {campaign.start_date && ` \u2022 Starts ${format(new Date(campaign.start_date), 'MMM d')}`}
            {campaign.end_date && ` \u2013 ${format(new Date(campaign.end_date), 'MMM d')}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {campaign.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(campaign.id, 'active')}
              icon={<Play size={14} />}
            >
              Launch
            </Button>
          )}
          {campaign.status === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(campaign.id, 'paused')}
              icon={<Pause size={14} />}
            >
              Pause
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(campaign.id, 'active')}
              icon={<Play size={14} />}
            >
              Resume
            </Button>
          )}
          {(campaign.status === 'draft' || campaign.status === 'cancelled') && (
            <button
              onClick={() => onDelete(campaign.id)}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-danger hover:bg-red-50 transition-colors"
              title="Delete campaign"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Ad preview */}
      <div className="bg-neutral-50 rounded-xl p-4 mb-4">
        <p className="text-sm font-bold text-neutral-800 mb-1">{campaign.headline}</p>
        <p className="text-xs text-neutral-500 line-clamp-2">{campaign.body}</p>
        {campaign.cta_text && (
          <span className="inline-block mt-2 text-xs font-semibold text-portal-primary-600 bg-portal-primary-50 px-2 py-0.5 rounded">
            {campaign.cta_text}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricBox icon={<Eye size={14} />} label="Impressions" value={campaign.impressions.toLocaleString()} />
        <MetricBox icon={<MousePointerClick size={14} />} label="Clicks" value={campaign.clicks.toLocaleString()} />
        <MetricBox icon={<BarChart3 size={14} />} label="CTR" value={`${ctr}%`} />
        <MetricBox icon={<DollarSign size={14} />} label="Spend" value={`$${campaign.total_spend.toFixed(2)}`} />
      </div>

      {/* Targeting */}
      {(campaign.target_species.length > 0 || campaign.target_regions.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1">
          {campaign.target_species.map((s) => (
            <span key={s} className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded capitalize">
              {s}
            </span>
          ))}
          {campaign.target_regions.map((r) => (
            <span key={r} className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-neutral-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-bold text-neutral-800">{value}</p>
    </div>
  );
}
