import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortalAuthProvider } from './context/PortalAuthContext';
import { PortalAuthPage } from './components/auth/PortalAuthPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BusinessGuard } from './components/auth/BusinessGuard';
import { PortalShell } from './components/layout/PortalShell';
import { PortalHeader } from './components/layout/PortalHeader';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/** Placeholder pages — replaced in subsequent steps */
function DashboardPlaceholder() {
  return (
    <>
      <PortalHeader title="Dashboard" />
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">&#x1F4CA;</div>
          <h2 className="text-lg font-bold text-neutral-700">Dashboard</h2>
          <p className="text-neutral-500 text-sm">Coming in Step 19</p>
        </div>
      </div>
    </>
  );
}

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
                    <PortalShell />
                  </BusinessGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPlaceholder />} />
              <Route path="scanner" element={<PagePlaceholder title="QR Scanner" step={20} />} />
              <Route path="pets" element={<PagePlaceholder title="Linked Pets" step={21} />} />
              <Route path="pets/:petId" element={<PagePlaceholder title="Pet Detail" step={21} />} />
              <Route path="records" element={<PagePlaceholder title="Records" step={22} />} />
              <Route path="reminders" element={<PagePlaceholder title="Reminders" step={23} />} />
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
