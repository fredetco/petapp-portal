import { useState, useEffect } from 'react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { TIER_LIMITS, type TeamRole, type BusinessTeamMember } from '../../types/business';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Users, Plus, Lock, UserMinus } from 'lucide-react';

export function TeamManagement() {
  const { business } = usePortalAuth();
  const [members, setMembers] = useState<BusinessTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('staff');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const canUseTeam = business ? TIER_LIMITS[business.portal_tier].hasTeamMembers : false;

  useEffect(() => {
    if (!business || !isSupabaseConfigured) { setLoading(false); return; }

    supabase
      .from('business_team_members')
      .select('*')
      .eq('business_id', business.id)
      .order('invited_at', { ascending: false })
      .then(({ data }) => {
        setMembers((data ?? []) as BusinessTeamMember[]);
        setLoading(false);
      });
  }, [business]);

  const handleInvite = async () => {
    if (!business || !isSupabaseConfigured) return;
    if (!inviteEmail.trim()) { setError('Email is required'); return; }

    setError('');
    setInviting(true);
    try {
      const { data, error: err } = await supabase
        .from('business_team_members')
        .insert({
          business_id: business.id,
          user_id: '00000000-0000-0000-0000-000000000000', // placeholder until user accepts
          role: inviteRole,
          email: inviteEmail.trim(),
          name: null,
        })
        .select()
        .single();

      if (err) throw err;
      setMembers((prev) => [data as BusinessTeamMember, ...prev]);
      setInviteEmail('');
    } catch {
      setError('Failed to invite team member.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('business_team_members').delete().eq('id', memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const roleBadge: Record<TeamRole, 'success' | 'info' | 'default' | 'warning'> = {
    owner: 'success',
    admin: 'info' as 'default',
    staff: 'default',
    viewer: 'warning',
  };

  if (!canUseTeam) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={20} className="text-neutral-400" />
          <h3 className="text-lg font-bold text-neutral-800">Team Management</h3>
        </div>
        <p className="text-sm text-neutral-500">
          Upgrade to Pro or Enterprise to invite team members to your portal.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users size={20} className="text-portal-primary-500" />
        <h3 className="text-lg font-bold text-neutral-800">Team Members</h3>
      </div>

      {/* Invite form */}
      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="team@example.com"
            className="w-full rounded-xl border-neutral-300 focus:border-portal-primary-500 focus:ring-portal-primary-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1">Role</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as TeamRole)}
            className="rounded-xl border-neutral-300 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <Button onClick={handleInvite} loading={inviting} icon={<Plus size={16} />}>
          Invite
        </Button>
      </div>

      {error && <div className="bg-danger/10 text-danger text-sm rounded-xl p-3 mb-4">{error}</div>}

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : members.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-6">No team members yet.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 py-3">
              <div className="w-9 h-9 rounded-full bg-portal-primary-50 flex items-center justify-center text-portal-primary-600 font-bold text-sm">
                {(member.name ?? member.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-800 truncate">
                  {member.name ?? member.email ?? 'Invited'}
                </p>
                <p className="text-xs text-neutral-400">{member.email}</p>
              </div>
              <Badge variant={roleBadge[member.role]}>{member.role}</Badge>
              {!member.accepted_at && (
                <Badge variant="warning">Pending</Badge>
              )}
              {member.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(member.id)}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-danger hover:bg-red-50 transition-colors"
                  title="Remove member"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
