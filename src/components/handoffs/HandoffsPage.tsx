import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightLeft, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import {
  fetchHandoffs,
  HANDOFF_STATUS_LABELS,
  HANDOFF_STATUS_COLORS,
  type AdoptionHandoff,
} from '../../services/adoptionHandoffs';

function statusIcon(status: string) {
  switch (status) {
    case 'pending': return <Clock size={14} className="text-amber-500" />;
    case 'accepted': return <ArrowRightLeft size={14} className="text-blue-500" />;
    case 'completed': return <CheckCircle size={14} className="text-green-500" />;
    case 'failed': return <AlertCircle size={14} className="text-red-500" />;
    default: return null;
  }
}

function HandoffRow({ handoff }: { handoff: AdoptionHandoff }) {
  const navigate = useNavigate();
  const animal = handoff.shelter_animal;
  const adopter = handoff.adopter;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* Animal photo */}
      <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
        {animal?.primary_photo_url ? (
          <img src={animal.primary_photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 font-bold">
            {animal?.name?.[0] ?? '?'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-neutral-800">{animal?.name ?? 'Unknown Animal'}</p>
          <span className="text-xs text-neutral-400">→</span>
          <div className="flex items-center gap-1">
            <User size={12} className="text-neutral-400" />
            <p className="text-sm text-neutral-600">{adopter?.display_name || adopter?.email || 'Adopter'}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-400 capitalize">
          {animal?.species} {animal?.breed ? `— ${animal.breed}` : ''} · {handoff.handoff_type.replace('_', ' ')}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {statusIcon(handoff.status)}
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${HANDOFF_STATUS_COLORS[handoff.status]}`}>
          {HANDOFF_STATUS_LABELS[handoff.status]}
        </span>
      </div>

      {/* Date */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-neutral-400">
          {new Date(handoff.initiated_at).toLocaleDateString()}
        </p>
        {handoff.status === 'pending' && (
          <p className="text-xs text-amber-500 font-medium">Waiting for adopter</p>
        )}
        {handoff.status === 'accepted' && (
          <p className="text-xs text-blue-500 font-medium">Transfer in progress</p>
        )}
      </div>

      {/* View animal */}
      {animal && (
        <button
          onClick={() => navigate(`/intake/${animal.id}`)}
          className="text-xs text-portal-primary-600 hover:underline flex-shrink-0"
        >
          View
        </button>
      )}
    </div>
  );
}

export function HandoffsPage() {
  const { business } = usePortalAuth();

  const { data: handoffs = [], isLoading } = useQuery({
    queryKey: ['adoption-handoffs', business?.id],
    queryFn: () => fetchHandoffs(business!.id),
    enabled: !!business?.id,
  });

  const pending = handoffs.filter((h) => h.status === 'pending');
  const active = handoffs.filter((h) => h.status === 'accepted');
  const completed = handoffs.filter((h) => h.status === 'completed');
  const failed = handoffs.filter((h) => h.status === 'failed');

  return (
    <>
      <PortalHeader title="Handoffs" />

      <div className="p-6 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-neutral-400">Loading handoffs...</div>
        ) : handoffs.length === 0 ? (
          <div className="text-center py-16">
            <ArrowRightLeft size={32} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-400 mb-1">No handoffs yet</p>
            <p className="text-xs text-neutral-300">
              When you approve an application and initiate a handoff, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" /> Pending ({pending.length})
                </h3>
                <div className="space-y-2">
                  {pending.map((h) => <HandoffRow key={h.id} handoff={h} />)}
                </div>
              </section>
            )}

            {active.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                  <ArrowRightLeft size={14} className="text-blue-500" /> In Progress ({active.length})
                </h3>
                <div className="space-y-2">
                  {active.map((h) => <HandoffRow key={h.id} handoff={h} />)}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" /> Completed ({completed.length})
                </h3>
                <div className="space-y-2">
                  {completed.map((h) => <HandoffRow key={h.id} handoff={h} />)}
                </div>
              </section>
            )}

            {failed.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500" /> Failed ({failed.length})
                </h3>
                <div className="space-y-2">
                  {failed.map((h) => <HandoffRow key={h.id} handoff={h} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
