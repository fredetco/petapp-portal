import type { PortalTier } from '../../types/business';

const tierConfig: Record<PortalTier, { label: string; color: string }> = {
  free:       { label: 'Free',       color: 'bg-neutral-500/20 text-neutral-300' },
  pro:        { label: 'Pro',        color: 'bg-portal-primary-500/20 text-portal-primary-300' },
  enterprise: { label: 'Enterprise', color: 'bg-portal-accent-500/20 text-portal-accent-400' },
};

export function TierBadge({ tier }: { tier: PortalTier }) {
  const { label, color } = tierConfig[tier];
  return (
    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>
      {label}
    </span>
  );
}
