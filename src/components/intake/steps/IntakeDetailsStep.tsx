import type { IntakeFormData, IntakeType, IntakeCondition } from '../../../services/shelterAnimals';

interface Props {
  data: IntakeFormData;
  onChange: (partial: Partial<IntakeFormData>) => void;
}

const INTAKE_TYPES: { value: IntakeType; label: string }[] = [
  { value: 'stray', label: 'Stray / Found' },
  { value: 'surrender', label: 'Owner Surrender' },
  { value: 'transfer', label: 'Transfer from Another Shelter' },
  { value: 'rescue', label: 'Rescue Operation' },
  { value: 'confiscation', label: 'Confiscation / Seizure' },
  { value: 'return', label: 'Return (Previous Adoption)' },
  { value: 'born_in_care', label: 'Born in Care' },
];

const CONDITIONS: { value: IntakeCondition; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'minor_issues', label: 'Minor Issues', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'needs_treatment', label: 'Needs Treatment', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' },
];

export function IntakeDetailsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-neutral-800">Intake Details</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Intake Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.intake_type}
            onChange={(e) => onChange({ intake_type: e.target.value as IntakeType })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          >
            {INTAKE_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Intake Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.intake_date}
            onChange={(e) => onChange({ intake_date: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Condition at Intake</label>
        <div className="flex gap-2">
          {CONDITIONS.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ intake_condition: data.intake_condition === value ? '' : value })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                data.intake_condition === value ? color : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">Source / Found Location</label>
        <input
          type="text"
          value={data.source_info}
          onChange={(e) => onChange({ source_info: e.target.value })}
          className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          placeholder="Where the animal was found or surrendered from"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">Intake Notes</label>
        <textarea
          value={data.intake_notes}
          onChange={(e) => onChange({ intake_notes: e.target.value })}
          rows={3}
          className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          placeholder="Any additional notes about the intake..."
        />
      </div>
    </div>
  );
}
