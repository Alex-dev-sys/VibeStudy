'use client';

import { useEffect, useRef } from 'react';
import { useProfileStore } from '@/store/profile-store';
import { logInfo, logWarn } from '@/lib/core/logger';

export function AutoMigrationGate() {
  const isAuthenticated = useProfileStore((state) => state.profile.isAuthenticated);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasRun.current) {
      return;
    }
    hasRun.current = true;

    (async () => {
      try {
        const [{ migrateAllData }, { getCurrentUser }] = await Promise.all([
          import('@/lib/migration'),
          import('@/lib/supabase/auth')
        ]);
        const user = await getCurrentUser();
        if (!user) {
          return;
        }
        await migrateAllData(user.id, { clearLocalDataAfterSuccess: false });
        logInfo('Automatic migration completed', { component: 'AutoMigrationGate' });
      } catch (error) {
        logWarn('Automatic migration failed', {
          component: 'AutoMigrationGate',
          metadata: { error: error instanceof Error ? error.message : 'unknown' }
        });
      }
    })();
  }, [isAuthenticated]);

  return null;
}

