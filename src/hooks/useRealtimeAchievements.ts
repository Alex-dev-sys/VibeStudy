import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAchievementsStore } from '@/store/achievements-store';
import { getCurrentUser } from '@/lib/supabase/auth';

/**
 * Hook for subscribing to real-time achievement updates
 * Listens for changes in user_achievements table and updates local store
 */
export function useRealtimeAchievements() {
  useEffect(() => {
    let channel: any = null;
    
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
            
            // Fetch updated achievements from cloud
            const store = useAchievementsStore.getState();
            store.fetchFromCloud();
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
            
            // Fetch updated stats from cloud
            const store = useAchievementsStore.getState();
            store.fetchFromCloud();
          }
        )
        .subscribe();
    };
    
    setupSubscription();
    
    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);
}
