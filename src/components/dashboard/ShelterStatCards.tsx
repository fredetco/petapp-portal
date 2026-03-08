import { Heart, List, ClipboardList, CalendarCheck, CalendarDays, RotateCcw } from 'lucide-react';
import type { ShelterDashboardStats } from '../../services/analytics';

interface Props {
  stats: ShelterDashboardStats;
}

const cards = [
  { key: 'animalsInCare',       icon: Heart,         label: 'Animals in Care',       color: 'text-portal-primary-500 bg-portal-primary-50' },
  { key: 'activeListings',      icon: List,          label: 'Active Listings',       color: 'text-success bg-green-50' },
  { key: 'pendingApplications', icon: ClipboardList, label: 'Pending Applications',  color: 'text-warning bg-amber-50' },
  { key: 'adoptionsThisMonth',  icon: CalendarCheck, label: 'Adoptions This Month',  color: 'text-portal-accent-500 bg-orange-50' },
  { key: 'adoptionsThisYear',   icon: CalendarDays,  label: 'Adoptions This Year',   color: 'text-blue-500 bg-blue-50' },
  { key: 'returnRate',          icon: RotateCcw,     label: 'Return Rate',           color: 'text-neutral-500 bg-neutral-50', suffix: '%' },
] as const;

export function ShelterStatCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ key, icon: Icon, label, color, ...rest }) => (
        <div key={key} className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-neutral-800">
            {stats[key]}{'suffix' in rest ? rest.suffix : ''}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
