import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { useCreateRecord } from '../../hooks/useRecords';
import { RECORD_TYPE_META, type RecordType } from '../../types/businessRecord';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  petId: string;
  serviceLinkId: string | null;
}

const RECORD_TYPES = Object.entries(RECORD_TYPE_META).map(([key, meta]) => ({
  value: key as RecordType,
  label: meta.label,
}));

export function AddRecordModal({ open, onClose, petId, serviceLinkId }: Props) {
  const { user, business } = usePortalAuth();
  const createRecord = useCreateRecord();

  const [recordType, setRecordType] = useState<RecordType>('examination');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [visibleToOwner, setVisibleToOwner] = useState(true);

  // Type-specific fields
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [vaccinationName, setVaccinationName] = useState('');
  const [vaccinationBatch, setVaccinationBatch] = useState('');
  const [vaccinationNextDue, setVaccinationNextDue] = useState('');
  const [medications, setMedications] = useState('');
  const [diagnosisText, setDiagnosisText] = useState('');
  const [treatmentText, setTreatmentText] = useState('');

  const [error, setError] = useState('');

  const resetForm = () => {
    setRecordType('examination');
    setTitle('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setVisibleToOwner(true);
    setWeight('');
    setWeightUnit('kg');
    setVaccinationName('');
    setVaccinationBatch('');
    setVaccinationNextDue('');
    setMedications('');
    setDiagnosisText('');
    setTreatmentText('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user || !business) return;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError('');
    try {
      await createRecord.mutateAsync({
        businessId: business.id,
        petId,
        serviceLinkId,
        authorUserId: user.id,
        type: recordType,
        title: title.trim(),
        notes: notes.trim() || null,
        date,
        weight: weight ? parseFloat(weight) : null,
        weightUnit: weight ? weightUnit : null,
        vaccinationName: vaccinationName.trim() || null,
        vaccinationBatch: vaccinationBatch.trim() || null,
        vaccinationNextDue: vaccinationNextDue || null,
        medications: medications
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        diagnosisText: diagnosisText.trim() || null,
        treatmentText: treatmentText.trim() || null,
        visibleToOwner,
      });
      handleClose();
    } catch {
      setError('Failed to create record. Please try again.');
    }
  };

  const showVaccinationFields = recordType === 'vaccination';
  const showDiagnosisFields = recordType === 'diagnosis';
  const showTreatmentFields = recordType === 'treatment' || recordType === 'surgery';
  const showPrescriptionFields = recordType === 'prescription';
  const showWeightField = recordType === 'weight_check' || recordType === 'examination';

  return (
    <Modal open={open} onClose={handleClose} title="Add Record" size="lg">
      <div className="space-y-4">
        {/* Record type */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">
            Record Type
          </label>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as RecordType)}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
          >
            {RECORD_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Title + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual wellness exam"
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Vaccination fields */}
        {showVaccinationFields && (
          <div className="bg-green-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Vaccination Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Vaccine Name</label>
                <input
                  type="text"
                  value={vaccinationName}
                  onChange={(e) => setVaccinationName(e.target.value)}
                  placeholder="e.g. Rabies"
                  className="w-full rounded-lg border-neutral-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={vaccinationBatch}
                  onChange={(e) => setVaccinationBatch(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border-neutral-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Next Due Date</label>
              <input
                type="date"
                value={vaccinationNextDue}
                onChange={(e) => setVaccinationNextDue(e.target.value)}
                className="w-full rounded-lg border-neutral-300 text-sm"
              />
            </div>
          </div>
        )}

        {/* Diagnosis fields */}
        {showDiagnosisFields && (
          <div className="bg-red-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Diagnosis Details</p>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Diagnosis</label>
              <textarea
                value={diagnosisText}
                onChange={(e) => setDiagnosisText(e.target.value)}
                rows={2}
                className="w-full rounded-lg border-neutral-300 text-sm"
                placeholder="Describe the diagnosis..."
              />
            </div>
          </div>
        )}

        {/* Treatment / Surgery fields */}
        {showTreatmentFields && (
          <div className="bg-purple-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              {recordType === 'surgery' ? 'Surgery' : 'Treatment'} Details
            </p>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
              <textarea
                value={treatmentText}
                onChange={(e) => setTreatmentText(e.target.value)}
                rows={2}
                className="w-full rounded-lg border-neutral-300 text-sm"
                placeholder={`Describe the ${recordType === 'surgery' ? 'procedure' : 'treatment'}...`}
              />
            </div>
          </div>
        )}

        {/* Prescription fields */}
        {showPrescriptionFields && (
          <div className="bg-amber-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Prescription Details</p>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Medications (comma-separated)
              </label>
              <input
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Amoxicillin 250mg, Prednisone 5mg"
                className="w-full rounded-lg border-neutral-300 text-sm"
              />
            </div>
          </div>
        )}

        {/* Weight field */}
        {showWeightField && (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Weight</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Optional"
                step="0.1"
                min="0"
                className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Unit</label>
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value)}
                className="w-full rounded-xl border-neutral-300 text-sm"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
            placeholder="Additional notes..."
          />
        </div>

        {/* Visibility toggle */}
        <label className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={visibleToOwner}
            onChange={(e) => setVisibleToOwner(e.target.checked)}
            className="rounded border-neutral-300 text-portal-primary-600 focus:ring-portal-primary-500"
          />
          <div>
            <span className="text-sm font-semibold text-neutral-700">Visible to pet owner</span>
            <p className="text-xs text-neutral-400">
              When enabled, this record will appear in the owner&apos;s care log.
            </p>
          </div>
        </label>

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
            loading={createRecord.isPending}
            className="flex-1"
          >
            Add Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}
