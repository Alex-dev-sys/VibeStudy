'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
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
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
        const result = await response.json();
        setFeedback(type);
        // Если дизлайк - показать форму для комментария
        if (type === 'negative') {
          setShowCommentForm(true);
        }
      } else {
        // Try to get error message from response
        let errorMessage = 'Не удалось отправить отзыв';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parsing errors
        }
        console.error('Failed to submit feedback:', errorMessage, response.status);
        // Still mark as submitted to avoid retries
        setFeedback(type);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Network error or other issue - still mark as submitted
      setFeedback(type);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          contentKey,
          feedbackType: 'negative',
          comment: comment.trim(),
          metadata,
        }),
      });

      if (response.ok) {
        setShowCommentForm(false);
        setComment('');
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
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

      {showCommentForm && (
        <div className="mt-3 p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/90">
              Что можно улучшить?
            </p>
            <button
              onClick={() => {
                setShowCommentForm(false);
                setComment('');
              }}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Расскажите, что не понравилось или что можно улучшить..."
            className="w-full px-3 py-2 rounded-md bg-white/5 text-white placeholder:text-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[80px] text-sm"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowCommentForm(false);
                setComment('');
              }}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-white/10 transition-colors text-white/70"
            >
              Отмена
            </button>
            <button
              onClick={handleCommentSubmit}
              disabled={!comment.trim() || isSubmittingComment}
              className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
            >
              {isSubmittingComment ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
