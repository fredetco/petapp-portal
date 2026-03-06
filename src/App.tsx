import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortalAuthProvider } from './context/PortalAuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { PortalAuthPage } from './components/auth/PortalAuthPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BusinessGuard } from './components/auth/BusinessGuard';
import { PortalShell } from './components/layout/PortalShell';
import { PortalHeader } from './components/layout/PortalHeader';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { QRScanPage } from './components/scanner/QRScanPage';
import { LinkedPetsPage } from './components/pets/LinkedPetsPage';
import { PetDetailPage } from './components/pets/PetDetailPage';
import { RecordsPage } from './components/records/RecordsPage';
import { RemindersPage } from './components/reminders/RemindersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function PagePlaceholder({ title, step }: { title: string; step: number }) {
  return (
    <>
      <PortalHeader title={title} />
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">&#x1F6A7;</div>
          <h2 className="text-lg font-bold text-neutral-700">{title}</h2>
          <p className="text-neutral-500 text-sm">Coming in Step {step}</p>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PortalAuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<PortalAuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Onboarding (authenticated but no business) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingWizard />
                </ProtectedRoute>
              }
            />

            {/* Protected portal routes (need auth + business) */}
            <Route
              element={
                <ProtectedRoute>
                  <BusinessGuard>
                    <BusinessProvider>
                      <PortalShell />
                    </BusinessProvider>
                  </BusinessGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="scanner" element={<QRScanPage />} />
              <Route path="pets" element={<LinkedPetsPage />} />
              <Route path="pets/:petId" element={<PetDetailPage />} />
              <Route path="records" element={<RecordsPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="campaigns" element={<PagePlaceholder title="Campaigns" step={24} />} />
              <Route path="settings" element={<PagePlaceholder title="Settings" step={24} />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PortalAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
