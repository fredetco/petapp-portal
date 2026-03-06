import { useState } from 'react';
import { useRecords, useToggleRecordVisibility } from '../../hooks/useRecords';
import { RecordTimeline } from '../records/RecordTimeline';
import { AddRecordModal } from '../records/AddRecordModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Button } from '../shared/Button';
import { FileText, Plus } from 'lucide-react';

interface Props {
  petId: string;
  linkId: string | null;
  linkStatus: string;
}

export function PetRecordsTab({ petId, linkId, linkStatus }: Props) {
  const { data: records, isLoading } = useRecords(petId);
  const toggleVisibility = useToggleRecordVisibility();
  const [showAddModal, setShowAddModal] = useState(false);

  const canAddRecords = linkStatus === 'active';

  const handleToggleVisibility = (recordId: string, visible: boolean) => {
    toggleVisibility.mutate({ recordId, visible });
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
      {/* Add button */}
      {canAddRecords && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<Plus size={16} />}
            size="sm"
          >
            Add Record
          </Button>
        </div>
      )}

      {!records || records.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <EmptyState
            icon={<FileText size={48} />}
            title="No records yet"
            description={
              canAddRecords
                ? "Add the first medical record for this pet."
                : "Records will be available once the link is active."
            }
            actionLabel={canAddRecords ? 'Add Record' : undefined}
            onAction={canAddRecords ? () => setShowAddModal(true) : undefined}
          />
        </div>
      ) : (
        <RecordTimeline
          records={records}
          showPetName={false}
          onToggleVisibility={handleToggleVisibility}
        />
      )}

      {showAddModal && (
        <AddRecordModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          petId={petId}
          serviceLinkId={linkId}
        />
      )}
    </>
  );
}
