/**
 * Floating Action Button (FAB)
 * 
 * Mobile-first primary action button that floats above content.
 * Follows Material Design guidelines for FAB placement and behavior.
 */

'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes } from 'react';

interface FloatingActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  icon: LucideIcon;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'default' | 'large';
  extended?: boolean; // Shows label alongside icon
}

export function FloatingActionButton({
  icon: Icon,
  label,
  position = 'bottom-right',
  size = 'default',
  extended = false,
  className,
  onClick,
  disabled,
  ...props
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-20 md:bottom-6 right-6',
    'bottom-left': 'bottom-20 md:bottom-6 left-6',
    'bottom-center': 'bottom-20 md:bottom-6 left-1/2 -translate-x-1/2',
  };
  
  const sizeClasses = {
    default: extended ? 'h-14 px-6' : 'h-14 w-14',
    large: extended ? 'h-16 px-8' : 'h-16 w-16',
  };
  
  const iconSizes = {
    default: 'w-6 h-6',
    large: 'w-7 h-7',
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.(e);
  };
  
  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'fixed z-dropdown',
        'flex items-center justify-center gap-3',
        'rounded-full',
        'bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200]',
        'text-[#25031f] font-bold',
        'shadow-[0_8px_32px_rgba(255,0,148,0.5)]',
        'hover:shadow-[0_12px_40px_rgba(255,0,148,0.6)]',
        'transition-shadow duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      aria-label={label || 'Action button'}
      {...(props as HTMLMotionProps<'button'>)}
    >
      <Icon className={iconSizes[size]} aria-hidden="true" />
      {extended && label && (
        <span className="text-sm font-bold whitespace-nowrap">
          {label}
        </span>
      )}
    </motion.button>
  );
}

/**
 * Mini FAB variant for secondary actions
 */
export function MiniFAB({
  icon: Icon,
  label,
  className,
  onClick,
  disabled,
  ...props
}: Omit<FloatingActionButtonProps, 'size' | 'extended' | 'position'>) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.(e);
  };
  
  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex items-center justify-center',
        'h-10 w-10 rounded-full',
        'bg-white/10 backdrop-blur-sm',
        'border border-white/20',
        'text-white',
        'hover:bg-white/15',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={label || 'Action button'}
      {...(props as HTMLMotionProps<'button'>)}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </motion.button>
  );
}
