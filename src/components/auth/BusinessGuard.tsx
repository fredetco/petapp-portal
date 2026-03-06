import { Navigate } from 'react-router-dom';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/** Redirects to /onboarding if user doesn't have a business yet */
export function BusinessGuard({ children }: { children: React.ReactNode }) {
  const { hasBusiness, loading } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-portal-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasBusiness) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
