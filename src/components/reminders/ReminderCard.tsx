import { format, isPast, isFuture } from 'date-fns';
import type { BusinessReminder, ReminderType } from '../../types/reminder';
import { REMINDER_TYPE_META } from '../../types/reminder';
import { Badge } from '../shared/Badge';
import {
  Syringe,
  Stethoscope,
  CalendarCheck,
  Clock,
  Sparkles,
  GraduationCap,
  Pill,
  Bell as BellIcon,
  X,
} from 'lucide-react';

const iconMap: Record<string, typeof BellIcon> = {
  Syringe,
  Stethoscope,
  CalendarCheck,
  Clock,
  Sparkles,
  GraduationCap,
  Pill,
  Bell: BellIcon,
};

interface Props {
  reminder: BusinessReminder & { pet_name?: string };
  showPetName?: boolean;
  onCancel?: (reminderId: string) => void;
}

const statusBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger'; label: string }> = {
  scheduled: { variant: 'info' as 'default', label: 'Scheduled' },
  sent: { variant: 'success', label: 'Sent' },
  cancelled: { variant: 'default', label: 'Cancelled' },
  failed: { variant: 'danger', label: 'Failed' },
};

export function ReminderCard({ reminder, showPetName = false, onCancel }: Props) {
  const meta = REMINDER_TYPE_META[reminder.type as ReminderType];
  const IconComponent = iconMap[meta?.icon ?? 'Bell'] ?? BellIcon;
  const badge = statusBadge[reminder.status] ?? statusBadge.scheduled;
  const isOverdue = reminder.status === 'scheduled' && isPast(new Date(reminder.scheduled_for));
  const isUpcoming = reminder.status === 'scheduled' && isFuture(new Date(reminder.scheduled_for));

  return (
    <div className={`flex gap-4 p-4 hover:bg-neutral-50 transition-colors ${isOverdue ? 'bg-red-50/50' : ''}`}>
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-portal-primary-50 flex items-center justify-center shrink-0">
        <IconComponent size={18} className="text-portal-primary-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-neutral-800 truncate">{reminder.title}</span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {isOverdue && <Badge variant="danger">Overdue</Badge>}
          {showPetName && reminder.pet_name && (
            <span className="text-xs text-neutral-400 truncate">{reminder.pet_name}</span>
          )}
        </div>
        <p className="text-xs text-neutral-500 line-clamp-2">{reminder.message}</p>
        <p className="text-xs text-neutral-400 mt-1">
          {meta?.label ?? reminder.type}
        </p>
      </div>

      {/* Scheduled time + actions */}
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <span className={`text-xs ${isOverdue ? 'text-danger font-semibold' : isUpcoming ? 'text-portal-primary-600' : 'text-neutral-400'}`}>
          {format(new Date(reminder.scheduled_for), 'MMM d, yyyy')}
        </span>
        <span className="text-xs text-neutral-400">
          {format(new Date(reminder.scheduled_for), 'h:mm a')}
        </span>
        {reminder.status === 'scheduled' && onCancel && (
          <button
            onClick={() => onCancel(reminder.id)}
            className="p-1 rounded-lg text-neutral-300 hover:text-danger hover:bg-red-50 transition-colors mt-1"
            title="Cancel reminder"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
