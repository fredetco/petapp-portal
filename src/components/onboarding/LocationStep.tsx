import type { OnboardingData } from '../../services/onboarding';
import { Button } from '../shared/Button';

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
];

export function LocationStep({ data, onChange, onNext }: Props) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-800">Where are you located?</h2>
        <p className="text-neutral-500 mt-1">Help pet owners find your business</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        {/* Address Line 1 */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Street address
          </label>
          <input
            type="text"
            value={data.address_line1}
            onChange={(e) => onChange({ address_line1: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="123 Main Street"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Suite / Unit
          </label>
          <input
            type="text"
            value={data.address_line2}
            onChange={(e) => onChange({ address_line2: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="Suite 200 (optional)"
          />
        </div>

        {/* City + Province */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">City</label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
              placeholder="Montreal"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Province</label>
            <select
              value={data.region}
              onChange={(e) => onChange({ region: e.target.value })}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            >
              <option value="">Select...</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Postal Code + Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Postal code
            </label>
            <input
              type="text"
              value={data.postal_code}
              onChange={(e) => onChange({ postal_code: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
              placeholder="H2X 1Y4"
              maxLength={7}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Country</label>
            <select
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            >
              <option value="CA">Canada</option>
              <option value="US">United States</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
