import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortalHeader } from '../layout/PortalHeader';
import { usePetDetail } from '../../hooks/useLinkedPets';
import { revokeLink } from '../../services/linking';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { Modal } from '../shared/Modal';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { PetRecordsTab } from './PetRecordsTab';
import {
  PawPrint,
  ArrowLeft,
  Calendar,
  Weight,
  User,
  LinkIcon,
  FileText,
  Bell,
  Unlink,
  AlertCircle,
} from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';

type Tab = 'overview' | 'records' | 'reminders';

function getAge(dob: string): string {
  const d = new Date(dob);
  const years = differenceInYears(new Date(), d);
  if (years >= 1) return `${years} year${years !== 1 ? 's' : ''} old`;
  const months = differenceInMonths(new Date(), d);
  return `${months} month${months !== 1 ? 's' : ''} old`;
}

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { data: detail, isLoading } = usePetDetail(petId ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState('');

  const handleRevoke = async () => {
    if (!detail) return;
    setRevokeError('');
    setRevoking(true);
    try {
      await revokeLink(detail.linkId, 'business');
      navigate('/pets');
    } catch {
      setRevokeError('Failed to revoke link. Please try again.');
    } finally {
      setRevoking(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PortalHeader title="Pet Details" />
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <PortalHeader title="Pet Details" />
        <div className="p-6">
          <EmptyState
            icon={<PawPrint size={48} />}
            title="Pet not found"
            description="This pet may have been unlinked or doesn't exist."
            actionLabel="Back to Linked Pets"
            onAction={() => navigate('/pets')}
          />
        </div>
      </>
    );
  }

  const { pet } = detail;

  const tabs: { key: Tab; label: string; icon: typeof FileText; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: PawPrint },
    { key: 'records', label: 'Records', icon: FileText, count: detail.recordsCount },
    { key: 'reminders', label: 'Reminders', icon: Bell, count: detail.remindersCount },
  ];

  return (
    <>
      <PortalHeader title={pet.name} />
      <div className="p-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/pets')}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Linked Pets
        </button>

        {/* Pet header card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Photo */}
            <div className="w-20 h-20 rounded-2xl bg-portal-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
              {pet.photoUrl ? (
                <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <PawPrint size={32} className="text-portal-primary-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-neutral-800">{pet.name}</h2>
                <Badge variant={detail.linkStatus === 'active' ? 'success' : 'warning'}>
                  {detail.linkStatus}
                </Badge>
              </div>
              <p className="text-sm text-neutral-500 mb-3">
                {pet.species}{pet.breed ? ` \u2022 ${pet.breed}` : ''}
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                {pet.dateOfBirth && (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Calendar size={14} className="text-neutral-400" />
                    <span>{getAge(pet.dateOfBirth)}</span>
                    <span className="text-neutral-400">({format(new Date(pet.dateOfBirth), 'MMM d, yyyy')})</span>
                  </div>
                )}
                {pet.weightKg && (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Weight size={14} className="text-neutral-400" />
                    <span>{pet.weightKg} kg</span>
                  </div>
                )}
                {pet.ownerName && (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <User size={14} className="text-neutral-400" />
                    <span>{pet.ownerName}</span>
                  </div>
                )}
                {detail.linkedAt && (
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <LinkIcon size={14} className="text-neutral-400" />
                    <span>Linked {format(new Date(detail.linkedAt), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Revoke button */}
            {detail.linkStatus === 'active' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRevokeModal(true)}
                icon={<Unlink size={14} />}
                className="text-danger hover:bg-red-50 shrink-0"
              >
                Revoke Link
              </Button>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-neutral-200 mb-6">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-portal-primary-500 text-portal-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon size={16} />
              {label}
              {count !== undefined && count > 0 && (
                <span className="bg-neutral-100 text-neutral-600 text-xs px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Pet details card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-neutral-800 mb-4">Pet Information</h3>
              <dl className="space-y-3">
                <DetailRow label="Species" value={pet.species} />
                <DetailRow label="Breed" value={pet.breed ?? 'Unknown'} />
                <DetailRow label="Date of Birth" value={pet.dateOfBirth ? format(new Date(pet.dateOfBirth), 'MMMM d, yyyy') : 'Not set'} />
                <DetailRow label="Weight" value={pet.weightKg ? `${pet.weightKg} kg` : 'Not recorded'} />
              </dl>
            </div>

            {/* Link details card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-neutral-800 mb-4">Link Details</h3>
              <dl className="space-y-3">
                <DetailRow label="Status" value={detail.linkStatus} />
                <DetailRow label="Service Category" value={detail.serviceCategory ?? 'N/A'} />
                <DetailRow label="Linked Since" value={detail.linkedAt ? format(new Date(detail.linkedAt), 'MMMM d, yyyy') : 'Pending'} />
                <DetailRow label="Records Added" value={String(detail.recordsCount)} />
                <DetailRow label="Reminders Sent" value={String(detail.remindersCount)} />
              </dl>
            </div>

            {/* Owner card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-neutral-800 mb-4">Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                  {pet.ownerAvatar ? (
                    <img src={pet.ownerAvatar} alt={pet.ownerName ?? 'Owner'} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-neutral-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    {pet.ownerName ?? 'Unknown Owner'}
                  </p>
                  <p className="text-xs text-neutral-400">Pet Owner</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <PetRecordsTab
            petId={pet.id}
            linkId={detail.linkId}
            linkStatus={detail.linkStatus}
          />
        )}

        {activeTab === 'reminders' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <EmptyState
              icon={<Bell size={48} />}
              title="Care Reminders"
              description="Reminders for this pet will appear here. Use the Reminders page to schedule new ones."
              actionLabel="Go to Reminders"
              onAction={() => navigate('/reminders')}
            />
          </div>
        )}

        {/* Revoke link modal */}
        <Modal
          open={showRevokeModal}
          onClose={() => setShowRevokeModal(false)}
          title="Revoke Link"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-danger/10 rounded-xl p-4">
              <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  Are you sure you want to revoke this link?
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  You will lose access to <strong>{pet.name}</strong>&apos;s records and won&apos;t be
                  able to send reminders. The owner will be notified.
                </p>
              </div>
            </div>

            {revokeError && (
              <div className="bg-danger/10 text-danger text-sm rounded-xl p-3">{revokeError}</div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowRevokeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevoke}
                loading={revoking}
                className="flex-1"
              >
                Revoke Link
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="text-sm font-medium text-neutral-800 capitalize">{value}</dd>
    </div>
  );
}
