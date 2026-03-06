import { useState, useMemo } from 'react';
import { PortalHeader } from '../layout/PortalHeader';
import { useRecords, useToggleRecordVisibility } from '../../hooks/useRecords';
import { RecordTimeline } from './RecordTimeline';
import { AddRecordModal } from './AddRecordModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Button } from '../shared/Button';
import { useLinkedPets } from '../../hooks/useLinkedPets';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import type { RecordType } from '../../types/businessRecord';
import { RECORD_TYPE_META } from '../../types/businessRecord';

export function RecordsPage() {
  const { data: records, isLoading } = useRecords();
  const { data: linkedPets } = useLinkedPets();
  const toggleVisibility = useToggleRecordVisibility();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<RecordType | ''>('');

  // Get active linked pets for the "add record" modal
  const activePets = useMemo(
    () => (linkedPets ?? []).filter((p) => p.status === 'active'),
    [linkedPets],
  );

  const filtered = useMemo(() => {
    let list = records ?? [];

    if (selectedPetId) {
      list = list.filter((r) => r.pet_id === selectedPetId);
    }
    if (typeFilter) {
      list = list.filter((r) => r.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q)) ||
          (r.pet_name && r.pet_name.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [records, selectedPetId, typeFilter, search]);

  const handleToggleVisibility = (recordId: string, visible: boolean) => {
    toggleVisibility.mutate({ recordId, visible });
  };

  // For the add modal — choose first active pet if none selected
  const addModalPetId = selectedPetId || activePets[0]?.petId || '';
  const addModalLinkId = activePets.find((p) => p.petId === addModalPetId)?.id ?? null;

  return (
    <>
      <PortalHeader title="Records" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative max-w-sm">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search records..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
                  />
                </div>

                {/* Pet filter */}
                <div className="relative">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <select
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="pl-8 pr-8 py-2 rounded-xl border-neutral-300 text-sm appearance-none bg-white"
                  >
                    <option value="">All pets</option>
                    {activePets.map((p) => (
                      <option key={p.petId} value={p.petId}>{p.petName}</option>
                    ))}
                  </select>
                </div>

                {/* Type filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as RecordType | '')}
                  className="px-3 py-2 rounded-xl border-neutral-300 text-sm"
                >
                  <option value="">All types</option>
                  {Object.entries(RECORD_TYPE_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.label}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => setShowAddModal(true)}
                icon={<Plus size={16} />}
                disabled={activePets.length === 0}
              >
                Add Record
              </Button>
            </div>

            {/* Content */}
            {!records || records.length === 0 ? (
              <EmptyState
                icon={<FileText size={48} />}
                title="No records yet"
                description="Add medical records, grooming sessions, or training notes for your linked pets."
                actionLabel={activePets.length > 0 ? 'Add First Record' : undefined}
                onAction={activePets.length > 0 ? () => setShowAddModal(true) : undefined}
              />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-sm">
                No records match your filters.
              </div>
            ) : (
              <RecordTimeline
                records={filtered}
                showPetName={!selectedPetId}
                onToggleVisibility={handleToggleVisibility}
              />
            )}

            {/* Add record modal */}
            {showAddModal && addModalPetId && (
              <AddRecordModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                petId={addModalPetId}
                serviceLinkId={addModalLinkId}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
