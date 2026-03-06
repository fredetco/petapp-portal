import { SPECIALIZATIONS, type OnboardingData } from '../../services/onboarding';
import { Button } from '../shared/Button';

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function BusinessDetailsStep({ data, onChange, onNext }: Props) {
  const specs = SPECIALIZATIONS[data.type];

  const toggleSpec = (spec: string) => {
    const current = data.specializations;
    onChange({
      specializations: current.includes(spec)
        ? current.filter((s) => s !== spec)
        : [...current, spec],
    });
  };

  const canContinue = data.name.trim() && data.email.trim();

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-800">Business details</h2>
        <p className="text-neutral-500 mt-1">Tell us about your practice</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Business name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="Happy Paws Clinic"
          />
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
              placeholder="info@clinic.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Phone</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
              placeholder="(514) 555-0123"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Description</label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="A brief description of your services..."
          />
        </div>

        {/* License */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            License / Registration #
          </label>
          <input
            type="text"
            value={data.license_number}
            onChange={(e) => onChange({ license_number: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="Optional"
          />
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Specializations
          </label>
          <div className="flex flex-wrap gap-2">
            {specs.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpec(spec)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                  ${data.specializations.includes(spec)
                    ? 'bg-portal-primary-100 text-portal-primary-700 border border-portal-primary-300'
                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                  }
                `}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={!canContinue}>Continue</Button>
      </div>
    </div>
  );
}
