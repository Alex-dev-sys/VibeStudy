'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientBackdropProps {
  className?: string;
  blur?: boolean;
}

const ORBS = [
  { className: 'left-[-20%] top-[-10%] h-[420px] w-[420px] bg-[rgba(255,59,92,0.35)]', delay: 0 },
  { className: 'right-[-15%] top-[25%] h-[500px] w-[500px] bg-[rgba(69,160,255,0.3)]', delay: 0.4 },
  { className: 'left-[30%] bottom-[-25%] h-[460px] w-[460px] bg-[rgba(155,85,255,0.28)]', delay: 0.8 }
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
