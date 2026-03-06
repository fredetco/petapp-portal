import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { useCreateReminder } from '../../hooks/useReminders';
import { REMINDER_TYPE_META, type ReminderType } from '../../types/reminder';
import { TIER_LIMITS } from '../../types/business';
import { format, addDays } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  petId: string;
  serviceLinkId: string | null;
}

const REMINDER_TYPES = Object.entries(REMINDER_TYPE_META).map(([key, meta]) => ({
  value: key as ReminderType,
  label: meta.label,
}));

export function CreateReminderModal({ open, onClose, petId, serviceLinkId }: Props) {
  const { business } = usePortalAuth();
  const createReminder = useCreateReminder();

  const [reminderType, setReminderType] = useState<ReminderType>('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [error, setError] = useState('');

  // Check tier limits
  const tierLimit = business ? TIER_LIMITS[business.portal_tier].monthlyRemindersPerPet : 0;
  const canSendReminders = tierLimit > 0;

  const resetForm = () => {
    setReminderType('general');
    setTitle('');
    setMessage('');
    setScheduledDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    setScheduledTime('09:00');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!business) return;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    const scheduledFor = `${scheduledDate}T${scheduledTime}:00`;

    setError('');
    try {
      await createReminder.mutateAsync({
        businessId: business.id,
        petId,
        serviceLinkId,
        title: title.trim(),
        message: message.trim(),
        type: reminderType,
        scheduledFor,
      });
      handleClose();
    } catch {
      setError('Failed to create reminder. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Schedule Reminder" size="md">
      <div className="space-y-4">
        {!canSendReminders && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800">Upgrade Required</p>
            <p className="text-xs text-amber-600 mt-1">
              Your current plan doesn&apos;t include reminders. Upgrade to Pro or Enterprise to send care reminders.
            </p>
          </div>
        )}

        {/* Reminder type */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Reminder Type
          </label>
          <select
            value={reminderType}
            onChange={(e) => setReminderType(e.target.value as ReminderType)}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            disabled={!canSendReminders}
          >
            {REMINDER_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Vaccination Due - Rabies"
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            disabled={!canSendReminders}
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Message the pet owner will receive..."
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            disabled={!canSendReminders}
          />
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
              disabled={!canSendReminders}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
              disabled={!canSendReminders}
            />
          </div>
        </div>

        {/* Tier info */}
        {canSendReminders && (
          <p className="text-xs text-neutral-400">
            Your plan allows up to {tierLimit === Infinity ? 'unlimited' : tierLimit} reminders per pet per month.
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-xl p-3">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createReminder.isPending}
            disabled={!canSendReminders}
            className="flex-1"
          >
            Schedule Reminder
          </Button>
        </div>
      </div>
    </Modal>
  );
}
