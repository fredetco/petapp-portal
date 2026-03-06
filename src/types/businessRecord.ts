export type RecordType =
  | 'examination'
  | 'vaccination'
  | 'diagnosis'
  | 'treatment'
  | 'prescription'
  | 'lab_result'
  | 'surgery'
  | 'grooming_session'
  | 'training_session'
  | 'weight_check'
  | 'general_note';

export interface BusinessRecord {
  id: string;
  business_id: string;
  pet_id: string;
  service_link_id: string | null;
  author_user_id: string;

  // Content
  type: RecordType;
  title: string;
  notes: string | null;
  date: string; // ISO date

  // Type-specific fields
  weight: number | null;
  weight_unit: string | null;
  vaccination_name: string | null;
  vaccination_batch: string | null;
  vaccination_next_due: string | null; // ISO date
  medications: string[];
  diagnosis_text: string | null;
  treatment_text: string | null;
  lab_results: Record<string, unknown> | null;
  attachments: string[];

  // Visibility
  visible_to_owner: boolean;

  created_at: string;
  updated_at: string;
}

/** Record type display metadata */
export const RECORD_TYPE_META: Record<RecordType, { label: string; icon: string; color: string }> = {
  examination:      { label: 'Examination',      icon: 'Stethoscope',   color: '#3B82F6' },
  vaccination:      { label: 'Vaccination',      icon: 'Syringe',       color: '#22C55E' },
  diagnosis:        { label: 'Diagnosis',        icon: 'FileSearch',    color: '#EF4444' },
  treatment:        { label: 'Treatment',        icon: 'Pill',          color: '#8B5CF6' },
  prescription:     { label: 'Prescription',     icon: 'ClipboardList', color: '#F59E0B' },
  lab_result:       { label: 'Lab Result',       icon: 'FlaskConical',  color: '#06B6D4' },
  surgery:          { label: 'Surgery',          icon: 'Scissors',      color: '#DC2626' },
  grooming_session: { label: 'Grooming Session', icon: 'Sparkles',      color: '#8B5CF6' },
  training_session: { label: 'Training Session', icon: 'GraduationCap', color: '#F59E0B' },
  weight_check:     { label: 'Weight Check',     icon: 'Scale',         color: '#06B6D4' },
  general_note:     { label: 'General Note',     icon: 'FileText',      color: '#6B7280' },
};
