import { useState } from 'react';
import { PortalHeader } from '../layout/PortalHeader';
import { BusinessProfile } from './BusinessProfile';
import { TeamManagement } from './TeamManagement';
import { BillingPage } from './BillingPage';
import { Building2, Users, CreditCard } from 'lucide-react';

type Tab = 'profile' | 'team' | 'billing';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: 'profile', label: 'Business Profile', icon: Building2 },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'billing', label: 'Billing & Plan', icon: CreditCard },
  ];

  return (
    <>
      <PortalHeader title="Settings" />
      <div className="p-6">
        {/* Tab bar */}
        <div className="flex border-b border-neutral-200 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-portal-primary-500 text-portal-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'profile' && <BusinessProfile />}
        {activeTab === 'team' && <TeamManagement />}
        {activeTab === 'billing' && <BillingPage />}
      </div>
    </>
  );
}
