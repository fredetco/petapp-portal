import type { IntakeFormData } from '../../../services/shelterAnimals';

interface Props {
  data: IntakeFormData;
  onChange: (partial: Partial<IntakeFormData>) => void;
}

const LEVEL_META: { label: string; color: string; description: string }[] = [
  { label: 'Minimal', color: 'bg-green-500', description: 'Standard care, no special requirements' },
  { label: 'Low', color: 'bg-lime-500', description: 'Slightly above average attention needed' },
  { label: 'Moderate', color: 'bg-amber-500', description: 'Some special needs or behavioral work' },
  { label: 'High', color: 'bg-orange-500', description: 'Significant medical or behavioral needs' },
  { label: 'Critical', color: 'bg-red-500', description: 'Intensive care, experienced handler required' },
];

export function CareComplexityStep({ data, onChange }: Props) {
  const idx = Math.max(0, Math.min(data.care_complexity_score - 1, 4));
  const meta = LEVEL_META[idx];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-neutral-800">Care Complexity</h3>
      <p className="text-sm text-neutral-500">
        We auto-calculated a score based on species, age, condition, and special needs.
        Adjust the slider if you disagree.
      </p>

      {/* Score display */}
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${meta.color} text-white flex items-center justify-center text-2xl font-bold`}>
          {data.care_complexity_score}
        </div>
        <div>
          <p className="font-semibold text-neutral-800">{meta.label}</p>
          <p className="text-sm text-neutral-500">{meta.description}</p>
        </div>
      </div>

      {/* Slider */}
      <div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={data.care_complexity_score}
          onChange={(e) => onChange({ care_complexity_score: parseInt(e.target.value) })}
          className="w-full accent-portal-primary-500"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-1">
          {LEVEL_META.map(({ label }) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {/* Auto-calc factors */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Factors considered</p>
        <ul className="text-sm text-neutral-600 space-y-1.5">
          <li>Species: <span className="font-medium">{data.species}</span></li>
          {data.estimated_age_months && (
            <li>Age: <span className="font-medium">{data.estimated_age_months} months</span></li>
          )}
          {data.intake_condition && (
            <li>Condition at intake: <span className="font-medium capitalize">{data.intake_condition.replace('_', ' ')}</span></li>
          )}
          {data.special_needs && (
            <li>Special needs: <span className="font-medium">{data.special_needs}</span></li>
          )}
        </ul>
      </div>
    </div>
  );
}
