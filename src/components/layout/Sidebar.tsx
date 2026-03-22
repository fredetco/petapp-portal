import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  PawPrint,
  FileText,
  Bell,
  Megaphone,
  Settings,
  LogOut,
  ClipboardPlus,
  Users,
  ArrowRightLeft,
  BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { TierBadge } from './TierBadge';
import { isShelterType } from '../../types/business';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const commonNavItems: NavItem[] = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scanner',   icon: QrCode,          label: 'QR Scanner' },
  { to: '/pets',      icon: PawPrint,        label: 'Linked Pets' },
];

const standardNavItems: NavItem[] = [
  { to: '/records',   icon: FileText,        label: 'Records' },
  { to: '/reminders', icon: Bell,            label: 'Reminders' },
  { to: '/campaigns', icon: Megaphone,       label: 'Campaigns' },
];

const shelterNavItems: NavItem[] = [
  { to: '/intake',        icon: ClipboardPlus,  label: 'Animal Intake' },
  { to: '/listings',      icon: Megaphone,      label: 'Listings' },
  { to: '/applications',  icon: Users,          label: 'Applications' },
  { to: '/handoffs',      icon: ArrowRightLeft, label: 'Handoffs' },
  { to: '/adoption-stats', icon: BarChart3,     label: 'Adoption Stats' },
];

function isCurrent(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-white/10 text-white'
          : 'text-sidebar-muted hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-primary-400' : 'text-sidebar-muted'} />
      <span className="truncate">{item.label}</span>
      {active && (
        <span className="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-white" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const { business, signOut } = usePortalAuth();
  const location = useLocation();

  const isShelter = isShelterType(business?.type);
  const navItems = [
    ...commonNavItems,
    ...(isShelter ? shelterNavItems : standardNavItems),
  ];

  return (
    <nav className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-text">
      {/* Header */}
      <div className="flex flex-col border-b border-white/10 p-4">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="size-8 rounded-lg bg-primary-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {business?.name?.charAt(0) || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-sidebar-text truncate block">
              {business?.name || 'PetApp Portal'}
            </span>
            {business && <TierBadge tier={business.portal_tier} />}
          </div>
        </Link>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink key={item.to} item={item} active={isCurrent(location.pathname, item.to)} />
          ))}
        </div>

        {/* Spacer */}
        <div className="mt-8 flex-1" />

        {/* Settings */}
        <div className="flex flex-col gap-0.5">
          <NavLink
            item={{ to: '/settings', icon: Settings, label: 'Settings' }}
            active={isCurrent(location.pathname, '/settings')}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col border-t border-white/10 p-4">
        <button
          onClick={signOut}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted hover:bg-white/5 hover:text-white transition-colors w-full text-left"
        >
          <LogOut size={18} className="text-sidebar-muted" />
          <span className="truncate">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
