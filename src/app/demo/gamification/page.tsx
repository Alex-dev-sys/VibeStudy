'use client';

import { useState } from 'react';
import { 
  LevelProgressBar, 
  StreakIndicator, 
  DayCompletionModal,
  AchievementUnlockAnimation 
} from '@/components/gamification';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ACHIEVEMENTS } from '@/lib/core/achievements';

export default function GamificationDemoPage() {
  const [showDayCompletion, setShowDayCompletion] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(ACHIEVEMENTS[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Gamification System Demo</h1>
          <p className="text-white/70">
            Демонстрация всех компонентов системы геймификации
          </p>
        </div>

        {/* Level Progress Bar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Level Progress Bar</h2>
          <p className="text-white/70 text-sm mb-4">
            Показывает текущий уровень пользователя, прогресс и XP
          </p>
          <LevelProgressBar />
        </section>

        {/* Streak Indicator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Streak Indicator</h2>
          <p className="text-white/70 text-sm mb-4">
            Отображает текущую серию дней с предупреждением о риске потери
          </p>
          <div className="flex gap-4">
            <StreakIndicator />
          </div>
        </section>

        {/* Day Completion Modal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Day Completion Modal</h2>
          <p className="text-white/70 text-sm mb-4">
            Празднование завершения дня с конфетти, статистикой и достижениями
          </p>
          <Button 
            variant="primary" 
            onClick={() => setShowDayCompletion(true)}
          >
            Показать модальное окно завершения дня
          </Button>
        </section>

        {/* Achievement Unlock Animation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Achievement Unlock Animation</h2>
          <p className="text-white/70 text-sm mb-4">
            Анимация разблокировки достижения с эффектом переворота значка
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.slice(0, 6).map((achievement) => (
              <Card 
                key={achievement.id}
                className="p-4 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setSelectedAchievement(achievement);
                  setShowAchievement(true);
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="font-semibold text-sm">{achievement.title}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {achievement.description}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Integration Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Интеграция</h2>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Как использовать компоненты:</h3>
            <div className="space-y-4 text-sm text-white/80">
              <div>
                <code className="bg-white/10 px-2 py-1 rounded">LevelProgressBar</code>
                <p className="mt-2">
                  Добавьте на страницу профиля или дашборд для отображения прогресса пользователя
                </p>
              </div>
              <div>
                <code className="bg-white/10 px-2 py-1 rounded">StreakIndicator</code>
                <p className="mt-2">
                  Разместите в навигации или хедере для постоянной видимости серии
                </p>
              </div>
              <div>
                <code className="bg-white/10 px-2 py-1 rounded">DayCompletionModal</code>
                <p className="mt-2">
                  Показывайте после завершения всех заданий дня
                </p>
              </div>
              <div>
                <code className="bg-white/10 px-2 py-1 rounded">AchievementUnlockAnimation</code>
                <p className="mt-2">
                  Отображайте при разблокировке нового достижения
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Modals */}
      <DayCompletionModal
        day={15}
        isOpen={showDayCompletion}
        onClose={() => setShowDayCompletion(false)}
      />

      {showAchievement && (
        <AchievementUnlockAnimation
          achievement={selectedAchievement}
          onComplete={() => setShowAchievement(false)}
        />
      )}
    </div>
  );
}
