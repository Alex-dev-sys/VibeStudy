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
    <Card className="text-center py-section border-dashed border-white/15 bg-[rgba(255,255,255,0.08)]">
      {/* Illustration */}
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Clear heading */}
      <CardHeader className="space-y-6">
        <CardTitle>
          День {day}: {dayTopic.topic}
        </CardTitle>

        {/* Benefit-focused description */}
        <CardDescription className="text-base max-w-md mx-auto">
          Получи персональную теорию и практические задания, 
          подобранные AI под твой уровень и цели.
        </CardDescription>

        {/* Single prominent CTA */}
        <div className="pt-6">
          <Button 
            variant="primary" 
            size="lg"
            onClick={onStart}
            className="min-w-[200px]"
          >
            Начать день {day}
          </Button>
        </div>

        {/* Subtle metadata */}
        <div className="flex items-center justify-center gap-4 text-caption text-white/50 pt-4">
          <span>⏱️ ~30 минут</span>
          <span>•</span>
          <span>📝 3-5 заданий</span>
        </div>
      </CardHeader>
    </Card>
  );
}
