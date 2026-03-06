import { Navigate } from 'react-router-dom';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/** Redirects to /auth if not authenticated */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-portal-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
