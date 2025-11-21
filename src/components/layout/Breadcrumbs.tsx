'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/curriculum';
import { LANGUAGES } from '@/lib/languages';

export function Breadcrumbs() {
  const { languageId, activeDay } = useProgressStore();
  const language = LANGUAGES.find(l => l.id === languageId);
  const dayTopic = getDayTopic(activeDay);
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center gap-1.5 sm:gap-2 text-sm text-white/60 flex-wrap"
    >
      <Link 
        href="/learn" 
        className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded px-1 whitespace-nowrap"
      >
        Обучение
      </Link>
      <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="text-white/80 whitespace-nowrap">{language?.label || 'Python'}</span>
      <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="text-white break-words" aria-current="page">
        День {activeDay}: {dayTopic.topic}
      </span>
    </nav>
  );
}
