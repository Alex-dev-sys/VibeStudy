'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import type { Achievement } from '@/types/achievements';

interface AchievementUnlockAnimationProps {
  achievement: Achievement | null;
  onComplete?: () => void;
}

export function AchievementUnlockAnimation({ 
  achievement, 
  onComplete 
}: AchievementUnlockAnimationProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
      >
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          onClick={onComplete}
        />

        {/* Achievement card */}
        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 20,
            rotateY: { duration: 0.6 }
          }}
          className="relative z-10 max-w-md w-full pointer-events-auto"
        >
          <Card className="p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40 shadow-2xl">
            <div className="text-center space-y-4">
              {/* Badge flip animation */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ 
                  duration: 1.2, 
                  ease: 'easeInOut',
                  times: [0, 0.5, 1]
                }}
                className="text-7xl mb-4"
              >
                {achievement.icon}
              </motion.div>

              {/* Shine effect */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ 
                  duration: 1.5, 
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                style={{ transform: 'skewX(-20deg)' }}
              />

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-yellow-400 font-semibold uppercase tracking-wider mb-2"
                >
                  Достижение разблокировано!
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold mb-2"
                >
                  {achievement.title}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/70"
                >
                  {achievement.description}
                </motion.p>
              </div>

              {/* Particle burst effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      scale: 0,
                      x: 0,
                      y: 0,
                      opacity: 1
                    }}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: Math.cos((i * 30) * Math.PI / 180) * 100,
                      y: Math.sin((i * 30) * Math.PI / 180) * 100,
                      opacity: [1, 1, 0]
                    }}
                    transition={{ 
                      duration: 1,
                      delay: 0.2,
                      ease: 'easeOut'
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onComplete}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
              >
                Продолжить
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
