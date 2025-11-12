import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface MagicCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export function MagicCard({ children, className, innerClassName }: MagicCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-[32px] transition-shadow duration-500',
        'border border-white/12 bg-[rgba(12,6,28,0.85)] shadow-[0_25px_90px_rgba(18,3,42,0.55)] hover:shadow-[0_35px_120px_rgba(18,3,42,0.75)]',
        className
      )}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-[30px] p-6 backdrop-blur-3xl transition-colors duration-500 group-hover:bg-[rgba(12,6,28,0.92)]',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
