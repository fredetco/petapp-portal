import type { OnboardingData } from '../../services/onboarding';
import type { PortalTier } from '../../types/business';
import { TIER_LIMITS } from '../../types/business';
import { Button } from '../shared/Button';
import { Check } from 'lucide-react';

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
  onSubmit: () => void;
  loading: boolean;
}

const PLANS: { tier: PortalTier; name: string; price: string; popular?: boolean }[] = [
  { tier: 'free',       name: 'Free',       price: '$0' },
  { tier: 'pro',        name: 'Pro',        price: '$79/mo', popular: true },
  { tier: 'enterprise', name: 'Enterprise', price: '$249/mo' },
];

function featureList(tier: PortalTier): string[] {
  const limits = TIER_LIMITS[tier];
  const base = [
    `Up to ${limits.maxLinkedPets === Infinity ? 'unlimited' : limits.maxLinkedPets} linked pets`,
    `${limits.monthlyRemindersPerPet === 0 ? 'No' : limits.monthlyRemindersPerPet === Infinity ? 'Unlimited' : `${limits.monthlyRemindersPerPet}/pet/mo`} care reminders`,
  ];

  if (tier === 'free') {
    return [...base, 'Add medical records', 'Basic dashboard', 'Exclusive ad slot'];
  }
  if (tier === 'pro') {
    return [...base, 'Add medical records', 'Full analytics', 'PPC ad campaigns', 'Team members'];
  }
  return [...base, 'Add medical records', 'Full analytics', 'PPC ads + $150 credit', 'Unlimited team', 'Priority support'];
}

export function PlanSelectionStep({ data, onChange, onSubmit, loading }: Props) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-800">Choose your plan</h2>
        <p className="text-neutral-500 mt-1">Start free, upgrade anytime</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {PLANS.map(({ tier, name, price, popular }) => {
          const selected = data.portal_tier === tier;
          return (
            <button
              key={tier}
              onClick={() => onChange({ portal_tier: tier })}
              className={`
                relative p-5 rounded-2xl border-2 text-left transition-all
                ${selected
                  ? 'border-portal-primary-500 bg-portal-primary-50 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }
              `}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-portal-primary-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <p className="font-bold text-neutral-800 text-lg">{name}</p>
              <p className="text-2xl font-extrabold text-portal-primary-600 mt-1">{price}</p>
              <ul className="mt-4 space-y-2">
                {featureList(tier).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-neutral-600">
                    <Check size={14} className="text-success mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={onSubmit} loading={loading}>
          Create my business
        </Button>
      </div>
    </div>
  );
}
