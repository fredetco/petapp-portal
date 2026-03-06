import { usePortalAuth } from '../../context/PortalAuthContext';
import { TIER_LIMITS } from '../../types/business';
import { TierBadge } from '../layout/TierBadge';
import { Button } from '../shared/Button';
import { CreditCard, Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    tier: 'free' as const,
    price: '$0',
    period: 'forever',
    features: ['Up to 50 linked pets', 'Basic records', 'QR scanning', 'No reminders', 'No campaigns'],
  },
  {
    tier: 'pro' as const,
    price: '$79',
    period: '/month',
    features: ['Up to 500 linked pets', 'All record types', '5 reminders/pet/month', 'Ad campaigns', 'Team members'],
    popular: true,
  },
  {
    tier: 'enterprise' as const,
    price: '$249',
    period: '/month',
    features: ['Unlimited linked pets', 'Unlimited reminders', 'Priority support', 'Custom branding', 'API access'],
  },
];

export function BillingPage() {
  const { business } = usePortalAuth();
  const currentTier = business?.portal_tier ?? 'free';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard size={20} className="text-portal-primary-500" />
        <h3 className="text-lg font-bold text-neutral-800">Billing & Plan</h3>
      </div>

      {/* Current plan */}
      <div className="bg-portal-primary-50 rounded-xl p-4 mb-6 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-800">
            Current Plan: <TierBadge tier={currentTier} />
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {TIER_LIMITS[currentTier].maxLinkedPets === Infinity
              ? 'Unlimited'
              : TIER_LIMITS[currentTier].maxLinkedPets}{' '}
            linked pets
            {TIER_LIMITS[currentTier].monthlyRemindersPerPet > 0 &&
              ` \u2022 ${
                TIER_LIMITS[currentTier].monthlyRemindersPerPet === Infinity
                  ? 'Unlimited'
                  : TIER_LIMITS[currentTier].monthlyRemindersPerPet
              } reminders/pet/month`}
          </p>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          return (
            <div
              key={plan.tier}
              className={`rounded-xl border-2 p-5 ${
                plan.popular
                  ? 'border-portal-primary-500 bg-portal-primary-50/30'
                  : isCurrent
                  ? 'border-neutral-300 bg-neutral-50'
                  : 'border-neutral-200'
              }`}
            >
              {plan.popular && (
                <span className="text-xs font-bold text-portal-primary-600 uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <div className="mb-4">
                <TierBadge tier={plan.tier} />
                <p className="text-2xl font-bold text-neutral-800 mt-2">
                  {plan.price}
                  <span className="text-sm font-normal text-neutral-400">{plan.period}</span>
                </p>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-neutral-600">
                    <Check size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="secondary" size="sm" disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full"
                  icon={<ArrowRight size={14} />}
                  onClick={() => { /* TODO: Stripe checkout */ }}
                >
                  {plan.tier === 'free' ? 'Downgrade' : 'Upgrade'}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-neutral-400 mt-4 text-center">
        Payment processing coming soon. Contact support to change your plan.
      </p>
    </div>
  );
}
