import { PawPrint, Clock, FileText, Bell } from 'lucide-react';
import type { DashboardStats } from '../../services/analytics';

interface Props {
  stats: DashboardStats;
}

const cards = [
  { key: 'linkedPets',        icon: PawPrint, label: 'Linked Pets',         color: 'text-portal-primary-500 bg-portal-primary-50' },
  { key: 'pendingLinks',      icon: Clock,    label: 'Pending Links',       color: 'text-warning bg-amber-50' },
  { key: 'totalRecords',      icon: FileText, label: 'Total Records',       color: 'text-success bg-green-50' },
  { key: 'scheduledReminders', icon: Bell,     label: 'Scheduled Reminders', color: 'text-portal-accent-500 bg-orange-50' },
] as const;

export function StatCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ key, icon: Icon, label, color }) => (
        <div key={key} className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-neutral-800">{stats[key]}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
