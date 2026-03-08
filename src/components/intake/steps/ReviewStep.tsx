import { Star } from 'lucide-react';
import type { IntakeFormData } from '../../../services/shelterAnimals';

interface Props {
  data: IntakeFormData;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-neutral-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-neutral-800">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-neutral-700 mb-3 border-b border-neutral-100 pb-1">{title}</h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
    </div>
  );
}

const CONDITION_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  minor_issues: 'Minor Issues',
  needs_treatment: 'Needs Treatment',
  critical: 'Critical',
};

const COMPLEXITY_LABELS = ['', 'Minimal', 'Low', 'Moderate', 'High', 'Critical'];

const INTAKE_TYPE_LABELS: Record<string, string> = {
  stray: 'Stray / Found',
  surrender: 'Owner Surrender',
  transfer: 'Transfer',
  rescue: 'Rescue Operation',
  confiscation: 'Confiscation',
  return: 'Return',
  born_in_care: 'Born in Care',
};

function triLabel(v: boolean | null) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return 'Unknown';
}

export function ReviewStep({ data }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-neutral-800">Review & Submit</h3>
      <p className="text-sm text-neutral-500">Please review the information below before saving.</p>

      <div className="space-y-5">
        <Section title="Basic Information">
          <Field label="Name" value={data.name} />
          <Field label="Species" value={data.species} />
          <Field label="Breed" value={data.breed} />
          <Field label="Sex" value={data.sex} />
          <Field label="Age" value={data.estimated_age_months ? `${data.estimated_age_months} months` : null} />
          <Field label="Weight" value={data.weight ? `${data.weight} ${data.weight_unit}` : null} />
          <Field label="Date of Birth" value={data.date_of_birth} />
          <Field label="Color" value={data.color} />
          <Field label="Microchip ID" value={data.microchip_id} />
          <Field label="Spayed/Neutered" value={data.is_neutered ? 'Yes' : 'No'} />
        </Section>

        <Section title="Intake Details">
          <Field label="Intake Type" value={INTAKE_TYPE_LABELS[data.intake_type] ?? data.intake_type} />
          <Field label="Intake Date" value={data.intake_date} />
          <Field label="Condition" value={data.intake_condition ? CONDITION_LABELS[data.intake_condition] : null} />
          <Field label="Source / Location" value={data.source_info} />
          {data.intake_notes && <Field label="Notes" value={data.intake_notes} />}
        </Section>

        <Section title="Health & Behavior">
          <Field label="Health Notes" value={data.health_notes} />
          <Field label="Behavioral Notes" value={data.behavioral_notes} />
          {data.temperament.length > 0 && (
            <div className="col-span-2">
              <dt className="text-xs text-neutral-400 mb-1">Temperament</dt>
              <dd className="flex flex-wrap gap-1.5">
                {data.temperament.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-portal-primary-50 text-portal-primary-700 text-xs font-medium">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          )}
          <Field label="Special Needs" value={data.special_needs} />
          <Field label="Dietary Needs" value={data.dietary_needs} />
          <Field label="House-trained" value={triLabel(data.is_house_trained)} />
          <Field label="Good with dogs" value={triLabel(data.good_with_dogs)} />
          <Field label="Good with cats" value={triLabel(data.good_with_cats)} />
          <Field label="Good with children" value={triLabel(data.good_with_children)} />
        </Section>

        {/* Photos */}
        {data.photo_urls.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-neutral-700 mb-3 border-b border-neutral-100 pb-1">Photos</h4>
            <div className="flex gap-2 overflow-x-auto">
              {data.photo_urls.map((url) => (
                <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {data.primary_photo_url === url && (
                    <div className="absolute top-0.5 left-0.5 bg-amber-400 text-white p-0.5 rounded">
                      <Star size={8} fill="white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Care Complexity */}
        <div>
          <h4 className="text-sm font-bold text-neutral-700 mb-3 border-b border-neutral-100 pb-1">Care Complexity</h4>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-portal-primary-500 text-white flex items-center justify-center text-sm font-bold">
              {data.care_complexity_score}
            </span>
            <span className="text-sm text-neutral-700 font-medium">
              {COMPLEXITY_LABELS[data.care_complexity_score] ?? data.care_complexity_score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
