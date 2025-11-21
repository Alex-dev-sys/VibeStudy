/**
 * Reduced Motion Support
 * Respects user's prefers-reduced-motion preference
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 */
export function getAnimationDuration(
  normalDuration: number,
  prefersReducedMotion: boolean
): number {
  return prefersReducedMotion ? 0 : normalDuration;
}

/**
 * Get animation config for Framer Motion
 */
export function getMotionConfig(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 },
    };
  }

  return {};
}

/**
 * Conditional animation variants
 */
export function getMotionVariants<T extends Record<string, any>>(
  variants: T,
  prefersReducedMotion: boolean
): T | {} {
  return prefersReducedMotion ? {} : variants;
}

/**
 * Safe animation wrapper for Framer Motion
 */
export function safeAnimate(
  animation: any,
  prefersReducedMotion: boolean
): any {
  if (prefersReducedMotion) {
    // Return the final state without animation
    if (typeof animation === 'object' && animation !== null) {
      return { ...animation, transition: { duration: 0 } };
    }
    return animation;
  }
  return animation;
}

/**
 * CSS class for reduced motion
 */
export function getReducedMotionClass(prefersReducedMotion: boolean): string {
  return prefersReducedMotion ? 'motion-reduce' : '';
}

/**
 * Apply reduced motion styles globally
 */
export function applyReducedMotionStyles() {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    .motion-reduce {
      animation: none !important;
      transition: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Hook to apply reduced motion styles on mount
 */
export function useReducedMotionStyles() {
  useEffect(() => {
    applyReducedMotionStyles();
  }, []);
}

/**
 * Get transition config based on reduced motion
 */
export function getTransition(
  normalTransition: any,
  prefersReducedMotion: boolean
): any {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return normalTransition;
}

/**
 * Conditional spring animation
 */
export function getSpringConfig(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return { type: 'tween', duration: 0 };
  }
  return { type: 'spring', stiffness: 300, damping: 30 };
}
