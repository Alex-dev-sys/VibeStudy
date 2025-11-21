'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true
}: SkeletonProps) {
  const baseClasses = 'bg-white/5';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%')
  };

  const Component = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        animate: {
          opacity: [0.5, 0.8, 0.5]
        },
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    : {};

  return (
    <Component
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
      {...animationProps}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

// Card skeleton for loading day cards
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={clsx('p-6 space-y-4 rounded-2xl bg-white/5 border border-white/10', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-3 mt-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

// Button skeleton
export function SkeletonButton({ className = '' }: { className?: string }) {
  return (
    <Skeleton 
      className={clsx('h-11 w-32 rounded-full', className)} 
    />
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <Skeleton 
      variant="circular" 
      className={sizeClasses[size]} 
    />
  );
}
