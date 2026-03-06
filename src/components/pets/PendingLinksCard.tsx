import { Clock, PawPrint } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { LinkedPetRow } from '../../hooks/useLinkedPets';

interface Props {
  pendingLinks: LinkedPetRow[];
}

export function PendingLinksCard({ pendingLinks }: Props) {
  if (pendingLinks.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={18} className="text-warning" />
        <h3 className="text-sm font-bold text-neutral-700">
          Pending Link Requests ({pendingLinks.length})
        </h3>
      </div>
      <p className="text-xs text-neutral-500 mb-4">
        These pets are awaiting owner approval. They&apos;ll appear in your active list once approved.
      </p>
      <div className="space-y-2">
        {pendingLinks.map((link) => (
          <div
            key={link.id}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3"
          >
            <div className="w-10 h-10 rounded-xl bg-portal-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
              {link.photoUrl ? (
                <img src={link.photoUrl} alt={link.petName} className="w-full h-full object-cover" />
              ) : (
                <PawPrint size={16} className="text-portal-primary-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 truncate">{link.petName}</p>
              <p className="text-xs text-neutral-500">
                {link.species}{link.breed ? ` \u2022 ${link.breed}` : ''}
                {link.ownerName ? ` \u2022 ${link.ownerName}` : ''}
              </p>
            </div>
            <span className="text-xs text-neutral-400 shrink-0">
              {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
