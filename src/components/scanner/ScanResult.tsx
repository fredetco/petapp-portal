import { useState } from 'react';
import type { PetLookupResult } from '../../services/linking';
import { sendLinkRequest } from '../../services/linking';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { Link, CheckCircle, AlertCircle, PawPrint } from 'lucide-react';

interface Props {
  pet: PetLookupResult;
  onReset: () => void;
}

export function ScanResult({ pet, onReset }: Props) {
  const { business } = usePortalAuth();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const hasExistingLink = !!pet.existing_link_status;

  const handleSendRequest = async () => {
    if (!business) return;
    setError('');
    setLoading(true);
    try {
      await sendLinkRequest(pet.id, business.id, business.type, notes);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link request');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <CheckCircle size={48} className="text-success mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-800 mb-2">Link request sent!</h3>
        <p className="text-sm text-neutral-500 mb-6">
          The owner of <strong>{pet.name}</strong> will receive a notification to approve the link.
        </p>
        <Button variant="secondary" onClick={onReset}>Scan another pet</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Pet info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-portal-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <PawPrint size={24} className="text-portal-primary-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-800">{pet.name}</h3>
          <p className="text-sm text-neutral-500">
            {pet.species}{pet.breed ? ` \u2022 ${pet.breed}` : ''}
          </p>
          {pet.owner_name && (
            <p className="text-xs text-neutral-400">Owner: {pet.owner_name}</p>
          )}
        </div>
      </div>

      {/* Existing link warning */}
      {hasExistingLink && (
        <div className="bg-amber-50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-neutral-700">Existing link found</p>
            <p className="text-xs text-neutral-500">
              This pet already has a{' '}
              <Badge variant="warning">{pet.existing_link_status}</Badge>{' '}
              link with your business.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-danger/10 text-danger text-sm rounded-xl p-3 mb-4">{error}</div>
      )}

      {/* Notes */}
      {!hasExistingLink && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Notes for the owner (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
              placeholder="e.g. Visited for annual checkup"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onReset} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSendRequest} loading={loading} icon={<Link size={16} />} className="flex-1">
              Send link request
            </Button>
          </div>
        </>
      )}

      {hasExistingLink && (
        <Button variant="secondary" onClick={onReset} className="w-full">
          Scan another pet
        </Button>
      )}
    </div>
  );
}
