import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePortalAuth } from './PortalAuthContext';
import { fetchDashboardStats, type DashboardStats } from '../services/analytics';

interface BusinessContextType {
  stats: DashboardStats | undefined;
  statsLoading: boolean;
  refetchStats: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { business } = usePortalAuth();

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard-stats', business?.id],
    queryFn: () => fetchDashboardStats(business!.id),
    enabled: !!business,
  });

  return (
    <BusinessContext.Provider value={{ stats, statsLoading, refetchStats }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusinessContext must be used within BusinessProvider');
  return context;
}
