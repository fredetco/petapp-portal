import { useQuery } from '@tanstack/react-query';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { fetchRecentActivity, type ActivityItem } from '../../services/analytics';
import { FileText, Link, Bell, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  record_added: FileText,
  link_approved: Link,
  link_requested: Clock,
  reminder_sent: Bell,
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = typeIcons[item.type] || FileText;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="p-2 rounded-lg bg-neutral-100 text-neutral-500 shrink-0">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">{item.title}</p>
        <p className="text-xs text-neutral-500">{item.description}</p>
      </div>
      <span className="text-xs text-neutral-400 shrink-0">
        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
      </span>
    </div>
  );
}

export function ActivityFeed() {
  const { business } = usePortalAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ['activity-feed', business?.id],
    queryFn: () => fetchRecentActivity(business!.id),
    enabled: !!business,
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-neutral-800 mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-6">
          No activity yet. Start by linking your first pet!
        </p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {activities.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
