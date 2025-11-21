'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Skeleton } from './skeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number; // Delay before showing loading state (default 500ms)
  minDuration?: number; // Minimum duration to show loading (prevents flash)
}

export function LoadingState({ 
  isLoading, 
  children, 
  fallback,
  delay = 500,
  minDuration = 300
}: LoadingStateProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minDurationTimer: NodeJS.Timeout;

    if (isLoading) {
      // Start delay timer
      delayTimer = setTimeout(() => {
        setShowLoading(true);
        setStartTime(Date.now());
      }, delay);
    } else {
      // If loading finished, check if we need to wait for minDuration
      if (showLoading && startTime) {
        const elapsed = Date.now() - startTime;
        const remaining = minDuration - elapsed;
        
        if (remaining > 0) {
          minDurationTimer = setTimeout(() => {
            setShowLoading(false);
            setStartTime(null);
          }, remaining);
        } else {
          setShowLoading(false);
          setStartTime(null);
        }
      } else {
        setShowLoading(false);
        setStartTime(null);
      }
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minDurationTimer);
    };
  }, [isLoading, delay, minDuration, showLoading, startTime]);

  return (
    <AnimatePresence mode="wait">
      {showLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {fallback || <DefaultLoadingFallback />}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DefaultLoadingFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// Hook for managing loading states with automatic toast
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const startLoading = (message?: string) => {
    setIsLoading(true);
    if (message) {
      const { toast } = require('@/lib/toast');
      const id = toast.loading(message);
      setLoadingToastId(id);
    }
  };

  const stopLoading = () => {
    setIsLoading(false);
    if (loadingToastId) {
      const { toast } = require('@/lib/toast');
      toast.dismiss(loadingToastId);
      setLoadingToastId(null);
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    setIsLoading
  };
}
