'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientBackdropProps {
  className?: string;
  blur?: boolean;
}

const ORBS = [
  { className: 'left-[-22%] top-[-12%] h-[420px] w-[420px] bg-[rgba(255,0,148,0.38)]', delay: 0 },
  { className: 'right-[-18%] top-[28%] h-[520px] w-[520px] bg-[rgba(255,218,0,0.28)]', delay: 0.35 },
  { className: 'left-[30%] bottom-[-25%] h-[480px] w-[480px] bg-[rgba(255,118,240,0.32)]', delay: 0.7 }
];

export function GradientBackdrop({ className, blur = true }: GradientBackdropProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 -z-20 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_65%)]" />
      {ORBS.map((orb) => (
        <motion.div
          key={orb.className}
          className={cn('absolute rounded-full', blur && 'blur-3xl', orb.className)}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
        />
      ))}
    </div>
  );
}
