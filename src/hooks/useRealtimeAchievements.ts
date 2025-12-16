import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAchievementsStore } from '@/store/achievements-store';
import { getCurrentUser } from '@/lib/supabase/auth';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook for subscribing to real-time achievement updates
 * Listens for changes in user_achievements table and updates local store
 * Uses debouncing to prevent excessive fetches on rapid updates
 */
export function useRealtimeAchievements() {
  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let debounceTimer: NodeJS.Timeout | null = null;

    // Debounced fetch function to prevent multiple rapid fetches
    const debouncedFetch = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        const store = useAchievementsStore.getState();
        store.fetchFromCloud();
      }, 500); // Wait 500ms after the last event before fetching
    };

    const setupSubscription = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const supabase = getSupabaseClient();
      if (!supabase) return;

      // Subscribe to achievement changes for current user
      channel = supabase
        .channel('achievements-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Achievement unlocked via realtime:', payload);
            debouncedFetch();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Achievement stats updated via realtime:', payload);
            debouncedFetch();
          }
        )
        .subscribe();
    };

    setupSubscription();

    // Cleanup subscription and pending debounce on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);
}
