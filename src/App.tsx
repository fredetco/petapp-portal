import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortalAuthProvider } from './context/PortalAuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { PortalAuthPage } from './components/auth/PortalAuthPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BusinessGuard } from './components/auth/BusinessGuard';
import { PortalShell } from './components/layout/PortalShell';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { QRScanPage } from './components/scanner/QRScanPage';
import { LinkedPetsPage } from './components/pets/LinkedPetsPage';
import { PetDetailPage } from './components/pets/PetDetailPage';
import { RecordsPage } from './components/records/RecordsPage';
import { RemindersPage } from './components/reminders/RemindersPage';
import { CampaignsPage } from './components/campaigns/CampaignsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { IntakeListPage } from './components/intake/IntakeListPage';
import { IntakeFormPage } from './components/intake/IntakeFormPage';
import { AnimalDetailPage } from './components/intake/AnimalDetailPage';
import { ListingsListPage } from './components/listings/ListingsListPage';
import { CreateListingPage } from './components/listings/CreateListingPage';
import { ListingDetailPage } from './components/listings/ListingDetailPage';
import { ApplicationsPage } from './components/applications/ApplicationsPage';
import { HandoffsPage } from './components/handoffs/HandoffsPage';
import { AdoptionStatsPage } from './components/adoption-stats/AdoptionStatsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

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
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="intake" element={<IntakeListPage />} />
              <Route path="intake/new" element={<IntakeFormPage />} />
              <Route path="intake/:id" element={<AnimalDetailPage />} />
              <Route path="listings" element={<ListingsListPage />} />
              <Route path="listings/new" element={<CreateListingPage />} />
              <Route path="listings/:id" element={<ListingDetailPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="handoffs" element={<HandoffsPage />} />
              <Route path="adoption-stats" element={<AdoptionStatsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PortalAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
