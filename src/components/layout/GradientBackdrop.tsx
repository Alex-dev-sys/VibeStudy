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
      {/* SVG gradient background for better quality */}
      <svg 
        className="absolute inset-0 h-full w-full" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="bg-gradient-top" cx="50%" cy="0%" r="65%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="bg-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(55% 0.45 350)" />
            <stop offset="50%" stopColor="oklch(75% 0.50 20)" />
            <stop offset="100%" stopColor="oklch(95% 0.55 85)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-gradient-main)" opacity="0.15" />
        <rect width="100%" height="100%" fill="url(#bg-gradient-top)" />
      </svg>
      
      {/* Animated orbs */}
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
