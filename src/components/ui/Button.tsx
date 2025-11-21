'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useReducedMotion } from '@/lib/accessibility/reduced-motion';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-[#0c061c] disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] text-[#25031f] font-bold shadow-[0_20px_45px_rgba(255,0,148,0.45)] hover:brightness-110 hover:shadow-[0_28px_60px_rgba(255,0,148,0.55)] hover:-translate-y-1 hover:scale-[1.02] disabled:bg-[var(--disabled-bg)] disabled:border disabled:border-[var(--disabled-border)] disabled:text-[var(--disabled-text)] disabled:shadow-none disabled:from-transparent disabled:via-transparent disabled:to-transparent disabled:brightness-100 disabled:translate-y-0 disabled:scale-100 z-[var(--z-content)]',
        secondary:
          'bg-transparent border border-white/8 text-white/85 font-medium hover:border-white/15 hover:bg-white/5 shadow-[0_8px_20px_rgba(12,6,28,0.25)] hover:shadow-[0_12px_28px_rgba(12,6,28,0.35)] disabled:bg-[var(--disabled-bg)] disabled:border-[var(--disabled-border)] disabled:text-[var(--disabled-text)] disabled:shadow-none',
        ghost: 'bg-transparent text-white/75 font-normal hover:bg-white/5 hover:text-white/90 border border-transparent hover:border-white/5 disabled:text-[var(--disabled-text)] disabled:bg-transparent'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm min-h-[44px] min-w-[44px]',
        md: 'px-5 py-2.5 text-base min-h-[44px] min-w-[44px]',
        lg: 'px-8 py-4 text-lg min-h-[56px] min-w-[56px] font-bold'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function Button({ 
  variant, 
  size, 
  asChild = false, 
  className, 
  isLoading, 
  children, 
  disabled, 
  onClick, 
  ariaLabel,
  ariaDescribedBy,
  type = 'button',
  ...props 
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    
    // Visual feedback
    setIsPressed(true);
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Call original onClick
    if (onClick) {
      onClick(e);
    }
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 200);
  };
  
  const buttonClassName = clsx(
    buttonVariants({ variant, size }), 
    isPressed && 'brightness-90',
    className
  );

  const ariaProps = {
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-busy': isLoading,
    'aria-disabled': disabled || isLoading,
  };
  
  if (asChild) {
    return (
      <Slot 
        className={buttonClassName}
        onClick={handleClick}
        {...ariaProps}
        {...props}
      >
        {children}
      </Slot>
    );
  }
  
  return (
    <motion.button
      type={type}
      className={buttonClassName}
      disabled={disabled || isLoading}
      onClick={handleClick}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 17 }}
      {...ariaProps}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {isLoading && (
        <>
          <LoadingSpinner size={size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'} />
          <span className="sr-only">Loading...</span>
        </>
      )}
      {children}
    </motion.button>
  );
}

