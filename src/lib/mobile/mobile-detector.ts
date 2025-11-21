/**
 * Mobile Device Detection and Optimization Utilities
 * 
 * Provides utilities for detecting mobile devices, viewport sizes,
 * and optimizing interactions for touch interfaces.
 */

/**
 * Detects if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile device patterns
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
}

/**
 * Detects if the device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Detects if the device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
}

/**
 * Gets device pixel ratio for high-DPI displays
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  
  return window.devicePixelRatio || 1;
}

/**
 * Detects if device supports hover
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined') return true;
  
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Detects if device has a coarse pointer (touch)
 */
export function hasCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Gets the current orientation
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Detects if device is in standalone mode (PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Gets safe area insets for devices with notches
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
}

/**
 * Viewport size categories for responsive design
 */
export const VIEWPORT_SIZES = {
  SMALL_MOBILE: { min: 320, max: 374 },   // iPhone SE, small Android
  MEDIUM_MOBILE: { min: 375, max: 413 },  // iPhone 12/13/14, most Android
  LARGE_MOBILE: { min: 414, max: 428 },   // iPhone Plus/Pro Max
  TABLET: { min: 768, max: 1023 },        // iPad, Android tablets
  DESKTOP: { min: 1024, max: Infinity },  // Laptops and desktops
} as const;

/**
 * Gets the current viewport size category
 */
export function getViewportSize(): keyof typeof VIEWPORT_SIZES {
  if (typeof window === 'undefined') return 'DESKTOP';
  
  const width = window.innerWidth;
  
  if (width >= VIEWPORT_SIZES.SMALL_MOBILE.min && width <= VIEWPORT_SIZES.SMALL_MOBILE.max) {
    return 'SMALL_MOBILE';
  }
  if (width >= VIEWPORT_SIZES.MEDIUM_MOBILE.min && width <= VIEWPORT_SIZES.MEDIUM_MOBILE.max) {
    return 'MEDIUM_MOBILE';
  }
  if (width >= VIEWPORT_SIZES.LARGE_MOBILE.min && width <= VIEWPORT_SIZES.LARGE_MOBILE.max) {
    return 'LARGE_MOBILE';
  }
  if (width >= VIEWPORT_SIZES.TABLET.min && width <= VIEWPORT_SIZES.TABLET.max) {
    return 'TABLET';
  }
  
  return 'DESKTOP';
}

/**
 * Checks if viewport is within mobile range (320px - 428px)
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  return width >= 320 && width <= 428;
}

/**
 * Optimizes touch event handling
 */
export function optimizeTouchEvent(callback: (e: TouchEvent) => void) {
  let touchStartTime = 0;
  
  return (e: TouchEvent) => {
    // Prevent accidental double-taps
    const now = Date.now();
    if (now - touchStartTime < 300) {
      e.preventDefault();
      return;
    }
    
    touchStartTime = now;
    callback(e);
  };
}

/**
 * Provides haptic feedback on supported devices
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }
  
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
  };
  
  navigator.vibrate(patterns[type]);
}

/**
 * Detects if device supports touch events
 */
export function supportsTouchEvents(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Gets optimal font size for current viewport
 */
export function getOptimalFontSize(baseSize: number): number {
  if (typeof window === 'undefined') return baseSize;
  
  const viewportSize = getViewportSize();
  
  const scalingFactors = {
    SMALL_MOBILE: 0.9,
    MEDIUM_MOBILE: 1.0,
    LARGE_MOBILE: 1.05,
    TABLET: 1.1,
    DESKTOP: 1.0,
  };
  
  return baseSize * scalingFactors[viewportSize];
}

/**
 * Device capabilities detection
 */
export interface DeviceCapabilities {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsTouch: boolean;
  supportsHover: boolean;
  hasCoarsePointer: boolean;
  pixelRatio: number;
  viewportSize: keyof typeof VIEWPORT_SIZES;
  orientation: 'portrait' | 'landscape';
  isStandalone: boolean;
  safeAreaInsets: ReturnType<typeof getSafeAreaInsets>;
}

/**
 * Gets comprehensive device capabilities
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  return {
    isMobile: isMobileDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    supportsTouch: supportsTouchEvents(),
    supportsHover: supportsHover(),
    hasCoarsePointer: hasCoarsePointer(),
    pixelRatio: getDevicePixelRatio(),
    viewportSize: getViewportSize(),
    orientation: getOrientation(),
    isStandalone: isStandalone(),
    safeAreaInsets: getSafeAreaInsets(),
  };
}
