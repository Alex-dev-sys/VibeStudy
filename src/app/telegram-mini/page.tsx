'use client';

import { useEffect, useState } from 'react';
import { MiniCodeChallenge } from '@/components/telegram/MiniCodeChallenge';
import { useProgressStore } from '@/store/progress-store';
import { useLocaleStore } from '@/store/locale-store';
import { getLanguageById } from '@/lib/languages';
import type { GeneratedTask } from '@/types';

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
      };
    };
  }
}

export default function TelegramMiniPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [themeColors, setThemeColors] = useState<Record<string, string>>({});
  
  const { activeDay, languageId, dayStates, toggleTask } = useProgressStore();
  const { locale, setLocale } = useLocaleStore();
  const language = getLanguageById(languageId);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Signal that the Mini App is ready
      tg.ready();
      
      // Expand to full height
      tg.expand();
      
      // Set locale from Telegram user
      if (tg.initDataUnsafe.user?.language_code) {
        const userLang = tg.initDataUnsafe.user.language_code;
        if (userLang === 'ru' || userLang === 'en') {
          setLocale(userLang);
        }
      }
      
      // Apply Telegram theme colors
      const colors: Record<string, string> = {};
      if (tg.themeParams.bg_color) colors['--tg-bg'] = tg.themeParams.bg_color;
      if (tg.themeParams.text_color) colors['--tg-text'] = tg.themeParams.text_color;
      if (tg.themeParams.hint_color) colors['--tg-hint'] = tg.themeParams.hint_color;
      if (tg.themeParams.button_color) colors['--tg-button'] = tg.themeParams.button_color;
      if (tg.themeParams.button_text_color) colors['--tg-button-text'] = tg.themeParams.button_text_color;
      if (tg.themeParams.secondary_bg_color) colors['--tg-secondary-bg'] = tg.themeParams.secondary_bg_color;
      
      setThemeColors(colors);
      
      // Show back button
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        tg.close();
      });
    }
    
    // Load tasks for current day
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch tasks from API
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: activeDay,
          languageId,
          locale
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Use fallback tasks
      setTasks([
        {
          id: 'fallback-1',
          difficulty: 'easy',
          prompt: locale === 'ru' 
            ? 'Напишите функцию, которая возвращает "Hello, World!"'
            : 'Write a function that returns "Hello, World!"'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    toggleTask(activeDay, taskId);
    
    // Move to next task if available
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      // All tasks completed, show success message
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close();
      }
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center"
        style={themeColors}
      >
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-lg" style={{ color: themeColors['--tg-text'] || '#ffffff' }}>
            {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const currentTask = tasks[currentTaskIndex];
  const completedTasks = dayStates[activeDay]?.completedTasks || [];

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: themeColors['--tg-bg'] || '#0a0315',
        color: themeColors['--tg-text'] || '#ffffff',
        ...themeColors
      }}
    >
      <MiniCodeChallenge
        task={currentTask}
        taskNumber={currentTaskIndex + 1}
        totalTasks={tasks.length}
        isCompleted={completedTasks.includes(currentTask?.id)}
        languageId={languageId}
        monacoLanguage={language.monacoLanguage}
        day={activeDay}
        onComplete={handleTaskComplete}
        onNext={handleNextTask}
        onPrevious={handlePreviousTask}
        hasNext={currentTaskIndex < tasks.length - 1}
        hasPrevious={currentTaskIndex > 0}
        themeColors={themeColors}
      />
    </div>
  );
}
