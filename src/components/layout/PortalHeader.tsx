import { Bell } from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';

interface PortalHeaderProps {
  title: string;
}

export function PortalHeader({ title }: PortalHeaderProps) {
  const { user } = usePortalAuth();

  return (
    <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-bold text-neutral-800">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notification bell (placeholder — wired in Step 23) */}
        <button className="relative p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors">
          <Bell size={20} />
          {/* Unread dot placeholder */}
          {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" /> */}
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-portal-primary-100 flex items-center justify-center text-portal-primary-700 font-bold text-xs">
          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
    </header>
  );
}
