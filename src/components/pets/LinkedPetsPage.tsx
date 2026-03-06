import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalHeader } from '../layout/PortalHeader';
import { useLinkedPets, type LinkedPetRow } from '../../hooks/useLinkedPets';
import { PendingLinksCard } from './PendingLinksCard';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Badge } from '../shared/Badge';
import { formatDistanceToNow } from 'date-fns';
import { PawPrint, Search, ChevronRight } from 'lucide-react';

export function LinkedPetsPage() {
  const navigate = useNavigate();
  const { data: pets, isLoading } = useLinkedPets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');

  const { activePets, pendingPets, filtered } = useMemo(() => {
    const all = pets ?? [];
    const active = all.filter((p) => p.status === 'active');
    const pending = all.filter((p) => p.status === 'pending');

    let list: LinkedPetRow[];
    if (statusFilter === 'active') list = active;
    else if (statusFilter === 'pending') list = pending;
    else list = all;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.petName.toLowerCase().includes(q) ||
          p.species.toLowerCase().includes(q) ||
          (p.breed && p.breed.toLowerCase().includes(q)) ||
          (p.ownerName && p.ownerName.toLowerCase().includes(q)),
      );
    }

    return { activePets: active, pendingPets: pending, filtered: list };
  }, [pets, search, statusFilter]);

  return (
    <>
      <PortalHeader title="Linked Pets" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : !pets || pets.length === 0 ? (
          <EmptyState
            icon={<PawPrint size={48} />}
            title="No linked pets yet"
            description="Scan a pet's QR code or use manual lookup to create your first link request."
            actionLabel="Go to Scanner"
            onAction={() => navigate('/scanner')}
          />
        ) : (
          <>
            {/* Pending links banner */}
            <PendingLinksCard pendingLinks={pendingPets} />

            {/* Search + filter bar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pets, owners..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
                />
              </div>

              <div className="flex bg-neutral-100 rounded-lg p-0.5">
                {(['all', 'active', 'pending'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${
                      statusFilter === s
                        ? 'bg-white text-portal-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {s}
                    {s === 'active' && ` (${activePets.length})`}
                    {s === 'pending' && ` (${pendingPets.length})`}
                    {s === 'all' && ` (${(pets ?? []).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Pet list */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-sm">
                No pets match your search.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100">
                {filtered.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => navigate(`/pets/${pet.petId}`)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
                  >
                    {/* Pet avatar */}
                    <div className="w-12 h-12 rounded-xl bg-portal-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {pet.photoUrl ? (
                        <img src={pet.photoUrl} alt={pet.petName} className="w-full h-full object-cover" />
                      ) : (
                        <PawPrint size={20} className="text-portal-primary-400" />
                      )}
                    </div>

                    {/* Pet info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-neutral-800 truncate">{pet.petName}</span>
                        <Badge variant={pet.status === 'active' ? 'success' : 'warning'}>
                          {pet.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {pet.species}{pet.breed ? ` \u2022 ${pet.breed}` : ''}
                        {pet.ownerName ? ` \u2022 Owner: ${pet.ownerName}` : ''}
                      </p>
                    </div>

                    {/* Linked time */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-neutral-400">
                        {pet.linkedAt
                          ? `Linked ${formatDistanceToNow(new Date(pet.linkedAt), { addSuffix: true })}`
                          : `Requested ${formatDistanceToNow(new Date(pet.createdAt), { addSuffix: true })}`
                        }
                      </p>
                    </div>

                    <ChevronRight size={16} className="text-neutral-300 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
