/**
 * Animation optimization utilities using CSS transforms and GPU acceleration
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimized animation variants for Framer Motion
 */
export function getOptimizedVariants(reducedMotion: boolean = prefersReducedMotion()) {
  if (reducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  return {
    // Fade animations
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // Slide animations (GPU-accelerated with transform)
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },

    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },

    slideLeft: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },

    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },

    // Scale animations (GPU-accelerated with transform)
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },

    scaleUp: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 },
    },

    // Bounce animation
    bounce: {
      initial: { opacity: 0, scale: 0 },
      animate: { 
        opacity: 1, 
        scale: [0, 1.2, 1],
        transition: { duration: 0.5, times: [0, 0.6, 1] }
      },
      exit: { opacity: 0, scale: 0 },
    },

    // Rotate animation
    rotate: {
      initial: { opacity: 0, rotate: -180 },
      animate: { opacity: 1, rotate: 0 },
      exit: { opacity: 0, rotate: 180 },
    },
  };
}

/**
 * Optimized transition configurations
 */
export const transitions = {
  // Fast transitions for immediate feedback
  fast: {
    duration: 0.15,
    ease: 'easeOut',
  },

  // Default transitions
  default: {
    duration: 0.3,
    ease: 'easeInOut',
  },

  // Smooth transitions for larger movements
  smooth: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier
  },

  // Spring transitions for natural feel
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },

  // Bouncy spring
  bouncySpring: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  },
};

/**
 * CSS class for GPU-accelerated animations
 */
export const gpuAcceleration = 'transform-gpu will-change-transform';

/**
 * Apply GPU acceleration to element
 */
export function enableGPUAcceleration(element: HTMLElement) {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform';
}

/**
 * Remove GPU acceleration from element
 */
export function disableGPUAcceleration(element: HTMLElement) {
  element.style.transform = '';
  element.style.willChange = 'auto';
}

/**
 * Optimized scroll animation
 */
export function smoothScrollTo(
  element: HTMLElement | null,
  options: ScrollIntoViewOptions = {}
) {
  if (!element) return;

  const reducedMotion = prefersReducedMotion();

  element.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'center',
    ...options,
  });
}

/**
 * Request animation frame with fallback
 */
export function requestAnimationFramePolyfill(callback: FrameRequestCallback): number {
  if (typeof window === 'undefined') return 0;
  
  return window.requestAnimationFrame?.(callback) || 
         window.setTimeout(callback, 1000 / 60);
}

/**
 * Cancel animation frame with fallback
 */
export function cancelAnimationFramePolyfill(id: number): void {
  if (typeof window === 'undefined') return;
  
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    window.clearTimeout(id);
  }
}

/**
 * Throttle animation updates
 */
export function throttleAnimation<T extends (...args: any[]) => void>(
  callback: T,
  fps: number = 60
): T {
  let lastTime = 0;
  const interval = 1000 / fps;

  return ((...args: any[]) => {
    const now = Date.now();
    
    if (now - lastTime >= interval) {
      lastTime = now;
      callback(...args);
    }
  }) as T;
}

/**
 * Debounce animation updates
 */
export function debounceAnimation<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 100
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
}

/**
 * CSS animation classes for common patterns
 */
export const animationClasses = {
  // Fade
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',

  // Slide
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',

  // Scale
  scaleIn: 'animate-in zoom-in duration-300',
  scaleOut: 'animate-out zoom-out duration-300',

  // Spin
  spin: 'animate-spin',
  spinSlow: 'animate-spin-slow',

  // Pulse
  pulse: 'animate-pulse',

  // Bounce
  bounce: 'animate-bounce',
};

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  start() {
    this.measure();
  }

  private measure() {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;

      if (this.fps < 30) {
        console.warn(`[Performance] Low FPS detected: ${this.fps}`);
      }
    }

    requestAnimationFramePolyfill(() => this.measure());
  }

  getFPS(): number {
    return this.fps;
  }
}
