import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import {
  fetchShelterAnimals,
  STATUS_LABELS,
  STATUS_COLORS,
  type AnimalStatus,
  type ShelterAnimal,
} from '../../services/shelterAnimals';

const FILTER_TABS: { label: string; statuses: AnimalStatus[] | null }[] = [
  { label: 'All', statuses: null },
  { label: 'Intake', statuses: ['intake'] },
  { label: 'Available', statuses: ['available'] },
  { label: 'Pending', statuses: ['application_pending', 'adoption_pending'] },
  { label: 'Adopted', statuses: ['adopted'] },
  { label: 'Foster', statuses: ['foster'] },
];

function AnimalRow({ animal, onClick }: { animal: ShelterAnimal; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
    >
      {/* Photo */}
      <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
        {animal.primary_photo_url ? (
          <img src={animal.primary_photo_url} alt={animal.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{animal.species === 'dog' ? '\u{1F436}' : animal.species === 'cat' ? '\u{1F431}' : '\u{1F43E}'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-neutral-800 truncate">{animal.name}</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[animal.status]}`}>
            {STATUS_LABELS[animal.status]}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          {animal.species} {animal.breed ? `\u00B7 ${animal.breed}` : ''} \u00B7 {animal.sex}
          {animal.estimated_age_months != null && ` \u00B7 ${animal.estimated_age_months < 12 ? `${animal.estimated_age_months}mo` : `${Math.round(animal.estimated_age_months / 12)}yr`}`}
        </p>
      </div>

      {/* Intake date + arrow */}
      <span className="text-xs text-neutral-400 shrink-0">{animal.intake_date}</span>
      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
    </button>
  );
}

export function IntakeListPage() {
  const navigate = useNavigate();
  const { business } = usePortalAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');

  const { data: animals, isLoading } = useQuery({
    queryKey: ['shelter-animals', business?.id],
    queryFn: () => fetchShelterAnimals(business!.id),
    enabled: !!business,
  });

  const filtered = useMemo(() => {
    if (!animals) return [];
    let result = animals;

    const tab = FILTER_TABS[activeTab];
    if (tab.statuses) {
      result = result.filter((a) => tab.statuses!.includes(a.status));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.species.toLowerCase().includes(q) ||
          a.breed.toLowerCase().includes(q) ||
          (a.microchip_id?.toLowerCase().includes(q) ?? false),
      );
    }

    return result;
  }, [animals, activeTab, search]);

  return (
    <>
      <PortalHeader
        title="Animal Intake"
        action={
          <button
            onClick={() => navigate('/intake/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-portal-primary-500 text-white text-sm font-semibold hover:bg-portal-primary-600 transition-colors"
          >
            <Plus size={16} />
            New Intake
          </button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Search + filter tabs */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search animals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500"
            />
          </div>

          <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
            {FILTER_TABS.map((tab, i) => {
              const count = animals
                ? tab.statuses
                  ? animals.filter((a) => tab.statuses!.includes(a.status)).length
                  : animals.length
                : 0;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === i
                      ? 'bg-white text-neutral-800 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : !animals?.length ? (
          <EmptyState
            icon={<span className="text-4xl">{'\u{1F43E}'}</span>}
            title="No animals yet"
            description="Register your first animal to get started with intake management."
            actionLabel="New Intake"
            onAction={() => navigate('/intake/new')}
          />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-12">No animals match your filters.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100">
            {filtered.map((animal) => (
              <AnimalRow
                key={animal.id}
                animal={animal}
                onClick={() => navigate(`/intake/${animal.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
