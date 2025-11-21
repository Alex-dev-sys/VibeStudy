'use client';

import { useState } from 'react';
import { Button } from './button';
import { TaskCompletionAnimation } from './TaskCompletionAnimation';
import { Skeleton, SkeletonCard, SkeletonButton, SkeletonAvatar } from './skeleton';
import { LoadingState, useLoadingState } from './LoadingState';
import { Pulse, Shake, Bounce, SuccessPulse, triggerHaptic } from './VisualFeedback';
import { toast } from '@/lib/toast';

/**
 * Demo component showcasing all micro-interactions
 * This component is for testing and demonstration purposes
 */
export function MicroInteractionsDemo() {
  const [showCompletion, setShowCompletion] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const handleTaskComplete = () => {
    setShowCompletion(true);
    triggerHaptic('heavy');
    toast.taskComplete('Пример задания');
  };

  const handleLoadingDemo = async () => {
    startLoading('Загружаем данные...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    stopLoading();
    toast.success('Данные загружены!');
  };

  const handleToastDemo = (type: string) => {
    switch (type) {
      case 'success':
        toast.success('Успешно!', 'Операция выполнена успешно');
        break;
      case 'error':
        toast.error('Ошибка!', 'Что-то пошло не так');
        break;
      case 'info':
        toast.info('Информация', 'Это информационное сообщение');
        break;
      case 'warning':
        toast.warning('Внимание!', 'Будьте осторожны');
        break;
      case 'dayComplete':
        toast.dayComplete(5);
        break;
      case 'streak':
        toast.streakMilestone(10);
        break;
      case 'achievement':
        toast.achievementUnlock('Первые шаги', 'Завершите первый день обучения');
        break;
    }
  };

  return (
    <div className="min-h-screen p-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Micro-Interactions Demo</h1>
          <p className="text-white/70">
            Демонстрация всех микро-взаимодействий и анимаций
          </p>
        </div>

        {/* Button Interactions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Кнопки с анимациями</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg">
              Primary Large
            </Button>
            <Button variant="primary" size="md">
              Primary Medium
            </Button>
            <Button variant="primary" size="sm">
              Primary Small
            </Button>
            <Button variant="secondary" size="md">
              Secondary
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
            <Button variant="primary" size="md" isLoading>
              Loading...
            </Button>
            <Button variant="primary" size="md" disabled>
              Disabled
            </Button>
          </div>
        </section>

        {/* Task Completion Animation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Анимация завершения задания</h2>
          <Button onClick={handleTaskComplete}>
            Показать анимацию завершения
          </Button>
          <TaskCompletionAnimation 
            isVisible={showCompletion}
            onComplete={() => setShowCompletion(false)}
          />
        </section>

        {/* Toast Notifications */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Toast уведомления</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => handleToastDemo('success')}>
              Success Toast
            </Button>
            <Button onClick={() => handleToastDemo('error')}>
              Error Toast
            </Button>
            <Button onClick={() => handleToastDemo('info')}>
              Info Toast
            </Button>
            <Button onClick={() => handleToastDemo('warning')}>
              Warning Toast
            </Button>
            <Button onClick={() => handleToastDemo('dayComplete')}>
              Day Complete
            </Button>
            <Button onClick={() => handleToastDemo('streak')}>
              Streak Milestone
            </Button>
            <Button onClick={() => handleToastDemo('achievement')}>
              Achievement Unlock
            </Button>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Состояния загрузки</h2>
          <Button onClick={handleLoadingDemo}>
            Демо загрузки (2 сек)
          </Button>
          <LoadingState isLoading={isLoading} fallback={<SkeletonCard />}>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Контент загружен</h3>
              <p className="text-white/70">
                Это содержимое появляется после загрузки
              </p>
            </div>
          </LoadingState>
        </section>

        {/* Skeleton Components */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Skeleton загрузчики</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Card Skeleton</h3>
              <SkeletonCard />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Button Skeleton</h3>
              <SkeletonButton />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Avatar Skeletons</h3>
              <div className="flex gap-4">
                <SkeletonAvatar size="sm" />
                <SkeletonAvatar size="md" />
                <SkeletonAvatar size="lg" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Text Skeleton</h3>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </section>

        {/* Visual Feedback */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Визуальная обратная связь</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <Button onClick={() => setShowPulse(!showPulse)}>
                Toggle Pulse
              </Button>
              <Pulse isActive={showPulse}>
                <div className="mt-4 w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
              </Pulse>
            </div>
            
            <div>
              <Button onClick={() => setShowShake(true)}>
                Trigger Shake
              </Button>
              <Shake trigger={showShake}>
                <div className="mt-4 w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
              </Shake>
            </div>
            
            <div>
              <Button onClick={() => setShowBounce(true)}>
                Trigger Bounce
              </Button>
              <Bounce trigger={showBounce}>
                <div className="mt-4 w-20 h-20 rounded-2xl bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </Bounce>
            </div>
          </div>
        </section>

        {/* Haptic Feedback */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Тактильная обратная связь</h2>
          <p className="text-white/70 text-sm">
            (Работает только на мобильных устройствах с поддержкой вибрации)
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => triggerHaptic('light')}>
              Light Haptic
            </Button>
            <Button onClick={() => triggerHaptic('medium')}>
              Medium Haptic
            </Button>
            <Button onClick={() => triggerHaptic('heavy')}>
              Heavy Haptic
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
