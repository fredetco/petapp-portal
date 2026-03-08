import type { OnboardingData } from '../../services/onboarding';
import type { BusinessType } from '../../types/business';
import { Button } from '../shared/Button';

const TYPES: { value: BusinessType; emoji: string; label: string; desc: string }[] = [
  { value: 'vet',       emoji: '\u{1F3E5}', label: 'Veterinary Clinic',  desc: 'Animal hospitals, clinics, and emergency care' },
  { value: 'groomer',   emoji: '\u2702\uFE0F', label: 'Grooming Salon',    desc: 'Pet grooming, bathing, and styling services' },
  { value: 'trainer',   emoji: '\u{1F3C6}', label: 'Training Academy',   desc: 'Obedience, agility, and behavioral training' },
  { value: 'pet_store', emoji: '\u{1F6D2}', label: 'Pet Store',          desc: 'Pet supplies, food, and accessories retail' },
  { value: 'insurance', emoji: '\u{1F6E1}\uFE0F', label: 'Pet Insurance',     desc: 'Health plans and coverage for pets' },
  { value: 'shelter',   emoji: '\u{1F3E0}', label: 'Animal Shelter',     desc: 'Municipal or private animal shelters' },
  { value: 'rescue',    emoji: '\u{1F49B}', label: 'Rescue Organization', desc: 'Breed-specific or general animal rescue groups' },
];

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function BusinessTypeStep({ data, onChange, onNext }: Props) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-800">What type of business?</h2>
        <p className="text-neutral-500 mt-1">Select the category that best describes your practice</p>
      </div>

      <div className="grid gap-3">
        {TYPES.map(({ value, emoji, label, desc }) => (
          <button
            key={value}
            onClick={() => onChange({ type: value })}
            className={`
              flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
              ${data.type === value
                ? 'border-portal-primary-500 bg-portal-primary-50 shadow-sm'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }
            `}
          >
            <span className="text-3xl">{emoji}</span>
            <div>
              <p className="font-bold text-neutral-800">{label}</p>
              <p className="text-sm text-neutral-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
