import { useState } from 'react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { Button } from '../shared/Button';
import { Save, Building2 } from 'lucide-react';

export function BusinessProfile() {
  const { business } = usePortalAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state initialized from business
  const [name, setName] = useState(business?.name ?? '');
  const [description, setDescription] = useState(business?.description ?? '');
  const [phone, setPhone] = useState(business?.phone ?? '');
  const [email, setEmail] = useState(business?.email ?? '');
  const [website, setWebsite] = useState(business?.website ?? '');
  const [addressLine1, setAddressLine1] = useState(business?.address_line1 ?? '');
  const [city, setCity] = useState(business?.city ?? '');
  const [region, setRegion] = useState(business?.region ?? '');
  const [postalCode, setPostalCode] = useState(business?.postal_code ?? '');

  const handleSave = async () => {
    if (!business || !isSupabaseConfigured) return;
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const { error: err } = await supabase
        .from('businesses')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          phone: phone.trim() || null,
          email: email.trim(),
          website: website.trim() || null,
          address_line1: addressLine1.trim() || null,
          city: city.trim() || null,
          region: region.trim() || null,
          postal_code: postalCode.trim() || null,
        })
        .eq('id', business.id);

      if (err) throw err;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 size={20} className="text-portal-primary-500" />
        <h3 className="text-lg font-bold text-neutral-800">Business Profile</h3>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
          />
        </div>

        <hr className="border-neutral-200" />

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Address</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Street address"
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Province</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Postal Code</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
        </div>

        {error && <div className="bg-danger/10 text-danger text-sm rounded-xl p-3">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm rounded-xl p-3">Changes saved successfully!</div>}

        <div className="pt-2">
          <Button onClick={handleSave} loading={saving} icon={<Save size={16} />}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
