import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

/** Main layout wrapper with sidebar + content area */
export function PortalShell() {
  return (
    <div className="flex min-h-screen bg-portal-bg">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
