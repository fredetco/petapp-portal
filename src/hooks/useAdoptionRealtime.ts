import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

/**
 * Subscribe to realtime adoption events for a shelter.
 * Invalidates relevant queries when new applications or handoff updates arrive.
 */
export function useAdoptionRealtime(shelterId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shelterId) return;

    const channel = supabase
      .channel(`adoption-${shelterId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'adoption_applications',
          filter: `shelter_id=eq.${shelterId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['shelter-stats'] });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'adoption_handoffs',
          filter: `shelter_id=eq.${shelterId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['handoffs'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shelterId, queryClient]);
}
