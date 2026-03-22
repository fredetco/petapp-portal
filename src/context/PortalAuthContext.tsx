import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import {
  signInWithEmail as _signInWithEmail,
  signUpWithEmail as _signUpWithEmail,
  signInWithGoogle as _signInWithGoogle,
  signInWithApple as _signInWithApple,
  signInWithMagicLink as _signInWithMagicLink,
  signOut as _signOut,
  fetchOwnedBusiness,
  fetchTeamMembership,
  getUserRole,
} from '../services/auth';
import type { Business, TeamRole } from '../types/business';

interface PortalAuthContextType {
  user: User | null;
  business: Business | null;
  teamRole: TeamRole | null;
  loading: boolean;
  hasBusiness: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshBusiness: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [teamRole, setTeamRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBusinessData = useCallback(async (userId: string) => {
    try {
      // 1) Check if user owns a business
      const owned = await fetchOwnedBusiness(userId);
      if (owned) {
        setBusiness(owned);
        setTeamRole('owner');
        return;
      }

      // 2) Check if user is a team member
      const team = await fetchTeamMembership(userId);
      if (team) {
        setBusiness(team.business);
        setTeamRole(getUserRole(userId, team.business, team.membership));
        return;
      }

      // 3) No business found — user needs to onboard
      setBusiness(null);
      setTeamRole(null);
    } catch (err) {
      console.error('Failed to load business data:', err);
      setBusiness(null);
      setTeamRole(null);
    }
  }, []);

  const refreshBusiness = useCallback(async () => {
    if (user) await loadBusinessData(user.id);
  }, [user, loadBusinessData]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadBusinessData(session.user.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to get session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          await loadBusinessData(newUser.id);
        } else {
          setBusiness(null);
          setTeamRole(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [loadBusinessData]);

  const value: PortalAuthContextType = {
    user,
    business,
    teamRole,
    loading,
    hasBusiness: !!business,
    signInWithEmail: _signInWithEmail,
    signUpWithEmail: _signUpWithEmail,
    signInWithGoogle: _signInWithGoogle,
    signInWithApple: _signInWithApple,
    signInWithMagicLink: _signInWithMagicLink,
    signOut: _signOut,
    refreshBusiness,
  };

  return (
    <PortalAuthContext.Provider value={value}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return context;
}
