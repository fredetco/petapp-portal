import { useQuery } from '@tanstack/react-query';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { fetchUpcomingReminders, type UpcomingReminder } from '../../services/analytics';
import { format } from 'date-fns';
import { Calendar, Bell } from 'lucide-react';

function ReminderRow({ reminder }: { reminder: UpcomingReminder }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="p-2 rounded-lg bg-portal-accent-400/10 text-portal-accent-500 shrink-0">
        <Bell size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">{reminder.title}</p>
        <p className="text-xs text-neutral-500">For {reminder.pet_name}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
        <Calendar size={12} />
        {format(new Date(reminder.scheduled_for), 'MMM d')}
      </div>
    </div>
  );
}

export function UpcomingRemindersWidget() {
  const { business } = usePortalAuth();

  const { data: reminders = [] } = useQuery({
    queryKey: ['upcoming-reminders', business?.id],
    queryFn: () => fetchUpcomingReminders(business!.id),
    enabled: !!business,
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-neutral-800 mb-4">Upcoming Reminders</h3>
      {reminders.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-6">
          No upcoming reminders scheduled.
        </p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {reminders.map((r) => (
            <ReminderRow key={r.id} reminder={r} />
          ))}
        </div>
      )}
    </div>
  );
}
