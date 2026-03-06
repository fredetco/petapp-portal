import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { useCreateCampaign } from '../../hooks/useCampaigns';
import type { CampaignType } from '../../types/campaign';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCampaignForm({ open, onClose }: Props) {
  const { business } = usePortalAuth();
  const createCampaign = useCreateCampaign();

  const [name, setName] = useState('');
  const [type, setType] = useState<CampaignType>('exclusive_service');
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [species, setSpecies] = useState('');
  const [regions, setRegions] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setType('exclusive_service');
    setHeadline('');
    setBody('');
    setCtaText('');
    setCtaUrl('');
    setSpecies('');
    setRegions('');
    setDailyBudget('');
    setStartDate('');
    setEndDate('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!business) return;
    if (!name.trim()) { setError('Campaign name is required'); return; }
    if (!headline.trim()) { setError('Headline is required'); return; }
    if (!body.trim()) { setError('Body text is required'); return; }

    setError('');
    try {
      await createCampaign.mutateAsync({
        businessId: business.id,
        name: name.trim(),
        type,
        targetSpecies: species.split(',').map((s) => s.trim()).filter(Boolean),
        targetRegions: regions.split(',').map((r) => r.trim()).filter(Boolean),
        headline: headline.trim(),
        body: body.trim(),
        ctaText: ctaText.trim() || null,
        ctaUrl: ctaUrl.trim() || null,
        dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
        cpcBid: null,
        totalBudget: null,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      handleClose();
    } catch {
      setError('Failed to create campaign. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create Campaign" size="lg">
      <div className="space-y-4">
        {/* Name + Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Campaign Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring Checkup Promo"
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CampaignType)}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            >
              <option value="exclusive_service">Exclusive (linked pets only)</option>
              <option value="open_marketplace">Marketplace (all pet owners)</option>
            </select>
          </div>
        </div>

        {/* Ad content */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ad Content</p>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Headline *</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. 20% Off Spring Checkups!"
              className="w-full rounded-lg border-neutral-300 text-sm"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Body Text *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Describe your offer..."
              className="w-full rounded-lg border-neutral-300 text-sm"
              maxLength={500}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">CTA Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Book Now"
                className="w-full rounded-lg border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">CTA Link</label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border-neutral-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Targeting */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Target Species</label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. dog, cat (comma-separated)"
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Target Regions</label>
            <input
              type="text"
              value={regions}
              onChange={(e) => setRegions(e.target.value)}
              placeholder="e.g. ON, BC (comma-separated)"
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
        </div>

        {/* Budget + Schedule */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Daily Budget ($)</label>
            <input
              type="number"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              placeholder="Optional"
              min="0"
              step="0.01"
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border-neutral-300 text-sm"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-xl p-3">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createCampaign.isPending}
            className="flex-1"
          >
            Create as Draft
          </Button>
        </div>
      </div>
    </Modal>
  );
}
