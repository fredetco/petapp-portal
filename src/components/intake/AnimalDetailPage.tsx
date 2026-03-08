import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star, Edit2, Calendar, Weight, Heart, AlertTriangle, Clipboard } from 'lucide-react';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import {
  fetchShelterAnimal,
  updateAnimalStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  type AnimalStatus,
  type ShelterAnimal,
} from '../../services/shelterAnimals';

const TABS = ['Overview', 'Health Log', 'Listing', 'Applications', 'Notes'] as const;
type Tab = (typeof TABS)[number];

const STATUS_TRANSITIONS: Record<AnimalStatus, AnimalStatus[]> = {
  intake: ['medical_hold', 'available'],
  medical_hold: ['available', 'transferred', 'deceased'],
  available: ['application_pending', 'foster', 'transferred'],
  application_pending: ['adoption_pending', 'available'],
  adoption_pending: ['adopted', 'available'],
  adopted: ['returned'],
  foster: ['available', 'adopted', 'transferred'],
  transferred: [],
  returned: ['intake', 'available'],
  deceased: [],
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm text-neutral-800">{value}</p>
      </div>
    </div>
  );
}

function OverviewTab({ animal }: { animal: ShelterAnimal }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-1">
        <InfoRow icon={Clipboard} label="Species / Breed" value={`${animal.species} ${animal.breed ? `— ${animal.breed}` : ''}`} />
        <InfoRow icon={Calendar} label="Age" value={animal.estimated_age_months ? `${animal.estimated_age_months} months` : 'Unknown'} />
        <InfoRow icon={Weight} label="Weight" value={animal.weight ? `${animal.weight} ${animal.weight_unit}` : null} />
        <InfoRow icon={Clipboard} label="Sex" value={animal.sex} />
        <InfoRow icon={Clipboard} label="Color" value={animal.color} />
        <InfoRow icon={Clipboard} label="Microchip" value={animal.microchip_id} />
        <InfoRow icon={Clipboard} label="Neutered" value={animal.is_neutered ? 'Yes' : 'No'} />
      </div>

      {/* Right column */}
      <div className="space-y-1">
        <InfoRow icon={Calendar} label="Intake Date" value={animal.intake_date} />
        <InfoRow icon={Clipboard} label="Intake Type" value={animal.intake_type.replace('_', ' ')} />
        <InfoRow icon={AlertTriangle} label="Condition" value={animal.intake_condition?.replace('_', ' ')} />
        <InfoRow icon={Clipboard} label="Source" value={animal.source_info} />
        <InfoRow icon={Heart} label="Care Complexity" value={animal.care_complexity_score ? `${animal.care_complexity_score} / 5` : null} />
      </div>

      {/* Compatibility */}
      <div className="col-span-2">
        <h4 className="text-sm font-bold text-neutral-700 mb-2">Compatibility</h4>
        <div className="flex gap-4">
          {[
            { label: 'Dogs', value: animal.good_with_dogs },
            { label: 'Cats', value: animal.good_with_cats },
            { label: 'Children', value: animal.good_with_children },
            { label: 'House-trained', value: animal.is_house_trained },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 ${
                value === true ? 'bg-green-100 text-green-700' :
                value === false ? 'bg-red-100 text-red-700' :
                'bg-neutral-100 text-neutral-400'
              }`}>
                {value === true ? 'Y' : value === false ? 'N' : '?'}
              </div>
              <span className="text-xs text-neutral-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Temperament */}
      {animal.temperament?.length > 0 && (
        <div className="col-span-2">
          <h4 className="text-sm font-bold text-neutral-700 mb-2">Temperament</h4>
          <div className="flex flex-wrap gap-1.5">
            {animal.temperament.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-portal-primary-50 text-portal-primary-700 text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {(animal.health_notes || animal.behavioral_notes || animal.special_needs || animal.dietary_needs || animal.intake_notes) && (
        <div className="col-span-2 space-y-3">
          {animal.health_notes && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 mb-1">Health Notes</h4>
              <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl p-3">{animal.health_notes}</p>
            </div>
          )}
          {animal.behavioral_notes && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 mb-1">Behavioral Notes</h4>
              <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl p-3">{animal.behavioral_notes}</p>
            </div>
          )}
          {animal.special_needs && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 mb-1">Special Needs</h4>
              <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl p-3">{animal.special_needs}</p>
            </div>
          )}
          {animal.dietary_needs && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 mb-1">Dietary Needs</h4>
              <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl p-3">{animal.dietary_needs}</p>
            </div>
          )}
          {animal.intake_notes && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 mb-1">Intake Notes</h4>
              <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl p-3">{animal.intake_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-neutral-400">
      <p className="text-sm">{label} — coming in a future step</p>
    </div>
  );
}

export function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business } = usePortalAuth();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('Overview');

  const { data: animal, isLoading } = useQuery({
    queryKey: ['shelter-animal', id],
    queryFn: () => fetchShelterAnimal(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: AnimalStatus) => updateAnimalStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelter-animal', id] });
      queryClient.invalidateQueries({ queryKey: ['shelter-animals'] });
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard-stats'] });
    },
  });

  if (isLoading) {
    return (
      <>
        <PortalHeader title="Animal Details" />
        <div className="p-6 text-center text-neutral-400">Loading...</div>
      </>
    );
  }

  if (!animal) {
    return (
      <>
        <PortalHeader title="Animal Details" />
        <div className="p-6 text-center text-neutral-400">Animal not found.</div>
      </>
    );
  }

  const allowedTransitions = STATUS_TRANSITIONS[animal.status] ?? [];

  return (
    <>
      <PortalHeader title={animal.name} />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate('/intake')}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to Animals
        </button>

        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex">
            {/* Photo */}
            <div className="w-48 h-48 bg-neutral-100 flex-shrink-0">
              {animal.primary_photo_url ? (
                <img src={animal.primary_photo_url} alt={animal.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-4xl font-bold">
                  {animal.name[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-neutral-800">{animal.name}</h2>
                  <p className="text-sm text-neutral-500 capitalize">
                    {animal.species} {animal.breed ? `— ${animal.breed}` : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[animal.status]}`}>
                  {STATUS_LABELS[animal.status]}
                </span>
              </div>

              {/* Photo thumbnails */}
              {animal.photo_urls?.length > 1 && (
                <div className="flex gap-1.5 mt-3">
                  {animal.photo_urls.slice(0, 6).map((url) => (
                    <div key={url} className="relative w-10 h-10 rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {animal.primary_photo_url === url && (
                        <div className="absolute top-0 left-0 bg-amber-400 text-white p-px rounded-br">
                          <Star size={8} fill="white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Status transitions */}
              {allowedTransitions.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-neutral-400">Move to:</span>
                  {allowedTransitions.map((s) => (
                    <button
                      key={s}
                      onClick={() => statusMutation.mutate(s)}
                      disabled={statusMutation.isPending}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors hover:opacity-80 ${STATUS_COLORS[s]} border-current/20`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-neutral-200 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-portal-primary-500 text-portal-primary-600'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {tab === 'Overview' && <OverviewTab animal={animal} />}
          {tab === 'Health Log' && <PlaceholderTab label="Health Log" />}
          {tab === 'Listing' && <PlaceholderTab label="Listing Manager" />}
          {tab === 'Applications' && <PlaceholderTab label="Adoption Applications" />}
          {tab === 'Notes' && <PlaceholderTab label="Staff Notes" />}
        </div>
      </div>
    </>
  );
}
