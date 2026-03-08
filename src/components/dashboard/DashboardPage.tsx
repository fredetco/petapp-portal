import { PortalHeader } from '../layout/PortalHeader';
import { useBusinessContext } from '../../context/BusinessContext';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { isShelterType } from '../../types/business';
import { StatCards } from './StatCards';
import { ShelterStatCards } from './ShelterStatCards';
import { CapacityGauge } from './CapacityGauge';
import { ShelterQuickActions } from './ShelterQuickActions';
import { ShelterActivityFeed } from './ShelterActivityFeed';
import { ActivityFeed } from './ActivityFeed';
import { UpcomingRemindersWidget } from './UpcomingReminders';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function DashboardPage() {
  const { business } = usePortalAuth();
  const { stats, shelterStats, statsLoading } = useBusinessContext();
  const isShelter = isShelterType(business?.type);

  if (statsLoading) {
    return (
      <>
        <PortalHeader title="Dashboard" />
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  // Shelter dashboard
  if (isShelter && shelterStats) {
    return (
      <>
        <PortalHeader title="Dashboard" />
        <div className="p-6 space-y-6">
          <ShelterStatCards stats={shelterStats} />

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <CapacityGauge
                current={shelterStats.animalsCurrentlyHoused}
                capacity={shelterStats.intakeCapacity}
              />
            </div>
            <div>
              <ShelterQuickActions />
            </div>
          </div>

          <ShelterActivityFeed />
        </div>
      </>
    );
  }

  // Standard business dashboard
  return (
    <>
      <PortalHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        {stats ? (
          <StatCards stats={stats} />
        ) : (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

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
