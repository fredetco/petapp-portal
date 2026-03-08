import { TEMPERAMENT_OPTIONS, type IntakeFormData } from '../../../services/shelterAnimals';

interface Props {
  data: IntakeFormData;
  onChange: (partial: Partial<IntakeFormData>) => void;
}

function TriToggle({ label, value, onValueChange }: { label: string; value: boolean | null; onValueChange: (v: boolean | null) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-700">{label}</span>
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
        {[
          { v: true, label: 'Yes', color: 'bg-green-500 text-white' },
          { v: null, label: '?', color: 'bg-neutral-300 text-neutral-600' },
          { v: false, label: 'No', color: 'bg-red-500 text-white' },
        ].map(({ v, label: l, color }) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onValueChange(v)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              value === v ? color : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HealthBehaviorStep({ data, onChange }: Props) {
  const toggleTemp = (tag: string) => {
    onChange({
      temperament: data.temperament.includes(tag)
        ? data.temperament.filter((t) => t !== tag)
        : [...data.temperament, tag],
    });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-neutral-800">Health & Behavior</h3>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">Health Notes</label>
        <textarea
          value={data.health_notes}
          onChange={(e) => onChange({ health_notes: e.target.value })}
          rows={2}
          className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          placeholder="Vaccinations, medical conditions, treatments..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Temperament</label>
        <div className="flex flex-wrap gap-2">
          {TEMPERAMENT_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTemp(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                data.temperament.includes(tag)
                  ? 'bg-portal-primary-100 text-portal-primary-700 border border-portal-primary-300'
                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Special Needs</label>
          <textarea
            value={data.special_needs}
            onChange={(e) => onChange({ special_needs: e.target.value })}
            rows={2}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="Any special care requirements..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Dietary Needs</label>
          <textarea
            value={data.dietary_needs}
            onChange={(e) => onChange({ dietary_needs: e.target.value })}
            rows={2}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="Food restrictions, allergies..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Compatibility</label>
        <div className="space-y-3 bg-neutral-50 rounded-xl p-4">
          <TriToggle label="House-trained" value={data.is_house_trained} onValueChange={(v) => onChange({ is_house_trained: v })} />
          <TriToggle label="Good with dogs" value={data.good_with_dogs} onValueChange={(v) => onChange({ good_with_dogs: v })} />
          <TriToggle label="Good with cats" value={data.good_with_cats} onValueChange={(v) => onChange({ good_with_cats: v })} />
          <TriToggle label="Good with children" value={data.good_with_children} onValueChange={(v) => onChange({ good_with_children: v })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">Behavioral Notes</label>
        <textarea
          value={data.behavioral_notes}
          onChange={(e) => onChange({ behavioral_notes: e.target.value })}
          rows={2}
          className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          placeholder="General behavioral observations..."
        />
      </div>
    </div>
  );
}
