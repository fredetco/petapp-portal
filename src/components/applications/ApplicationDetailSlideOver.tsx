import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  advanceApplicationStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  REJECTION_TEMPLATES,
  LIVING_SITUATION_LABELS,
  type AdoptionApplication,
  type ApplicationStatus,
  type LivingSituation,
} from '../../services/adoptionApplications';
import { initiateHandoff } from '../../services/adoptionHandoffs';
import { usePortalAuth } from '../../context/PortalAuthContext';

interface Props {
  application: AdoptionApplication;
  onClose: () => void;
  onUpdate: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-neutral-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-neutral-800">{value}</dd>
    </div>
  );
}

export function ApplicationDetailSlideOver({ application: app, onClose, onUpdate }: Props) {
  const navigate = useNavigate();
  const { business } = usePortalAuth();
  const queryClient = useQueryClient();
  const [reviewerNotes, setReviewerNotes] = useState(app.reviewer_notes ?? '');
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const transitions = STATUS_TRANSITIONS[app.status] ?? [];
  const animal = app.shelter_animal;

  const advanceMutation = useMutation({
    mutationFn: ({ status, extra }: { status: ApplicationStatus; extra?: Record<string, string> }) =>
      advanceApplicationStatus(app.id, status, { ...extra, reviewer_notes: reviewerNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoption-applications'] });
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard-stats'] });
      onUpdate();
    },
  });

  const handoffMutation = useMutation({
    mutationFn: () => initiateHandoff(app, business!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoption-applications'] });
      queryClient.invalidateQueries({ queryKey: ['adoption-handoffs'] });
      queryClient.invalidateQueries({ queryKey: ['shelter-animals'] });
      queryClient.invalidateQueries({ queryKey: ['adoption-listings'] });
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard-stats'] });
      onUpdate();
    },
  });

  const handleReject = () => {
    advanceMutation.mutate({
      status: 'rejected',
      extra: { rejection_reason: rejectionReason },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-[480px] bg-white h-full overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-neutral-800">Application</h2>
            <p className="text-xs text-neutral-400">{app.applicant_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[app.status]}`}>
              {STATUS_LABELS[app.status]}
            </span>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg">
              <X size={18} className="text-neutral-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Animal info */}
          {animal && (
            <button
              onClick={() => { onClose(); navigate(`/intake/${animal.id}`); }}
              className="flex items-center gap-3 w-full bg-neutral-50 rounded-xl p-3 hover:bg-neutral-100 transition-colors"
            >
              {animal.primary_photo_url ? (
                <img src={animal.primary_photo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-400 font-bold">
                  {animal.name[0]}
                </div>
              )}
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-neutral-800">{animal.name}</p>
                <p className="text-xs text-neutral-400 capitalize">{animal.species} {animal.breed ? `— ${animal.breed}` : ''}</p>
              </div>
              <ChevronRight size={16} className="text-neutral-300" />
            </button>
          )}

          {/* Applicant details */}
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-3">Applicant Information</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Name" value={app.applicant_name} />
              <Field label="Email" value={app.applicant_email} />
              <Field label="Phone" value={app.applicant_phone} />
              <Field label="Living Situation" value={app.living_situation ? LIVING_SITUATION_LABELS[app.living_situation as LivingSituation] : null} />
              <Field label="Has Yard" value={app.has_yard === true ? 'Yes' : app.has_yard === false ? 'No' : null} />
              <Field label="Landlord Allows Pets" value={app.landlord_allows_pets === true ? 'Yes' : app.landlord_allows_pets === false ? 'No' : null} />
            </dl>
          </div>

          <div className="space-y-3">
            <Field label="Household" value={app.household_description} />
            <Field label="Pet Experience" value={app.pet_experience} />
            <Field label="Existing Pets" value={app.existing_pets} />
            <Field label="Work Schedule" value={app.work_schedule} />
            <Field label="Veterinarian Reference" value={app.veterinarian_reference} />
            <Field label="Why This Pet" value={app.why_this_pet} />
            <Field label="Additional Notes" value={app.additional_notes} />
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-2">Timeline</h3>
            <div className="text-xs text-neutral-500 space-y-1">
              <p>Submitted: {new Date(app.submitted_at).toLocaleDateString()}</p>
              {app.reviewed_at && <p>Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}</p>}
              {app.interview_date && <p>Interview: {new Date(app.interview_date).toLocaleDateString()}</p>}
              {app.home_check_date && <p>Home Check: {new Date(app.home_check_date).toLocaleDateString()}</p>}
              {app.approved_at && <p>Approved: {new Date(app.approved_at).toLocaleDateString()}</p>}
              {app.completed_at && <p>Completed: {new Date(app.completed_at).toLocaleDateString()}</p>}
            </div>
          </div>

          {/* Rejection info */}
          {app.status === 'rejected' && app.rejection_reason && (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{app.rejection_reason}</p>
            </div>
          )}

          {/* Reviewer notes */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Reviewer Notes (internal)</label>
            <textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
              placeholder="Internal notes about this application..."
            />
          </div>

          {/* Action buttons */}
          {transitions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-700">Actions</h3>

              <div className="flex flex-wrap gap-2">
                {transitions
                  .filter((s) => s !== 'rejected')
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        if (s === 'approved' && app.status !== 'approved') {
                          advanceMutation.mutate({ status: s });
                        } else {
                          advanceMutation.mutate({ status: s });
                        }
                      }}
                      disabled={advanceMutation.isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${STATUS_COLORS[s]} hover:opacity-80`}
                    >
                      <ChevronRight size={12} /> {STATUS_LABELS[s]}
                    </button>
                  ))}

                {transitions.includes('rejected') && (
                  <button
                    onClick={() => setShowReject(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <AlertTriangle size={12} /> Reject
                  </button>
                )}
              </div>

              {/* Approve & Initiate Handoff */}
              {app.status === 'approved' && (
                <button
                  onClick={() => handoffMutation.mutate()}
                  disabled={handoffMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} />
                  {handoffMutation.isPending ? 'Initiating...' : 'Approve & Initiate Handoff'}
                </button>
              )}

              {(advanceMutation.isError || handoffMutation.isError) && (
                <p className="text-sm text-red-600">
                  {(advanceMutation.error as Error)?.message || (handoffMutation.error as Error)?.message}
                </p>
              )}
            </div>
          )}

          {/* Reject modal */}
          {showReject && (
            <div className="bg-red-50 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-red-700">Reject Application</h4>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_TEMPLATES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRejectionReason(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      rejectionReason === r
                        ? 'bg-red-200 text-red-800 border-red-300'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-red-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                className="w-full rounded-xl border-red-200 focus:border-red-400 focus:ring-red-400 text-sm"
                placeholder="Custom reason..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason || advanceMutation.isPending}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => setShowReject(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
