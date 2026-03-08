import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Play, Pause, XCircle, Eye, Heart, FileText, ExternalLink, Star, AlertTriangle } from 'lucide-react';
import { PortalHeader } from '../layout/PortalHeader';
import { Button } from '../shared/Button';
import {
  fetchListing,
  updateListingStatus,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_COLORS,
  FEE_INCLUDES_OPTIONS,
  DELIVERY_OPTIONS,
  type ListingStatus,
} from '../../services/adoptionListings';
import { STATUS_LABELS as ANIMAL_STATUS_LABELS } from '../../services/shelterAnimals';
import { ListingPreviewCard } from './ListingPreviewCard';

const TABS = ['Details', 'Analytics', 'Applications'] as const;
type Tab = (typeof TABS)[number];

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('Details');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['adoption-listing', id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ListingStatus) => updateListingStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoption-listing', id] });
      queryClient.invalidateQueries({ queryKey: ['adoption-listings'] });
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard-stats'] });
    },
  });

  if (isLoading) {
    return (
      <>
        <PortalHeader title="Listing Details" />
        <div className="p-6 text-center text-neutral-400">Loading...</div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <PortalHeader title="Listing Details" />
        <div className="p-6 text-center text-neutral-400">Listing not found.</div>
      </>
    );
  }

  const animal = listing.shelter_animal;
  const status = listing.listing_status;

  const actions: { label: string; status: ListingStatus; icon: React.ElementType; color: string }[] = [];
  if (status === 'draft' || status === 'paused') {
    actions.push({ label: 'Publish', status: 'active', icon: Play, color: 'bg-green-500 hover:bg-green-600 text-white' });
  }
  if (status === 'active') {
    actions.push({ label: 'Pause', status: 'paused', icon: Pause, color: 'bg-amber-500 hover:bg-amber-600 text-white' });
  }
  if (status !== 'closed') {
    actions.push({ label: 'Close', status: 'closed', icon: XCircle, color: 'bg-neutral-500 hover:bg-neutral-600 text-white' });
  }

  return (
    <>
      <PortalHeader title={listing.title} />

      <div className="p-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/listings')}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to Listings
        </button>

        <div className="grid grid-cols-3 gap-6">
          {/* Left 2 cols */}
          <div className="col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-neutral-800">{listing.title}</h2>
                    {listing.is_featured && (
                      <span className="bg-amber-100 text-amber-600 p-1 rounded-lg"><Star size={12} fill="currentColor" /></span>
                    )}
                    {listing.is_urgent && (
                      <span className="bg-red-100 text-red-500 p-1 rounded-lg"><AlertTriangle size={12} /></span>
                    )}
                  </div>
                  {animal && (
                    <button
                      onClick={() => navigate(`/intake/${animal.id}`)}
                      className="text-sm text-portal-primary-600 hover:underline flex items-center gap-1"
                    >
                      {animal.name} — {animal.species} {animal.breed ? `(${animal.breed})` : ''}
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${LISTING_STATUS_COLORS[status]}`}>
                  {LISTING_STATUS_LABELS[status]}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {actions.map(({ label, status: s, icon: Icon, color }) => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={statusMutation.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${color}`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {statusMutation.isError && (
                <p className="text-sm text-red-600 mt-2">
                  Failed: {(statusMutation.error as Error).message}
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Views', value: listing.view_count, icon: Eye, color: 'text-blue-500' },
                { label: 'Favorites', value: listing.favorite_count, icon: Heart, color: 'text-pink-500' },
                { label: 'Applications', value: listing.application_count, icon: FileText, color: 'text-purple-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
                  <Icon size={20} className={`mx-auto mb-1 ${color}`} />
                  <p className="text-2xl font-bold text-neutral-800">{value}</p>
                  <p className="text-xs text-neutral-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-neutral-200">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                    tab === t
                      ? 'border-portal-primary-500 text-portal-primary-600'
                      : 'border-transparent text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              {tab === 'Details' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-400 mb-1 uppercase">Description</h4>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">{listing.description}</p>
                  </div>

                  {listing.description_fr && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 mb-1 uppercase">Description (FR)</h4>
                      <p className="text-sm text-neutral-700 whitespace-pre-wrap">{listing.description_fr}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 mb-1 uppercase">Adoption Fee</h4>
                      <p className="text-sm font-bold text-neutral-800">
                        {listing.adoption_fee > 0 ? `$${listing.adoption_fee} ${listing.fee_currency}` : 'Free'}
                      </p>
                    </div>

                    {listing.requirements && (
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-400 mb-1 uppercase">Requirements</h4>
                        <p className="text-sm text-neutral-700">{listing.requirements}</p>
                      </div>
                    )}
                  </div>

                  {listing.fee_includes?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 mb-1.5 uppercase">Fee Includes</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {listing.fee_includes.map((v) => {
                          const opt = FEE_INCLUDES_OPTIONS.find((o) => o.value === v);
                          return (
                            <span key={v} className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                              {opt?.label ?? v}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {listing.delivery_options?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 mb-1.5 uppercase">Delivery Options</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {listing.delivery_options.map((v) => {
                          const opt = DELIVERY_OPTIONS.find((o) => o.value === v);
                          return (
                            <span key={v} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                              {opt?.label ?? v}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(listing.location_city || listing.location_region) && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 mb-1 uppercase">Location</h4>
                      <p className="text-sm text-neutral-700">
                        {[listing.location_city, listing.location_region, listing.location_postal_code]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs text-neutral-400 pt-3 border-t border-neutral-100">
                    <div>
                      <span className="font-semibold">Created:</span> {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                    {listing.published_at && (
                      <div>
                        <span className="font-semibold">Published:</span> {new Date(listing.published_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === 'Analytics' && (
                <div className="flex items-center justify-center py-16 text-neutral-400">
                  <p className="text-sm">Listing analytics — coming in a future step</p>
                </div>
              )}

              {tab === 'Applications' && (
                <div className="flex items-center justify-center py-16 text-neutral-400">
                  <p className="text-sm">Applications list — coming in Step B4</p>
                </div>
              )}
            </div>
          </div>

          {/* Right col — preview */}
          <div className="col-span-1">
            <div className="sticky top-6">
              <h3 className="text-sm font-bold text-neutral-700 mb-3">Public Preview</h3>
              <ListingPreviewCard
                title={listing.title}
                description={listing.description}
                fee={listing.adoption_fee}
                currency={listing.fee_currency}
                animal={animal ?? null}
                isUrgent={listing.is_urgent}
                isFeatured={listing.is_featured}
                feeIncludes={listing.fee_includes ?? []}
                city={listing.location_city ?? ''}
                region={listing.location_region ?? ''}
              />

              {/* Animal info card */}
              {animal && (
                <div className="bg-white rounded-2xl shadow-sm p-4 mt-4">
                  <h4 className="text-xs font-semibold text-neutral-400 mb-2 uppercase">Linked Animal</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                      {animal.primary_photo_url ? (
                        <img src={animal.primary_photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 font-bold text-sm">
                          {animal.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{animal.name}</p>
                      <p className="text-xs text-neutral-400">
                        {ANIMAL_STATUS_LABELS[animal.status]} · {animal.species}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
