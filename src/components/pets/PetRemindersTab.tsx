import { useState } from 'react';
import { useReminders, useCancelReminder } from '../../hooks/useReminders';
import { ReminderCard } from '../reminders/ReminderCard';
import { CreateReminderModal } from '../reminders/CreateReminderModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Button } from '../shared/Button';
import { Bell, Plus } from 'lucide-react';

interface Props {
  petId: string;
  linkId: string | null;
  linkStatus: string;
}

export function PetRemindersTab({ petId, linkId, linkStatus }: Props) {
  const { data: reminders, isLoading } = useReminders(petId);
  const cancelReminder = useCancelReminder();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canSchedule = linkStatus === 'active';

  const handleCancel = (reminderId: string) => {
    cancelReminder.mutate(reminderId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Schedule button */}
      {canSchedule && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<Plus size={16} />}
            size="sm"
          >
            Schedule Reminder
          </Button>
        </div>
      )}

      {!reminders || reminders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <EmptyState
            icon={<Bell size={48} />}
            title="No reminders yet"
            description={
              canSchedule
                ? "Schedule the first care reminder for this pet."
                : "Reminders will be available once the link is active."
            }
            actionLabel={canSchedule ? 'Schedule Reminder' : undefined}
            onAction={canSchedule ? () => setShowCreateModal(true) : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              showPetName={false}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateReminderModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          petId={petId}
          serviceLinkId={linkId}
        />
      )}
    </>
  );
}
