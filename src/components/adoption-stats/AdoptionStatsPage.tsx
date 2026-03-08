import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList,
} from 'recharts';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { fetchAdoptionStats, type AdoptionStatsData } from '../../services/adoptionStats';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { TrendingUp, Clock, RotateCcw, PawPrint } from 'lucide-react';

const PIE_COLORS = ['#1A8A4A', '#34D399', '#60A5FA', '#F59E0B', '#F87171', '#A78BFA', '#FB923C'];

function StatCard({ icon: Icon, label, value, sub }: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon size={18} className="text-primary-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-neutral-800">{value}</p>
          <p className="text-xs text-neutral-500">{label}</p>
          {sub && <p className="text-xs text-neutral-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export function AdoptionStatsPage() {
  const { business } = usePortalAuth();

  const { data: stats, isLoading } = useQuery<AdoptionStatsData>({
    queryKey: ['adoption-stats', business?.id],
    queryFn: () => fetchAdoptionStats(business!.id),
    enabled: !!business,
  });

  if (isLoading || !stats) {
    return (
      <>
        <PortalHeader title="Adoption Analytics" />
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  const funnelData = [
    { name: 'Listings', value: stats.funnel.listings, fill: '#1A8A4A' },
    { name: 'Views', value: stats.funnel.views, fill: '#34D399' },
    { name: 'Favorites', value: stats.funnel.favorites, fill: '#60A5FA' },
    { name: 'Applications', value: stats.funnel.applications, fill: '#F59E0B' },
    { name: 'Approved', value: stats.funnel.approved, fill: '#F97316' },
    { name: 'Adopted', value: stats.funnel.completed, fill: '#10B981' },
  ];

  return (
    <>
      <PortalHeader title="Adoption Analytics" />
      <div className="p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={PawPrint} label="Total Adoptions" value={stats.totalAdoptions} />
          <StatCard icon={TrendingUp} label="Active Listings" value={stats.funnel.listings} />
          <StatCard icon={Clock} label="Avg Days to Adopt" value={stats.avgDaysToAdopt} sub="intake → adoption" />
          <StatCard icon={RotateCcw} label="Return Rate" value={`${stats.returnRate}%`} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Adoption funnel */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-neutral-700 mb-4">Adoption Funnel</h2>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#374151" stroke="none" fontSize={12} dataKey="name" />
                  <LabelList position="center" fill="#fff" stroke="none" fontSize={14} fontWeight={700} dataKey="value" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly adoptions */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-neutral-700 mb-4">Adoptions Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyAdoptions}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(m: string) => {
                    const [y, mo] = m.split('-');
                    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(mo) - 1]} '${y.slice(2)}`;
                  }}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
                <Tooltip
                  labelFormatter={(m: string) => {
                    const [y, mo] = m.split('-');
                    return `${['January','February','March','April','May','June','July','August','September','October','November','December'][parseInt(mo) - 1]} ${y}`;
                  }}
                />
                <Bar dataKey="count" fill="#1A8A4A" radius={[4, 4, 0, 0]} name="Adoptions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Species breakdown */}
        {stats.speciesBreakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-neutral-700 mb-4">Species Breakdown</h2>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={stats.speciesBreakdown}
                    dataKey="count"
                    nameKey="species"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {stats.speciesBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap gap-3">
                {stats.speciesBreakdown.map((item, i) => (
                  <div key={item.species} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm text-neutral-700">{item.species}</span>
                    <span className="text-sm font-bold text-neutral-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
