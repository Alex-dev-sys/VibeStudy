'use client';

/**
 * Quick Actions Component
 * Provides contextual quick action buttons for common AI assistant requests
 */

import React from 'react';
import { BookOpen, Code, Lightbulb, TrendingUp } from 'lucide-react';
import { useProgressStore } from '@/store/progress-store';

/**
 * Props for QuickActions component
 */
interface QuickActionsProps {
  onActionClick: (template: string) => void;
  locale?: 'ru' | 'en';
}

/**
 * Quick action button interface
 */
interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  template: string;
}

/**
 * QuickActions component
 */
export function QuickActions({ onActionClick, locale = 'ru' }: QuickActionsProps) {
  const { activeDay, languageId, dayStates } = useProgressStore();
  
  // Get current day state to make actions contextual
  const currentDayState = dayStates[activeDay];
  const hasCode = currentDayState?.code && currentDayState.code.trim().length > 0;
  const completedTasksCount = currentDayState?.completedTasks?.length || 0;
  
  // Define quick actions based on locale
  const actions: QuickAction[] = locale === 'ru' ? [
    {
      id: 'explain',
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Объясни концепцию',
      template: `Объясни мне концепцию из дня ${activeDay} простыми словами. Я изучаю ${languageId}.`
    },
    {
      id: 'code-help',
      icon: <Code className="w-4 h-4" />,
      label: hasCode ? 'Помоги с моим кодом' : 'Помоги с кодом',
      template: hasCode 
        ? `Посмотри на мой код и подскажи, как его улучшить. Не давай готовое решение, только направь меня в правильную сторону.`
        : `Помоги мне начать решать задачу дня ${activeDay}. Дай подсказку, но не показывай готовое решение.`
    },
    {
      id: 'hint',
      icon: <Lightbulb className="w-4 h-4" />,
      label: 'Дай подсказку',
      template: completedTasksCount > 0
        ? `Я выполнил ${completedTasksCount} задач. Дай подсказку для следующей задачи, но не раскрывай решение полностью.`
        : `Дай мне подсказку для первой задачи дня ${activeDay}. Помоги понять, с чего начать.`
    },
    {
      id: 'advice',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Совет по обучению',
      template: `Дай мне совет по обучению. Я на дне ${activeDay} из 90. Как мне эффективнее учиться?`
    }
  ] : [
    {
      id: 'explain',
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Explain this concept',
      template: `Explain the concept from day ${activeDay} in simple terms. I'm learning ${languageId}.`
    },
    {
      id: 'code-help',
      icon: <Code className="w-4 h-4" />,
      label: hasCode ? 'Help with my code' : 'Help with code',
      template: hasCode 
        ? `Look at my code and suggest how to improve it. Don't give me the complete solution, just point me in the right direction.`
        : `Help me start solving the task for day ${activeDay}. Give me a hint, but don't show the complete solution.`
    },
    {
      id: 'hint',
      icon: <Lightbulb className="w-4 h-4" />,
      label: 'Give me a hint',
      template: completedTasksCount > 0
        ? `I've completed ${completedTasksCount} tasks. Give me a hint for the next task, but don't reveal the full solution.`
        : `Give me a hint for the first task of day ${activeDay}. Help me understand where to start.`
    },
    {
      id: 'advice',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Study advice',
      template: `Give me study advice. I'm on day ${activeDay} of 90. How can I learn more effectively?`
    }
  ];

  return (
    <div className="border-t border-gray-800 p-4">
      <p className="text-xs text-gray-400 mb-3">
        {locale === 'ru' ? '⚡ Быстрые действия:' : '⚡ Quick actions:'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.template)}
            className="flex items-center gap-2 px-3 py-3 min-h-[44px] bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white text-sm font-medium rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md touch-manipulation"
            aria-label={action.label}
          >
            {action.icon}
            <span className="truncate text-left">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
