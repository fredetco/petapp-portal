import { useQuery } from '@tanstack/react-query';
import { Heart, ClipboardPlus, ArrowRightLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { fetchShelterActivity, type ShelterActivityItem } from '../../services/analytics';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const typeConfig: Record<ShelterActivityItem['type'], { icon: typeof Heart; color: string }> = {
  intake:      { icon: ClipboardPlus,  color: 'text-portal-primary-500 bg-portal-primary-50' },
  adoption:    { icon: Heart,          color: 'text-green-500 bg-green-50' },
  application: { icon: ClipboardPlus,  color: 'text-amber-500 bg-amber-50' },
  listing:     { icon: ClipboardPlus,  color: 'text-blue-500 bg-blue-50' },
  handoff:     { icon: ArrowRightLeft, color: 'text-purple-500 bg-purple-50' },
};

function ActivityRow({ item }: { item: ShelterActivityItem }) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 truncate">{item.title}</p>
        <p className="text-xs text-neutral-500 truncate">{item.description}</p>
      </div>
      <span className="text-xs text-neutral-400 shrink-0">
        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
      </span>
    </div>
  );
}

export function ShelterActivityFeed() {
  const { business } = usePortalAuth();

  const { data: items, isLoading } = useQuery({
    queryKey: ['shelter-activity', business?.id],
    queryFn: () => fetchShelterActivity(business!.id),
    enabled: !!business,
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-neutral-800 mb-3">Recent Activity</h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : !items?.length ? (
        <p className="text-sm text-neutral-500 text-center py-8">
          No activity yet. Start by adding an animal intake.
        </p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
