import { SPECIES_OPTIONS, type IntakeFormData } from '../../../services/shelterAnimals';

interface Props {
  data: IntakeFormData;
  onChange: (partial: Partial<IntakeFormData>) => void;
}

export function BasicInfoStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-neutral-800">Basic Information</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="Animal name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Species <span className="text-red-500">*</span>
          </label>
          <select
            value={data.species}
            onChange={(e) => onChange({ species: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          >
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s.toLowerCase()}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Breed</label>
          <input
            type="text"
            value={data.breed}
            onChange={(e) => onChange({ breed: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="e.g. Labrador Mix"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Sex</label>
          <select
            value={data.sex}
            onChange={(e) => onChange({ sex: e.target.value as IntakeFormData['sex'] })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          >
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Age (months)</label>
          <input
            type="number"
            value={data.estimated_age_months}
            onChange={(e) => onChange({ estimated_age_months: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="e.g. 24"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={data.weight}
              onChange={(e) => onChange({ weight: e.target.value })}
              className="flex-1 rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
              placeholder="0"
              min="0"
              step="0.1"
            />
            <select
              value={data.weight_unit}
              onChange={(e) => onChange({ weight_unit: e.target.value as IntakeFormData['weight_unit'] })}
              className="w-20 rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="g">g</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => onChange({ date_of_birth: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Color</label>
          <input
            type="text"
            value={data.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="e.g. Brown/White"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Microchip ID</label>
          <input
            type="text"
            value={data.microchip_id}
            onChange={(e) => onChange({ microchip_id: e.target.value })}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.is_neutered}
            onChange={(e) => onChange({ is_neutered: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-portal-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-portal-primary-500" />
        </label>
        <span className="text-sm font-semibold text-neutral-700">Spayed / Neutered</span>
      </div>
    </div>
  );
}
