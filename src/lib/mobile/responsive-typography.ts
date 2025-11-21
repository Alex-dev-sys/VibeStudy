/**
 * Responsive Typography System
 * 
 * Implements fluid typography that scales smoothly across viewport sizes
 * with mobile-first approach.
 */

/**
 * Typography scale with mobile and desktop variants
 */
export const typographyScale = {
  caption: {
    mobile: '0.75rem',    // 12px
    desktop: '0.75rem',   // 12px
    lineHeight: '1.5',
  },
  small: {
    mobile: '0.875rem',   // 14px
    desktop: '0.875rem',  // 14px
    lineHeight: '1.6',
  },
  body: {
    mobile: '1rem',       // 16px
    desktop: '1rem',      // 16px
    lineHeight: '1.7',
  },
  bodyLarge: {
    mobile: '1.125rem',   // 18px
    desktop: '1.25rem',   // 20px
    lineHeight: '1.7',
  },
  h3: {
    mobile: '1.125rem',   // 18px
    desktop: '1.25rem',   // 20px
    lineHeight: '1.5',
    fontWeight: '600',
  },
  h2: {
    mobile: '1.25rem',    // 20px
    desktop: '1.5rem',    // 24px
    lineHeight: '1.4',
    fontWeight: '600',
  },
  h1: {
    mobile: '1.5rem',     // 24px
    desktop: '2rem',      // 32px
    lineHeight: '1.3',
    fontWeight: '700',
  },
  hero: {
    mobile: '2rem',       // 32px
    desktop: '3rem',      // 48px
    lineHeight: '1.2',
    fontWeight: '700',
  },
  display: {
    mobile: '2.5rem',     // 40px
    desktop: '3.75rem',   // 60px
    lineHeight: '1.1',
    fontWeight: '700',
  },
} as const;

/**
 * Generates fluid typography CSS using clamp()
 * 
 * @param minSize - Minimum font size (mobile)
 * @param maxSize - Maximum font size (desktop)
 * @param minViewport - Minimum viewport width (default: 320px)
 * @param maxViewport - Maximum viewport width (default: 1280px)
 */
export function fluidTypography(
  minSize: number,
  maxSize: number,
  minViewport = 320,
  maxViewport = 1280
): string {
  const slope = (maxSize - minSize) / (maxViewport - minViewport);
  const yAxisIntersection = -minViewport * slope + minSize;
  
  return `clamp(${minSize}rem, ${yAxisIntersection}rem + ${slope * 100}vw, ${maxSize}rem)`;
}

/**
 * Responsive typography classes for Tailwind
 */
export const responsiveTextClasses = {
  caption: 'text-xs',
  small: 'text-sm',
  body: 'text-base',
  bodyLarge: 'text-base md:text-lg',
  h3: 'text-lg md:text-xl',
  h2: 'text-xl md:text-2xl',
  h1: 'text-2xl md:text-4xl',
  hero: 'text-4xl md:text-5xl lg:text-6xl',
  display: 'text-5xl md:text-6xl lg:text-7xl',
} as const;

/**
 * Line height utilities
 */
export const lineHeights = {
  tight: '1.2',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '1.75',
} as const;

/**
 * Font weight utilities
 */
export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Gets appropriate font size based on viewport
 */
export function getResponsiveFontSize(
  scale: keyof typeof typographyScale,
  viewport: 'mobile' | 'desktop'
): string {
  return typographyScale[scale][viewport];
}

/**
 * Calculates optimal line length for readability
 * Recommended: 45-75 characters per line
 */
export function getOptimalLineLength(fontSize: number): number {
  // Approximate characters per line based on font size
  const charsPerEm = 2.5; // Average for proportional fonts
  const optimalChars = 65; // Middle of 45-75 range
  
  return Math.round((optimalChars / charsPerEm) * fontSize);
}
