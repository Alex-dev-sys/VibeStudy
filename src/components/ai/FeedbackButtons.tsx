'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackButtonsProps {
  contentType: 'theory' | 'hint' | 'explanation' | 'task';
  contentKey: string;
  metadata?: Record<string, any>;
  className?: string;
}

export function FeedbackButtons({
  contentType,
  contentKey,
  metadata = {},
  className
}: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (isSubmitting || feedback) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          contentKey,
          feedbackType: type,
          metadata,
        }),
      });

      if (response.ok) {
        setFeedback(type);
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">
        {feedback ? 'Спасибо за отзыв!' : 'Полезно?'}
      </span>
      <button
        onClick={() => handleFeedback('positive')}
        disabled={isSubmitting || feedback !== null}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed',
          feedback === 'positive' && 'bg-green-500/20 text-green-500'
        )}
        aria-label="Полезно"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        disabled={isSubmitting || feedback !== null}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed',
          feedback === 'negative' && 'bg-red-500/20 text-red-500'
        )}
        aria-label="Не полезно"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  );
}
