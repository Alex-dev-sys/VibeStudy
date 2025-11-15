'use client';

import { useRealtimeAchievements } from '@/hooks/useRealtimeAchievements';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that sets up real-time subscriptions
 * for achievements and other real-time features
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  // Subscribe to real-time achievement updates
  useRealtimeAchievements();
  
  // Add more real-time subscriptions here as needed
  // useRealtimeProgress();
  // useRealtimeLeaderboard();
  
  return <>{children}</>;
}
