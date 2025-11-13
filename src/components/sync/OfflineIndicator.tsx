'use client';

import { useEffect, useState } from 'react';
import { offlineManager } from '@/lib/sync/offline-manager';
import { syncQueue } from '@/lib/sync';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Initialize offline manager
    offlineManager.initialize();

    // Set initial state
    setIsOffline(offlineManager.isOffline());

    // Subscribe to online/offline events
    const unsubscribeOnline = offlineManager.onOnline(() => {
      setIsOffline(false);
    });

    const unsubscribeOffline = offlineManager.onOffline(() => {
      setIsOffline(true);
    });

    // Update queue size periodically
    const updateQueueSize = async () => {
      const size = await syncQueue.getQueueSize();
      setQueueSize(size);
    };

    updateQueueSize();
    const interval = setInterval(updateQueueSize, 5000);

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && queueSize === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        {isOffline ? (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium">Нет подключения</p>
              {queueSize > 0 && (
                <p className="text-sm text-gray-300">
                  {queueSize} {queueSize === 1 ? 'операция' : 'операций'} в очереди
                </p>
              )}
            </div>
          </>
        ) : queueSize > 0 ? (
          <>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium">Синхронизация...</p>
              <p className="text-sm text-gray-300">
                {queueSize} {queueSize === 1 ? 'операция' : 'операций'}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
