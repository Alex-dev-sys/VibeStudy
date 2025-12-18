'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { ACHIEVEMENTS } from '@/lib/core/achievements';
import type { Achievement } from '@/types/achievements';

interface DayCompletionModalProps {
  day: number;
  isOpen: boolean;
  onClose: () => void;
}

function getNextMilestone(completedDays: number): string {
  if (completedDays < 7) return `Завершить 7 дней (Неделя позади)`;
  if (completedDays < 30) return `Завершить 30 дней (Месяц упорства)`;
  if (completedDays < 60) return `Завершить 60 дней (Два месяца силы)`;
  if (completedDays < 90) return `Завершить 90 дней (Junior разработчик!)`;
  return `Ты достиг максимума! 🎉`;
}

export function DayCompletionModal({ day, isOpen, onClose }: DayCompletionModalProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  
  const streak = useProgressStore(state => state.record.streak);
  const completedDays = useProgressStore(state => state.record.completedDays);
  const unlockedAchievements = useAchievementsStore(state => state.unlockedAchievements);
  const stats = useAchievementsStore(state => state.stats);

  // Set up window size for confetti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Show confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      
      // Check for new achievements unlocked with this day completion
      const unlockedIds = unlockedAchievements.map(a => a.id);
      const newlyUnlocked = ACHIEVEMENTS.filter(achievement => {
        if (unlockedIds.includes(achievement.id)) return false;
        return achievement.checkCondition(stats);
      }).map(a => ({ ...a, unlockedAt: Date.now() }));
      
      setNewAchievements(newlyUnlocked);
      
      // Hide confetti after 4 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, unlockedAchievements, stats]);

  const xpEarned = 50; // 50 XP per day

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && windowSize.width > 0 && (
          <div className="fixed inset-0 pointer-events-none z-[100]">
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={300}
              gravity={0.3}
              colors={['#ff0094', '#ff5bc8', '#ffd200', '#ffffff', '#00ff94']}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="p-8">
        <div className="text-center space-y-6">
          {/* Celebration animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-8xl"
          >
            🎉
          </motion.div>
          
          <div>
            <h2 className="text-3xl font-bold mb-2">День {day} завершён!</h2>
            <p className="text-white/70">Отличная работа, продолжай в том же духе</p>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold">+{xpEarned}</div>
                <div className="text-xs text-white/60">XP заработано</div>
              </motion.div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-xs text-white/60">Дней подряд</div>
              </motion.div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl font-bold">{completedDays.length}/90</div>
                <div className="text-xs text-white/60">Прогресс</div>
              </motion.div>
            </Card>
          </div>
          
          {/* New achievements */}
          {newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-lg">Новые достижения разблокированы!</h3>
              <div className="space-y-2">
                {newAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                      <div className="flex items-center gap-3">
                        <motion.div
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: 360 }}
                          transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                          className="text-3xl"
                        >
                          {achievement.icon}
                        </motion.div>
                        <div className="text-left flex-1">
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-white/60">{achievement.description}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Next milestone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-4 bg-white/5">
              <div className="text-sm text-white/60 mb-1">Следующая цель</div>
              <div className="font-semibold text-white">
                {getNextMilestone(completedDays.length)}
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onClose} 
              className="w-full"
            >
              Продолжить обучение
            </Button>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}
