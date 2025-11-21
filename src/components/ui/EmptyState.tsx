'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  /**
   * Icon component or emoji to display
   */
  icon?: LucideIcon | string;
  /**
   * Main heading text
   */
  title: string;
  /**
   * Description text (max 2 sentences recommended)
   */
  description: string;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  /**
   * Secondary action button (optional)
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Additional contextual help or examples
   */
  helpText?: string;
  /**
   * Custom metadata to display below CTA
   */
  metadata?: ReactNode;
  /**
   * Custom illustration component
   */
  illustration?: ReactNode;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to use dashed border
   */
  dashed?: boolean;
}

/**
 * Generic EmptyState component for consistent empty state UI across the platform
 * 
 * Design principles:
 * - Clear, encouraging language
 * - Single prominent CTA
 * - Visual illustration
 * - Contextual help when appropriate
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  helpText,
  metadata,
  illustration,
  size = 'md',
  dashed = true,
}: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? null : icon;
  const iconEmoji = typeof icon === 'string' ? icon : null;

  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  const iconSizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconInnerSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const emojiSizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  };

  return (
    <Card
      className={`text-center ${sizeClasses[size]} ${
        dashed ? 'border-dashed border-white/15' : ''
      } bg-[rgba(255,255,255,0.08)]`}
    >
      {/* Illustration */}
      {illustration ? (
        <div className="mb-8">{illustration}</div>
      ) : (
        <div className="mb-8">
          {iconEmoji ? (
            <div className={`${emojiSizes[size]} mb-4`}>{iconEmoji}</div>
          ) : IconComponent ? (
            <div
              className={`${iconSizes[size]} mx-auto rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center`}
            >
              <IconComponent className={`${iconInnerSizes[size]} text-white/80`} />
            </div>
          ) : null}
        </div>
      )}

      {/* Content */}
      <CardHeader className="space-y-6">
        <CardTitle className={size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'}>
          {title}
        </CardTitle>

        {/* Benefit-focused description */}
        <CardDescription className="text-base max-w-md mx-auto">
          {description}
        </CardDescription>

        {/* Help text */}
        {helpText && (
          <p className="text-sm text-white/50 max-w-sm mx-auto italic">
            💡 {helpText}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            {action && (
              <Button
                variant="primary"
                size="lg"
                onClick={action.onClick}
                disabled={action.disabled}
                className="min-w-[200px]"
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="secondary"
                size="md"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}

        {/* Metadata */}
        {metadata && (
          <div className="pt-4 text-caption text-white/50">
            {metadata}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
