/**
 * Mobile Touch Target Utilities
 * 
 * Ensures all interactive elements meet minimum touch target sizes
 * and spacing requirements for mobile devices.
 * 
 * WCAG 2.1 Level AAA: Minimum 44x44px touch targets
 * Material Design: 48x48dp recommended
 * iOS HIG: 44x44pt minimum
 */

export const TOUCH_TARGET = {
  MIN_SIZE: 44, // pixels
  RECOMMENDED_SIZE: 48, // pixels
  MIN_SPACING: 8, // pixels between targets
  SAFE_SPACING: 12, // recommended spacing
} as const;

/**
 * Validates if an element meets minimum touch target requirements
 */
export function validateTouchTarget(element: HTMLElement): {
  isValid: boolean;
  width: number;
  height: number;
  issues: string[];
} {
  const rect = element.getBoundingClientRect();
  const issues: string[] = [];
  
  if (rect.width < TOUCH_TARGET.MIN_SIZE) {
    issues.push(`Width ${rect.width}px is below minimum ${TOUCH_TARGET.MIN_SIZE}px`);
  }
  
  if (rect.height < TOUCH_TARGET.MIN_SIZE) {
    issues.push(`Height ${rect.height}px is below minimum ${TOUCH_TARGET.MIN_SIZE}px`);
  }
  
  return {
    isValid: issues.length === 0,
    width: rect.width,
    height: rect.height,
    issues,
  };
}

/**
 * CSS class names for touch-friendly sizing
 */
export const touchTargetClasses = {
  // Minimum touch target (44x44px)
  min: 'min-w-[44px] min-h-[44px]',
  
  // Recommended touch target (48x48px)
  recommended: 'min-w-[48px] min-h-[48px]',
  
  // Spacing between touch targets
  spacing: 'gap-2', // 8px
  safeSpacing: 'gap-3', // 12px
  
  // Padding for touch-friendly areas
  padding: 'p-3', // 12px
  paddingX: 'px-3', // 12px horizontal
  paddingY: 'py-3', // 12px vertical
} as const;

/**
 * Detects if the device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - legacy property
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Gets the device viewport category
 */
export function getViewportCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Viewport breakpoints matching Tailwind defaults
 */
export const BREAKPOINTS = {
  xs: 320,  // Small phones
  sm: 640,  // Large phones
  md: 768,  // Tablets
  lg: 1024, // Small laptops
  xl: 1280, // Desktops
  '2xl': 1536, // Large desktops
} as const;

/**
 * Checks if current viewport is within a specific range
 */
export function isViewportInRange(min: number, max?: number): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  return width >= min && (max === undefined || width <= max);
}

/**
 * Mobile-specific viewport utilities
 */
export const viewport = {
  // Test for specific mobile viewport widths (320px to 428px)
  isSmallMobile: () => isViewportInRange(320, 374),
  isMediumMobile: () => isViewportInRange(375, 413),
  isLargeMobile: () => isViewportInRange(414, 428),
  isMobile: () => isViewportInRange(320, 767),
  isTablet: () => isViewportInRange(768, 1023),
  isDesktop: () => isViewportInRange(1024),
} as const;
