/**
 * Offline Manager
 * Detects and manages offline/online state
 */

type OnlineCallback = () => void;
type OfflineCallback = () => void;

class OfflineManager {
  private onlineCallbacks: Set<OnlineCallback> = new Set();
  private offlineCallbacks: Set<OfflineCallback> = new Set();
  private isListening = false;

  /**
   * Initialize offline detection
   */
  initialize(): void {
    if (this.isListening) return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.isListening = true;

    console.log('[OfflineManager] Initialized. Current status:', this.isOnline() ? 'Online' : 'Offline');
  }

  /**
   * Cleanup event listeners
   */
  cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.isListening = false;
    this.onlineCallbacks.clear();
    this.offlineCallbacks.clear();
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Check if currently offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Register callback for when connection comes back online
   */
  onOnline(callback: OnlineCallback): () => void {
    this.onlineCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.onlineCallbacks.delete(callback);
    };
  }

  /**
   * Register callback for when connection goes offline
   */
  onOffline(callback: OfflineCallback): () => void {
    this.offlineCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.offlineCallbacks.delete(callback);
    };
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    console.log('[OfflineManager] Connection restored');
    
    // Notify all callbacks
    this.onlineCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[OfflineManager] Error in online callback:', error);
      }
    });
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    console.log('[OfflineManager] Connection lost');
    
    // Notify all callbacks
    this.offlineCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[OfflineManager] Error in offline callback:', error);
      }
    });
  };

  /**
   * Wait for online connection
   */
  async waitForOnline(timeout?: number): Promise<boolean> {
    if (this.isOnline()) {
      return true;
    }

    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout | undefined;

      const unsubscribe = this.onOnline(() => {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          resolve(false);
        }, timeout);
      }
    });
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();
