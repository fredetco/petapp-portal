import { useLocation } from 'react-router-dom';
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
import { usePortalAuth } from '../../context/PortalAuthContext';
import { TierBadge } from './TierBadge';
import { isShelterType } from '../../types/business';
import {
  Sidebar as CatalystSidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarSpacer,
} from '../catalyst/sidebar';
import { Avatar } from '../catalyst/avatar';

const commonNavItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scanner',   icon: QrCode,          label: 'QR Scanner' },
  { to: '/pets',      icon: PawPrint,        label: 'Linked Pets' },
];

const standardNavItems = [
  { to: '/records',   icon: FileText,        label: 'Records' },
  { to: '/reminders', icon: Bell,            label: 'Reminders' },
  { to: '/campaigns', icon: Megaphone,       label: 'Campaigns' },
];

const shelterNavItems = [
  { to: '/intake',        icon: ClipboardPlus,  label: 'Animal Intake' },
  { to: '/listings',      icon: Megaphone,      label: 'Listings' },
  { to: '/applications',  icon: Users,          label: 'Applications' },
  { to: '/handoffs',      icon: ArrowRightLeft, label: 'Handoffs' },
  { to: '/adoption-stats', icon: BarChart3,     label: 'Adoption Stats' },
];

export function Sidebar() {
  const { business, signOut } = usePortalAuth();
  const location = useLocation();

  const isShelter = isShelterType(business?.type);
  const navItems = [
    ...commonNavItems,
    ...(isShelter ? shelterNavItems : standardNavItems),
  ];

  function isCurrent(to: string) {
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  }

  return (
    <CatalystSidebar className="bg-sidebar text-sidebar-text">
      <SidebarHeader>
        <SidebarSection>
          <SidebarItem href="/">
            <Avatar
              square
              initials={business?.name?.charAt(0) || 'P'}
              className="size-8 bg-primary-500 text-white text-sm"
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-sidebar-text truncate block">
                {business?.name || 'PetApp Portal'}
              </span>
              {business && <TierBadge tier={business.portal_tier} />}
            </div>
          </SidebarItem>
        </SidebarSection>
      </SidebarHeader>

      <SidebarBody>
        <SidebarSection>
          {navItems.map(({ to, icon: Icon, label }) => (
            <SidebarItem key={to} href={to} current={isCurrent(to)}>
              <Icon size={18} className={isCurrent(to) ? 'text-primary-400' : 'text-sidebar-muted'} />
              <SidebarLabel className={isCurrent(to) ? 'text-white' : 'text-sidebar-muted'}>{label}</SidebarLabel>
            </SidebarItem>
          ))}
        </SidebarSection>

        <SidebarSpacer />

        <SidebarSection>
          <SidebarItem href="/settings" current={isCurrent('/settings')}>
            <Settings size={18} className={isCurrent('/settings') ? 'text-primary-400' : 'text-sidebar-muted'} />
            <SidebarLabel className={isCurrent('/settings') ? 'text-white' : 'text-sidebar-muted'}>Settings</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter>
        <SidebarSection>
          <SidebarItem onClick={signOut}>
            <LogOut size={18} className="text-sidebar-muted" />
            <SidebarLabel className="text-sidebar-muted">Sign out</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarFooter>
    </CatalystSidebar>
  );
}
