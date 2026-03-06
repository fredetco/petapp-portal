import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  PawPrint,
  FileText,
  Bell,
  Megaphone,
  Settings,
  LogOut,
} from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { TierBadge } from './TierBadge';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scanner',   icon: QrCode,          label: 'QR Scanner' },
  { to: '/pets',      icon: PawPrint,        label: 'Linked Pets' },
  { to: '/records',   icon: FileText,        label: 'Records' },
  { to: '/reminders', icon: Bell,            label: 'Reminders' },
  { to: '/campaigns', icon: Megaphone,       label: 'Campaigns' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export function Sidebar() {
  const { business, signOut } = usePortalAuth();
  const location = useLocation();

  return (
    <aside className="w-60 bg-portal-sidebar flex flex-col h-screen sticky top-0">
      {/* Logo / business name */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-portal-primary-500 flex items-center justify-center text-white font-bold text-sm">
            {business?.name?.charAt(0) || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-portal-sidebar-text font-bold text-sm truncate">
              {business?.name || 'PetApp Portal'}
            </p>
            {business && <TierBadge tier={business.portal_tier} />}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-portal-primary-600 text-white'
                  : 'text-portal-sidebar-muted hover:bg-portal-sidebar-hover hover:text-portal-sidebar-text'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-portal-sidebar-muted hover:bg-portal-sidebar-hover hover:text-portal-sidebar-text transition-colors w-full"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
