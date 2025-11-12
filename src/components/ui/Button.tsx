'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/70 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] text-[#25031f] font-semibold shadow-[0_18px_38px_rgba(255,0,148,0.35)] hover:brightness-110 hover:shadow-[0_24px_50px_rgba(255,0,148,0.45)]',
        secondary:
          'bg-transparent border border-white/5 text-white/90 hover:border-white/15 hover:bg-white/5 shadow-[0_15px_35px_rgba(12,6,28,0.35)]',
        ghost: 'bg-transparent text-white/80 hover:bg-white/5 border border-transparent hover:border-white/5'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ variant, size, asChild = false, className, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={clsx(buttonVariants({ variant, size }), className)} {...props} />;
}

