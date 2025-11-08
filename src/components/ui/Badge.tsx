'use client';

import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'accent' | 'soft' | 'neutral';
}

export function Badge({ className, tone = 'accent', ...props }: BadgeProps) {
  const toneClasses = {
    accent: 'bg-accent/20 text-accent border border-accent/40',
    soft: 'bg-white/5 text-white/80 border border-white/10',
    neutral: 'bg-surface text-white/60 border border-white/10'
  } as const;

  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide', toneClasses[tone], className)}
      {...props}
    />
  );
}

