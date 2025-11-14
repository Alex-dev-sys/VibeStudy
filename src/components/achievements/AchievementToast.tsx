'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Achievement } from '@/types/achievements';
import { announceLiveRegion } from '@/lib/accessibility/focus-manager';

interface AchievementToastProps {
  achievement: Achievement;
}

export function showAchievementToast(achievement: Achievement) {
  // Announce to screen readers
  announceLiveRegion(
    `Достижение получено! ${achievement.title}. ${achievement.description}`,
    'assertive'
  );
  
  toast.custom(
    (t) => (
      <AnimatePresence>
        {t && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="glass-panel flex items-center gap-4 rounded-2xl border border-accent/60 bg-accent/10 p-4 shadow-2xl shadow-accent/30"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-4xl">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-accent">
                  Достижение получено!
                </span>
                <span className="text-xl">🎉</span>
              </div>
              <h4 className="mt-1 text-lg font-bold text-white">{achievement.title}</h4>
              <p className="mt-1 text-sm text-white/70">{achievement.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    {
      duration: 5000,
      position: 'top-center'
    }
  );
}

export function AchievementToast({ achievement }: AchievementToastProps) {
  useEffect(() => {
    showAchievementToast(achievement);
  }, [achievement]);

  return null;
}

