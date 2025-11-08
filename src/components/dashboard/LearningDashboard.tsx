'use client';

import { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { buildCurriculum, getDayTopic } from '@/lib/curriculum';
import { LANGUAGES } from '@/lib/languages';
import { useProgressStore } from '@/store/progress-store';
import { ProgressOverview } from './ProgressOverview';
import { LanguageSelector } from './LanguageSelector';
import { DayTimeline } from './DayTimeline';
import { DayCard } from './DayCard';
import { HistoryPanel } from './HistoryPanel';
import { AdaptiveRecommendationsPanel } from './AdaptiveRecommendationsPanel';
import { AIAssistantChat } from './AIAssistantChat';
import { Button } from '@/components/ui/Button';

const TOTAL_DAYS = 90;

export default function LearningDashboard() {
  const { activeDay, languageId, setActiveDay, record } = useProgressStore((state) => ({
    activeDay: state.activeDay,
    languageId: state.languageId,
    setActiveDay: state.setActiveDay,
    record: state.record
  }));

  const [isChatOpen, setIsChatOpen] = useState(false);

  const curriculum = useMemo(() => buildCurriculum(languageId), [languageId]);
  const currentDay = curriculum.find((day) => day.day === activeDay) ?? curriculum[0];
  const previousDay = curriculum.find((day) => day.day === activeDay - 1);
  const dayTopic = getDayTopic(activeDay);

  const goToNext = () => setActiveDay(activeDay >= TOTAL_DAYS ? TOTAL_DAYS : activeDay + 1);
  const goToPrev = () => setActiveDay(activeDay <= 1 ? 1 : activeDay - 1);

  useEffect(() => {
    if (record.completedDays.includes(activeDay)) {
      toast(`День ${activeDay} отмечен как выполненный`, { description: 'Не забывай повторять материал из истории.' });
    }
  }, [activeDay, record.completedDays]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-hidden px-0 sm:gap-6 md:gap-8">
      <Toaster richColors position="top-right" />
      <ProgressOverview />
      <LanguageSelector />
      <DayTimeline />
      <DayCard day={currentDay} previousDay={previousDay} languageId={languageId} />
      
      {/* Панель адаптивных рекомендаций */}
      <AdaptiveRecommendationsPanel currentDay={activeDay} languageId={languageId} />

      {/* Плавающая кнопка ИИ-помощника */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl shadow-2xl shadow-accent/50 transition-all hover:scale-110 hover:shadow-accent/70 sm:h-16 sm:w-16"
        aria-label="Открыть ИИ-помощника"
      >
        🤖
      </button>

      {/* ИИ-помощник */}
      <AIAssistantChat
        day={activeDay}
        topic={dayTopic.topic}
        theory={currentDay.theory}
        languageId={languageId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

