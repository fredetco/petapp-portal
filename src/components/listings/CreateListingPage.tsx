import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { Button } from '../shared/Button';
import { fetchShelterAnimals, type ShelterAnimal } from '../../services/shelterAnimals';
import {
  createListing,
  buildDefaultTitle,
  FEE_INCLUDES_OPTIONS,
  DELIVERY_OPTIONS,
  INITIAL_LISTING_FORM,
  type ListingFormData,
} from '../../services/adoptionListings';
import { ListingPreviewCard } from './ListingPreviewCard';

export function CreateListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { business } = usePortalAuth();
  const queryClient = useQueryClient();

  const preselectedAnimalId = searchParams.get('animal') ?? '';

  const [form, setForm] = useState<ListingFormData>({
    ...INITIAL_LISTING_FORM,
    shelter_animal_id: preselectedAnimalId,
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['shelter-animals', business?.id],
    queryFn: () => fetchShelterAnimals(business!.id),
    enabled: !!business?.id,
  });

  // Only show animals that could be listed (available or intake)
  const listableAnimals = animals.filter(
    (a) => ['intake', 'available', 'medical_hold'].includes(a.status)
  );

  const selectedAnimal = animals.find((a) => a.id === form.shelter_animal_id);

  const onChange = (partial: Partial<ListingFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const handleAnimalSelect = (animal: ShelterAnimal) => {
    onChange({
      shelter_animal_id: animal.id,
      title: buildDefaultTitle(animal),
    });
  };

  const toggleArrayValue = (field: keyof ListingFormData, value: string) => {
    const arr = form[field] as string[];
    onChange({
      [field]: arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value],
    });
  };

  const mutation = useMutation({
    mutationFn: () => createListing(business!.id, form),
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ['adoption-listings'] });
      navigate(`/listings/${listing.id}`);
    },
  });

  const canSubmit = form.shelter_animal_id && form.title.trim() && form.description.trim();

  return (
    <>
      <PortalHeader title="Create Listing" />

      <div className="p-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/listings')}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to Listings
        </button>

        <div className="grid grid-cols-3 gap-6">
          {/* Form — left 2 cols */}
          <div className="col-span-2 space-y-6">
            {/* Animal selector */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-neutral-700 mb-3">Select Animal</h3>
              {listableAnimals.length === 0 ? (
                <p className="text-sm text-neutral-400">No animals available to list. Add an animal via intake first.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {listableAnimals.map((animal) => (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => handleAnimalSelect(animal)}
                      className={`p-2 rounded-xl border-2 text-left transition-colors ${
                        form.shelter_animal_id === animal.id
                          ? 'border-portal-primary-500 bg-portal-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-lg bg-neutral-100 overflow-hidden mb-1.5">
                        {animal.primary_photo_url ? (
                          <img src={animal.primary_photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300 font-bold">
                            {animal.name[0]}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-neutral-800 truncate">{animal.name}</p>
                      <p className="text-xs text-neutral-400 capitalize truncate">{animal.species}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing content */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-neutral-700">Listing Content</h3>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                  placeholder="Meet Luna — a gentle 3-year-old tabby"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                  placeholder="Tell the story of this animal — personality, background, what makes them special..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Description (French)
                </label>
                <textarea
                  value={form.description_fr}
                  onChange={(e) => onChange({ description_fr: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                  placeholder="Optional French translation..."
                />
              </div>
            </div>

            {/* Adoption terms */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-neutral-700">Adoption Terms</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Adoption Fee</label>
                  <div className="flex gap-2">
                    <span className="flex items-center text-neutral-500 text-sm">$</span>
                    <input
                      type="number"
                      value={form.adoption_fee}
                      onChange={(e) => onChange({ adoption_fee: e.target.value })}
                      className="flex-1 rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={form.fee_currency}
                      onChange={(e) => onChange({ fee_currency: e.target.value })}
                      className="w-20 rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                    >
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Fee Includes</label>
                <div className="flex flex-wrap gap-2">
                  {FEE_INCLUDES_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArrayValue('fee_includes', value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        form.fee_includes.includes(value)
                          ? 'bg-portal-primary-100 text-portal-primary-700 border-portal-primary-300'
                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {form.fee_includes.includes(value) && <Check size={12} className="inline mr-1" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => onChange({ requirements: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                  placeholder="Fenced yard required, no small children, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Delivery Options</label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArrayValue('delivery_options', value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        form.delivery_options.includes(value)
                          ? 'bg-portal-primary-100 text-portal-primary-700 border-portal-primary-300'
                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {form.delivery_options.includes(value) && <Check size={12} className="inline mr-1" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-neutral-700">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.location_city}
                    onChange={(e) => onChange({ location_city: e.target.value })}
                    className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                    placeholder="e.g. Montreal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Province / Region</label>
                  <input
                    type="text"
                    value={form.location_region}
                    onChange={(e) => onChange({ location_region: e.target.value })}
                    className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                    placeholder="e.g. QC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={form.location_postal_code}
                    onChange={(e) => onChange({ location_postal_code: e.target.value })}
                    className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                    placeholder="H2X 1Y4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Country</label>
                  <select
                    value={form.location_country}
                    onChange={(e) => onChange({ location_country: e.target.value })}
                    className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
                  >
                    <option value="CA">Canada</option>
                    <option value="US">United States</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-neutral-700">Settings</h3>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => onChange({ is_featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-portal-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                </label>
                <span className="text-sm text-neutral-700">Featured listing</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_urgent}
                    onChange={(e) => onChange({ is_urgent: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-portal-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500" />
                </label>
                <span className="text-sm text-neutral-700">Urgent / at-risk</span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || mutation.isPending}
              >
                {mutation.isPending ? 'Saving...' : 'Save as Draft'}
              </Button>
              <button
                onClick={() => navigate('/listings')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-600">
                Failed to save: {(mutation.error as Error).message}
              </p>
            )}
          </div>

          {/* Preview — right col */}
          <div className="col-span-1">
            <div className="sticky top-6">
              <h3 className="text-sm font-bold text-neutral-700 mb-3">Preview</h3>
              <ListingPreviewCard
                title={form.title}
                description={form.description}
                fee={parseFloat(form.adoption_fee) || 0}
                currency={form.fee_currency}
                animal={selectedAnimal ?? null}
                isUrgent={form.is_urgent}
                isFeatured={form.is_featured}
                feeIncludes={form.fee_includes}
                city={form.location_city}
                region={form.location_region}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
