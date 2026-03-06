import { format } from 'date-fns';
import type { BusinessRecord, RecordType } from '../../types/businessRecord';
import { RECORD_TYPE_META } from '../../types/businessRecord';
import { Badge } from '../shared/Badge';
import {
  Stethoscope,
  Syringe,
  FileSearch,
  Pill,
  ClipboardList,
  FlaskConical,
  Scissors,
  Sparkles,
  GraduationCap,
  Scale,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';

const iconMap: Record<string, typeof Stethoscope> = {
  Stethoscope,
  Syringe,
  FileSearch,
  Pill,
  ClipboardList,
  FlaskConical,
  Scissors,
  Sparkles,
  GraduationCap,
  Scale,
  FileText,
};

interface Props {
  record: BusinessRecord & { pet_name?: string };
  showPetName?: boolean;
  onToggleVisibility?: (recordId: string, visible: boolean) => void;
}

export function RecordCard({ record, showPetName = false, onToggleVisibility }: Props) {
  const meta = RECORD_TYPE_META[record.type as RecordType];
  const IconComponent = iconMap[meta?.icon ?? 'FileText'] ?? FileText;

  return (
    <div className="flex gap-4 p-4 hover:bg-neutral-50 transition-colors">
      {/* Type icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${meta?.color ?? '#6B7280'}20` }}
      >
        <IconComponent size={18} style={{ color: meta?.color ?? '#6B7280' }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-neutral-800 truncate">{record.title}</span>
          <Badge variant="default">{meta?.label ?? record.type}</Badge>
          {showPetName && record.pet_name && (
            <span className="text-xs text-neutral-400 truncate">{record.pet_name}</span>
          )}
        </div>

        {/* Type-specific info */}
        <div className="text-xs text-neutral-500 space-y-0.5">
          {record.vaccination_name && (
            <p>Vaccine: {record.vaccination_name}{record.vaccination_batch ? ` (Batch: ${record.vaccination_batch})` : ''}</p>
          )}
          {record.vaccination_next_due && (
            <p>Next due: {format(new Date(record.vaccination_next_due), 'MMM d, yyyy')}</p>
          )}
          {record.diagnosis_text && <p>Diagnosis: {record.diagnosis_text}</p>}
          {record.treatment_text && <p>Treatment: {record.treatment_text}</p>}
          {record.weight && (
            <p>Weight: {record.weight} {record.weight_unit ?? 'kg'}</p>
          )}
          {record.medications.length > 0 && (
            <p>Medications: {record.medications.join(', ')}</p>
          )}
          {record.notes && <p className="text-neutral-400 mt-1">{record.notes}</p>}
        </div>
      </div>

      {/* Date + visibility */}
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs text-neutral-400">
          {format(new Date(record.date), 'MMM d, yyyy')}
        </span>
        {onToggleVisibility && (
          <button
            onClick={() => onToggleVisibility(record.id, !record.visible_to_owner)}
            className={`p-1 rounded-lg transition-colors ${
              record.visible_to_owner
                ? 'text-portal-primary-500 hover:bg-portal-primary-50'
                : 'text-neutral-300 hover:bg-neutral-100'
            }`}
            title={record.visible_to_owner ? 'Visible to owner — click to hide' : 'Hidden from owner — click to show'}
          >
            {record.visible_to_owner ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
