'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/80 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-background hover:bg-accent/90 shadow-glow',
        secondary: 'bg-surface text-foreground hover:bg-surface/80 border border-white/10',
        ghost: 'bg-transparent text-foreground hover:bg-white/5'
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

