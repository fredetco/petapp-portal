import { supabase, isSupabaseConfigured } from './supabase';
import type { Business, BusinessTeamMember, TeamRole } from '../types/business';

const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL || 'https://petapp-nu.vercel.app';

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signInWithApple() {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signInWithMagicLink(email: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

/** Fetch the business owned by this user, or null */
export async function fetchOwnedBusiness(userId: string): Promise<Business | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_user_id', userId)
    .eq('active', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

/** Fetch team membership for this user (if they're not the owner but a team member) */
export async function fetchTeamMembership(userId: string): Promise<{
  business: Business;
  membership: BusinessTeamMember;
} | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('business_team_members')
    .select('*, business:businesses(*)')
    .eq('user_id', userId)
    .eq('active', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  return {
    business: data.business as unknown as Business,
    membership: data as unknown as BusinessTeamMember,
  };
}

/** Determine the user's role for a given business */
export function getUserRole(
  userId: string,
  business: Business | null,
  membership: BusinessTeamMember | null,
): TeamRole | null {
  if (!business) return null;
  if (business.owner_user_id === userId) return 'owner';
  if (membership) return membership.role;
  return null;
}

export { MAIN_APP_URL };
