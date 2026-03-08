import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Eye, Heart, FileText, Star, AlertTriangle } from 'lucide-react';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { Button } from '../shared/Button';
import {
  fetchListings,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_COLORS,
  type AdoptionListing,
  type ListingStatus,
} from '../../services/adoptionListings';

const STATUS_TABS: { value: ListingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
];

function ListingCard({ listing, onClick }: { listing: AdoptionListing; onClick: () => void }) {
  const animal = listing.shelter_animal;
  const photo = animal?.primary_photo_url || animal?.photo_urls?.[0];

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-neutral-100 relative">
        {photo ? (
          <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-3xl font-bold">
            {animal?.name?.[0] ?? '?'}
          </div>
        )}

        {/* Status badge */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${LISTING_STATUS_COLORS[listing.listing_status]}`}>
          {LISTING_STATUS_LABELS[listing.listing_status]}
        </span>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {listing.is_featured && (
            <span className="bg-amber-400 text-white p-1 rounded-lg">
              <Star size={12} fill="white" />
            </span>
          )}
          {listing.is_urgent && (
            <span className="bg-red-500 text-white p-1 rounded-lg">
              <AlertTriangle size={12} />
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-800 text-sm truncate group-hover:text-portal-primary-600 transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5 capitalize">
          {animal?.species} {animal?.breed ? `— ${animal.breed}` : ''}
        </p>

        {/* Fee */}
        {listing.adoption_fee > 0 && (
          <p className="text-sm font-bold text-portal-primary-600 mt-2">
            ${listing.adoption_fee} {listing.fee_currency}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-neutral-100">
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Eye size={12} /> {listing.view_count}
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Heart size={12} /> {listing.favorite_count}
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <FileText size={12} /> {listing.application_count}
          </span>
        </div>
      </div>
    </button>
  );
}

export function ListingsListPage() {
  const navigate = useNavigate();
  const { business } = usePortalAuth();
  const [filter, setFilter] = useState<ListingStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['adoption-listings', business?.id],
    queryFn: () => fetchListings(business!.id),
    enabled: !!business?.id,
  });

  const filtered = listings.filter((l) => {
    if (filter !== 'all' && l.listing_status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.shelter_animal?.name?.toLowerCase().includes(q) ||
        l.shelter_animal?.species?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: listings.length,
    draft: listings.filter((l) => l.listing_status === 'draft').length,
    active: listings.filter((l) => l.listing_status === 'active').length,
    paused: listings.filter((l) => l.listing_status === 'paused').length,
    closed: listings.filter((l) => l.listing_status === 'closed').length,
  };

  return (
    <>
      <PortalHeader title="Adoption Listings" />

      <div className="p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-sm focus:border-portal-primary-500 focus:ring-portal-primary-500"
            />
          </div>
          <Button onClick={() => navigate('/listings/new')}>
            <Plus size={16} className="mr-1" /> New Listing
          </Button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mb-6">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === value
                  ? 'bg-portal-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {label} ({counts[value]})
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-neutral-400">Loading listings...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 mb-4">
              {search ? 'No listings match your search.' : 'No listings yet.'}
            </p>
            {!search && (
              <Button onClick={() => navigate('/listings/new')}>
                <Plus size={16} className="mr-1" /> Create Your First Listing
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
