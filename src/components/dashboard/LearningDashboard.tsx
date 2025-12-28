'use client';

import { useMemo, useEffect } from 'react';
import { Toaster } from 'sonner';
import { buildCurriculum } from '@/lib/content/curriculum';
import { useProgressStore } from '@/store/progress-store';
import { ProgressOverview } from './ProgressOverview';
import { LanguageSelector } from './LanguageSelector';
import { PathSelector } from './PathSelector';
import { DayTimeline } from './DayTimeline';
import { SimplifiedDayCard } from './SimplifiedDayCard';

import { useAIAssistant } from '@/components/ai-assistant/AIAssistantContext';
import { getPathById } from '@/data/paths';

export default function LearningDashboard() {
  const { activeDay, languageId, activePathId } = useProgressStore((state) => ({
    activeDay: state.activeDay,
    languageId: state.languageId,
    activePathId: state.activePathId
  }));

  // Get path info for duration
  const activePath = activePathId ? getPathById(activePathId) : null;
  const maxDays = activePath?.duration ?? 90;

  const curriculum = useMemo(() => buildCurriculum(languageId, activePathId || undefined), [languageId, activePathId]);
  const currentDay = curriculum.find((day) => day.day === activeDay) ?? curriculum[0];
  const previousDay = curriculum.find((day) => day.day === activeDay - 1);

  // AI Assistant context
  const { isOpen: isAIAssistantOpen, setIsOpen: setIsAIAssistantOpen, onOpenClick } = useAIAssistant();

  // Keyboard shortcut: Ctrl+K or Cmd+K to open AI Assistant
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (isAIAssistantOpen) {
          setIsAIAssistantOpen(false);
        } else {
          onOpenClick();
        }
      }

      // ESC to close
      if (event.key === 'Escape' && isAIAssistantOpen) {
        setIsAIAssistantOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAIAssistantOpen, setIsAIAssistantOpen, onOpenClick]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-hidden px-4 sm:gap-8 sm:px-6 md:gap-10 lg:gap-12 lg:px-8">
      <Toaster richColors position="top-right" />
      <ProgressOverview />
      <LanguageSelector />
      <PathSelector />
      <DayTimeline maxDays={maxDays} />
      <SimplifiedDayCard day={currentDay} previousDay={previousDay} languageId={languageId} />
    </div>
  );
}
