import { useMemo } from 'react';
import { format } from 'date-fns';
import type { BusinessRecord } from '../../types/businessRecord';
import { RecordCard } from './RecordCard';

interface Props {
  records: (BusinessRecord & { pet_name?: string })[];
  showPetName?: boolean;
  onToggleVisibility?: (recordId: string, visible: boolean) => void;
}

export function RecordTimeline({ records, showPetName = false, onToggleVisibility }: Props) {
  // Group records by month
  const grouped = useMemo(() => {
    const groups: { month: string; records: (BusinessRecord & { pet_name?: string })[] }[] = [];
    let currentMonth = '';

    for (const record of records) {
      const month = format(new Date(record.date), 'MMMM yyyy');
      if (month !== currentMonth) {
        currentMonth = month;
        groups.push({ month, records: [] });
      }
      groups[groups.length - 1].records.push(record);
    }

    return groups;
  }, [records]);

  return (
    <div className="space-y-6">
      {grouped.map(({ month, records: monthRecords }) => (
        <div key={month}>
          {/* Month header */}
          <div className="sticky top-0 bg-portal-bg z-10 pb-2">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {month}
            </h4>
          </div>

          {/* Records in this month */}
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100">
            {monthRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                showPetName={showPetName}
                onToggleVisibility={onToggleVisibility}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
