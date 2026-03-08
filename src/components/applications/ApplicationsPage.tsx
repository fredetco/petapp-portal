import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import {
  fetchApplications,
  KANBAN_COLUMNS,
  STATUS_LABELS,
  STATUS_COLORS,
  type AdoptionApplication,
  type ApplicationStatus,
} from '../../services/adoptionApplications';
import { ApplicationDetailSlideOver } from './ApplicationDetailSlideOver';

function KanbanCard({ app, onClick }: { app: AdoptionApplication; onClick: () => void }) {
  const animal = app.shelter_animal;
  const daysAgo = Math.floor(
    (Date.now() - new Date(app.submitted_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm p-3 text-left hover:shadow-md transition-shadow border border-neutral-100"
    >
      <div className="flex items-center gap-2 mb-2">
        {animal?.primary_photo_url ? (
          <img src={animal.primary_photo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-300 text-xs font-bold">
            {animal?.name?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-800 truncate">{animal?.name ?? 'Unknown'}</p>
          <p className="text-xs text-neutral-400 capitalize truncate">{animal?.species}</p>
        </div>
      </div>

      <p className="text-sm font-medium text-neutral-700 truncate">{app.applicant_name}</p>
      <p className="text-xs text-neutral-400 truncate">{app.applicant_email}</p>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50">
        <span className="text-xs text-neutral-400">
          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
        </span>
        {app.why_this_pet && (
          <span className="text-xs text-neutral-300" title={app.why_this_pet}>
            💬
          </span>
        )}
      </div>
    </button>
  );
}

export function ApplicationsPage() {
  const { business } = usePortalAuth();
  const [selectedApp, setSelectedApp] = useState<AdoptionApplication | null>(null);
  const [showRejected, setShowRejected] = useState(false);

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['adoption-applications', business?.id],
    queryFn: () => fetchApplications(business!.id),
    enabled: !!business?.id,
  });

  const grouped = KANBAN_COLUMNS.reduce<Record<ApplicationStatus, AdoptionApplication[]>>(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status);
      return acc;
    },
    {} as Record<ApplicationStatus, AdoptionApplication[]>
  );

  const rejectedCount = applications.filter((a) => a.status === 'rejected' || a.status === 'withdrawn').length;

  return (
    <>
      <PortalHeader title="Adoption Applications" />

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12 text-neutral-400">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400">No applications yet. They'll appear here when adopters apply to your listings.</p>
          </div>
        ) : (
          <>
            {/* Kanban board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {KANBAN_COLUMNS.map((status) => (
                <div key={status} className="flex-shrink-0 w-64">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-xs text-neutral-400">{grouped[status]?.length ?? 0}</span>
                  </div>

                  {/* Column cards */}
                  <div className="space-y-2 min-h-[200px] bg-neutral-50 rounded-xl p-2">
                    {(grouped[status] ?? []).map((app) => (
                      <KanbanCard
                        key={app.id}
                        app={app}
                        onClick={() => setSelectedApp(app)}
                      />
                    ))}

                    {(grouped[status] ?? []).length === 0 && (
                      <div className="text-center py-8 text-xs text-neutral-300">No applications</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rejected/withdrawn toggle */}
            {rejectedCount > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowRejected(!showRejected)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showRejected ? 'Hide' : 'Show'} rejected/withdrawn ({rejectedCount})
                </button>

                {showRejected && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {applications
                      .filter((a) => a.status === 'rejected' || a.status === 'withdrawn')
                      .map((app) => (
                        <KanbanCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-over */}
      {selectedApp && (
        <ApplicationDetailSlideOver
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={() => {
            refetch();
            setSelectedApp(null);
          }}
        />
      )}
    </>
  );
}
