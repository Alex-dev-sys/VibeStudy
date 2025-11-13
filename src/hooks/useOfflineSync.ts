/**
 * Offline Sync Hook
 * Automatically syncs queued operations when connection is restored
 */

import { useEffect } from 'react';
import { offlineManager } from '@/lib/sync/offline-manager';
import { syncQueue } from '@/lib/sync';

export function useOfflineSync() {
  useEffect(() => {
    // Initialize offline manager
    offlineManager.initialize();

    // Subscribe to online event
    const unsubscribe = offlineManager.onOnline(async () => {
      console.log('[useOfflineSync] Connection restored, processing queue...');
      
      try {
        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Process queued operations
        await syncQueue.processQueue();
        
        console.log('[useOfflineSync] Queue processed successfully');
      } catch (error) {
        console.error('[useOfflineSync] Failed to process queue:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
