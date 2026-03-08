import { Heart, MapPin, Star, AlertTriangle, Check } from 'lucide-react';
import type { ShelterAnimal } from '../../services/shelterAnimals';
import { FEE_INCLUDES_OPTIONS } from '../../services/adoptionListings';

interface Props {
  title: string;
  description: string;
  fee: number;
  currency: string;
  animal: ShelterAnimal | null;
  isUrgent: boolean;
  isFeatured: boolean;
  feeIncludes: string[];
  city: string;
  region: string;
}

export function ListingPreviewCard({
  title,
  description,
  fee,
  currency,
  animal,
  isUrgent,
  isFeatured,
  feeIncludes,
  city,
  region,
}: Props) {
  const photo = animal?.primary_photo_url || animal?.photo_urls?.[0];
  const location = [city, region].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-neutral-100">
      {/* Image */}
      <div className="aspect-[4/3] bg-neutral-100 relative">
        {photo ? (
          <img src={photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-200">
            <span className="text-5xl font-bold">{animal?.name?.[0] ?? '?'}</span>
          </div>
        )}

        {/* Favorite button */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
          <Heart size={16} className="text-neutral-400" />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isFeatured && (
            <span className="bg-amber-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star size={10} fill="white" /> Featured
            </span>
          )}
          {isUrgent && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
              <AlertTriangle size={10} /> Urgent
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-neutral-800 text-sm leading-tight">
          {title || 'Listing title...'}
        </h3>

        {animal && (
          <p className="text-xs text-neutral-500 mt-1 capitalize">
            {animal.species} {animal.breed ? `· ${animal.breed}` : ''} ·{' '}
            {animal.sex !== 'unknown' ? animal.sex : ''}{' '}
            {animal.estimated_age_months
              ? animal.estimated_age_months < 12
                ? `· ${animal.estimated_age_months}mo`
                : `· ${Math.round(animal.estimated_age_months / 12)}yr`
              : ''}
          </p>
        )}

        {location && (
          <p className="flex items-center gap-1 text-xs text-neutral-400 mt-1.5">
            <MapPin size={11} /> {location}
          </p>
        )}

        {description && (
          <p className="text-xs text-neutral-600 mt-3 line-clamp-3">{description}</p>
        )}

        {/* Fee */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <span className="text-sm font-bold text-portal-primary-600">
            {fee > 0 ? `$${fee} ${currency}` : 'Free'}
          </span>
          <button className="px-3 py-1.5 bg-portal-primary-500 text-white rounded-lg text-xs font-semibold">
            Apply
          </button>
        </div>

        {/* Included */}
        {feeIncludes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {feeIncludes.map((v) => {
              const opt = FEE_INCLUDES_OPTIONS.find((o) => o.value === v);
              return (
                <span key={v} className="flex items-center gap-0.5 text-xs text-green-600">
                  <Check size={10} /> {opt?.label ?? v}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
