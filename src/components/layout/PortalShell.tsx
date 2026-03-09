import { Outlet } from 'react-router-dom';
import { SidebarLayout } from '../catalyst/sidebar-layout';
import { Sidebar } from './Sidebar';
import { Navbar, NavbarSpacer, NavbarItem } from '../catalyst/navbar';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { Avatar } from '../catalyst/avatar';

/** Main layout wrapper with responsive sidebar + content area */
export function PortalShell() {
  const { user } = usePortalAuth();

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarItem href="/settings">
            <Avatar
              initials={user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
              className="size-8 bg-primary-100 text-primary-700"
            />
          </NavbarItem>
        </Navbar>
      }
      sidebar={<Sidebar />}
    >
      <Outlet />
    </SidebarLayout>
  );
}
