import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
  glowClassName?: string;
}

export function AnimatedGradientText({ children, className, glowClassName }: AnimatedGradientTextProps) {
  return (
    <span className={cn('relative inline-flex animate-gradient-x bg-[length:200%_auto] bg-clip-text text-transparent', 'bg-[linear-gradient(110deg,#ff3b5c_0%,#45a0ff_50%,#ff81ff_100%)]', className)}>
      {children}
      <span
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 -z-10 rounded-full opacity-50 blur-3xl', glowClassName)}
        style={{ background: 'radial-gradient(circle, rgba(255,59,92,0.45) 0%, rgba(69,160,255,0.2) 45%, transparent 70%)' }}
      />
    </span>
  );
}
