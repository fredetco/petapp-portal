import { useState, useMemo } from 'react';
import { PortalHeader } from '../layout/PortalHeader';
import { useReminders, useCancelReminder } from '../../hooks/useReminders';
import { useLinkedPets } from '../../hooks/useLinkedPets';
import { ReminderCard } from './ReminderCard';
import { CreateReminderModal } from './CreateReminderModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Button } from '../shared/Button';
import { Bell, Plus, Search, Filter } from 'lucide-react';
import type { ReminderStatus } from '../../types/reminder';

export function RemindersPage() {
  const { data: reminders, isLoading } = useReminders();
  const { data: linkedPets } = useLinkedPets();
  const cancelReminder = useCancelReminder();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | ''>('');
  const [search, setSearch] = useState('');

  const activePets = useMemo(
    () => (linkedPets ?? []).filter((p) => p.status === 'active'),
    [linkedPets],
  );

  const filtered = useMemo(() => {
    let list = reminders ?? [];

    if (selectedPetId) {
      list = list.filter((r) => r.pet_id === selectedPetId);
    }
    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.message.toLowerCase().includes(q) ||
          (r.pet_name && r.pet_name.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [reminders, selectedPetId, statusFilter, search]);

  const handleCancel = (reminderId: string) => {
    cancelReminder.mutate(reminderId);
  };

  const createModalPetId = selectedPetId || activePets[0]?.petId || '';
  const createModalLinkId = activePets.find((p) => p.petId === createModalPetId)?.id ?? null;

  return (
    <>
      <PortalHeader title="Reminders" />
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
                    placeholder="Search reminders..."
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

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ReminderStatus | '')}
                  className="px-3 py-2 rounded-xl border-neutral-300 text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <Button
                onClick={() => setShowCreateModal(true)}
                icon={<Plus size={16} />}
                disabled={activePets.length === 0}
              >
                Schedule Reminder
              </Button>
            </div>

            {/* Content */}
            {!reminders || reminders.length === 0 ? (
              <EmptyState
                icon={<Bell size={48} />}
                title="No reminders yet"
                description="Schedule care reminders for your linked pets. Owners will be notified at the scheduled time."
                actionLabel={activePets.length > 0 ? 'Schedule First Reminder' : undefined}
                onAction={activePets.length > 0 ? () => setShowCreateModal(true) : undefined}
              />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-sm">
                No reminders match your filters.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100">
                {filtered.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    showPetName={!selectedPetId}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}

            {/* Create reminder modal */}
            {showCreateModal && createModalPetId && (
              <CreateReminderModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                petId={createModalPetId}
                serviceLinkId={createModalLinkId}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
