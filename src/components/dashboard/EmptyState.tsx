'use client';

import { BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDayTopic } from '@/lib/content/curriculum';

interface EmptyStateProps {
  day: number;
  onStart: () => void;
  languageId?: string;
}

/**
 * EmptyState component for day cards without generated content
 * Follows UX requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function EmptyState({ day, onStart, languageId = 'python' }: EmptyStateProps) {
  const dayTopic = getDayTopic(day, languageId);

  return (
    <div className="relative group mx-auto w-full max-w-md">
      {/* Card Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff0094] to-[#ffd200] rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

      <Card className="relative flex flex-col items-center justify-center py-10 px-6 bg-[#0a0515] border border-white/10 rounded-2xl shadow-xl">
        {/* Illustration with Glow */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-[#ff0094] blur-xl opacity-40 rounded-full"></div>
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#ff0094]/20 to-[#ffd200]/10 border border-[#ff0094]/30 flex items-center justify-center shadow-inner">
            <BookOpen className="w-10 h-10 text-[#ff0094] drop-shadow-[0_0_8px_rgba(255,0,148,0.5)]" />
          </div>
        </div>

        {/* Clear heading */}
        <CardHeader className="space-y-4 p-0 text-center w-full">
          <CardTitle className="text-2xl font-bold text-white">
            Day {day}: {dayTopic.topic}
          </CardTitle>

          {/* Benefit-focused description */}
          <CardDescription className="text-white/60 text-sm max-w-[280px] mx-auto leading-relaxed">
            Получи персональную теорию и практические задания,
            подобранные AI под твой уровень и цели.
          </CardDescription>

          {/* Single prominent CTA */}
          <div className="pt-6 w-full flex justify-center">
            <Button
              variant="gradient"
              size="lg"
              onClick={onStart}
              className="w-full max-w-[240px] shadow-[0_0_20px_rgba(255,0,148,0.4)]"
            >
              Start Day {day}
            </Button>
          </div>

          {/* Subtle metadata */}
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-white/40 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">🕒</span>
              Approx. 30 min
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">📝</span>
              3-5 tasks
            </span>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
