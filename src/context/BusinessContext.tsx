import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePortalAuth } from './PortalAuthContext';
import { isShelterType } from '../types/business';
import {
  fetchDashboardStats,
  fetchShelterDashboardStats,
  type DashboardStats,
  type ShelterDashboardStats,
} from '../services/analytics';

interface BusinessContextType {
  stats: DashboardStats | undefined;
  shelterStats: ShelterDashboardStats | undefined;
  statsLoading: boolean;
  refetchStats: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { business } = usePortalAuth();
  const isShelter = isShelterType(business?.type);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard-stats', business?.id],
    queryFn: () => fetchDashboardStats(business!.id),
    enabled: !!business && !isShelter,
  });

  const {
    data: shelterStats,
    isLoading: shelterStatsLoading,
    refetch: refetchShelterStats,
  } = useQuery({
    queryKey: ['shelter-dashboard-stats', business?.id],
    queryFn: () => fetchShelterDashboardStats(business!.id),
    enabled: !!business && isShelter,
  });

  return (
    <BusinessContext.Provider
      value={{
        stats,
        shelterStats,
        statsLoading: isShelter ? shelterStatsLoading : statsLoading,
        refetchStats: () => {
          if (isShelter) refetchShelterStats();
          else refetchStats();
        },
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusinessContext must be used within BusinessProvider');
  return context;
}
