'use client';

import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'accent' | 'soft' | 'neutral';
}

export function Badge({ className, tone = 'accent', ...props }: BadgeProps) {
  const toneClasses = {
    accent: 'bg-gradient-to-r from-[#ff0094]/25 to-[#ffd200]/20 text-[#ffbdf7] border border-[#ff0094]/40 shadow-[0_8px_18px_rgba(255,0,148,0.25)]',
    soft: 'bg-[rgba(255,255,255,0.25)] text-white/80 border border-white/10',
    neutral: 'bg-[rgba(255,255,255,0.15)] text-white/65 border border-white/12'
  } as const;

  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide', toneClasses[tone], className)}
      {...props}
    />
  );
}

