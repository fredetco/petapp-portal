import { useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import { uploadAnimalPhoto, type IntakeFormData } from '../../../services/shelterAnimals';

interface Props {
  data: IntakeFormData;
  onChange: (partial: Partial<IntakeFormData>) => void;
  shelterId: string;
}

export function PhotosStep({ data, onChange, shelterId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = 8 - data.photo_urls.length;
    if (files.length > remaining) {
      setError(`You can only upload ${remaining} more photo(s).`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadAnimalPhoto(shelterId, file);
        urls.push(url);
      }

      const newPhotos = [...data.photo_urls, ...urls];
      onChange({
        photo_urls: newPhotos,
        primary_photo_url: data.primary_photo_url || newPhotos[0],
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (url: string) => {
    const newPhotos = data.photo_urls.filter((u) => u !== url);
    onChange({
      photo_urls: newPhotos,
      primary_photo_url: data.primary_photo_url === url ? (newPhotos[0] ?? '') : data.primary_photo_url,
    });
  };

  const setPrimary = (url: string) => {
    onChange({ primary_photo_url: url });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-neutral-800">Photos</h3>
      <p className="text-sm text-neutral-500">Upload up to 8 photos. Click the star to set the primary photo.</p>

      {/* Photo grid */}
      <div className="grid grid-cols-4 gap-3">
        {data.photo_urls.map((url) => (
          <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-neutral-100">
            <img src={url} alt="" className="w-full h-full object-cover" />

            {/* Primary badge */}
            {data.primary_photo_url === url && (
              <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white p-1 rounded-lg">
                <Star size={12} fill="white" />
              </div>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPrimary(url)}
                className="p-1.5 rounded-lg bg-white/90 text-amber-500 hover:bg-white"
                title="Set as primary"
              >
                <Star size={14} />
              </button>
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="p-1.5 rounded-lg bg-white/90 text-red-500 hover:bg-white"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Upload button */}
        {data.photo_urls.length < 8 && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-portal-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors">
            <Upload size={24} className="text-neutral-400 mb-1" />
            <span className="text-xs text-neutral-500">{uploading ? 'Uploading...' : 'Add Photo'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-neutral-400">
        {data.photo_urls.length}/8 photos uploaded
      </p>
    </div>
  );
}
