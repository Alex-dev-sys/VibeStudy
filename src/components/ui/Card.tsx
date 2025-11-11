'use client';

import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'relative glass-panel-soft rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_32px_90px_rgba(6,3,18,0.6)]',
        'before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-white/4 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-20',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('mb-4 flex flex-col gap-2', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx('text-xl font-semibold text-white/95', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx('text-sm text-white/70', className)} {...props} />;
}

