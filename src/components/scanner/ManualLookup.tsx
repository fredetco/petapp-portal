import { useState } from 'react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { lookupPet, type PetLookupResult } from '../../services/linking';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Search, AlertCircle } from 'lucide-react';

interface Props {
  onResult: (pet: PetLookupResult) => void;
}

export function ManualLookup({ onResult }: Props) {
  const { business } = usePortalAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || !business) return;

    setError('');
    setLoading(true);
    try {
      const pet = await lookupPet(trimmed, business.id);
      if (pet) {
        onResult(pet);
      } else {
        setError('No pet found with that ID or QR code. Please check and try again.');
      }
    } catch {
      setError('Failed to look up pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1">
          Pet ID or QR Token
        </label>
        <p className="text-xs text-neutral-500 mb-3">
          Enter the pet&apos;s unique ID or the token printed on their QR tag.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. abc12345-..."
            className="flex-1 rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            disabled={loading}
          />
          <Button
            onClick={handleSearch}
            loading={loading}
            disabled={!query.trim()}
            icon={<Search size={16} />}
          >
            Look up
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="bg-danger/10 text-danger text-sm rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
