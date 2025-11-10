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
        'group relative rounded-[32px] p-[1px] shadow-[0_25px_80px_rgba(60,40,150,0.32)] transition-shadow duration-500 hover:shadow-[0_35px_120px_rgba(80,50,190,0.45)]',
        'bg-[conic-gradient(from_120deg_at_50%_50%,rgba(255,59,92,0.55),rgba(69,160,255,0.55),rgba(255,59,92,0.55))] animate-border-glow',
        className
      )}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-[30px] border border-white/10 bg-black/70 p-6 backdrop-blur-2xl transition-colors duration-500 group-hover:bg-black/80',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
