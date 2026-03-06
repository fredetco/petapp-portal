import { PortalHeader } from '../layout/PortalHeader';
import { useBusinessContext } from '../../context/BusinessContext';
import { StatCards } from './StatCards';
import { ActivityFeed } from './ActivityFeed';
import { UpcomingRemindersWidget } from './UpcomingReminders';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function DashboardPage() {
  const { stats, statsLoading } = useBusinessContext();

  return (
    <>
      <PortalHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        {statsLoading || !stats ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <StatCards stats={stats} />
        )}

        {/* Activity + Reminders side by side */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <ActivityFeed />
          </div>
          <div>
            <UpcomingRemindersWidget />
          </div>
        </div>
      </div>
    </>
  );
}
