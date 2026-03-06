import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/** Handles OAuth callback redirects (Google, Apple, magic link) */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate('/auth', { replace: true });
      return;
    }

    // Supabase auto-detects the hash/code in the URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-portal-bg">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-neutral-500 text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}
