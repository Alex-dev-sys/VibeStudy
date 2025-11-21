/**
 * Mobile Responsive Hook
 * 
 * Provides reactive mobile device detection and viewport information
 */

'use client';

import { useState, useEffect } from 'react';
import {
  isMobileDevice,
  isIOS,
  isAndroid,
  getViewportSize,
  getOrientation,
  supportsTouchEvents,
  supportsHover,
  hasCoarsePointer,
  isMobileViewport,
  type DeviceCapabilities,
  getDeviceCapabilities,
} from '@/lib/mobile/mobile-detector';

export function useMobileResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportSize, setViewportSize] = useState<ReturnType<typeof getViewportSize>>('DESKTOP');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    // Initial detection
    setIsMobile(isMobileDevice());
    setViewportSize(getViewportSize());
    setOrientation(getOrientation());
    setIsMobileView(isMobileViewport());
    
    // Update on resize
    const handleResize = () => {
      setViewportSize(getViewportSize());
      setOrientation(getOrientation());
      setIsMobileView(isMobileViewport());
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return {
    isMobile,
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    viewportSize,
    orientation,
    isMobileView,
    isSmallMobile: viewportSize === 'SMALL_MOBILE',
    isMediumMobile: viewportSize === 'MEDIUM_MOBILE',
    isLargeMobile: viewportSize === 'LARGE_MOBILE',
    isTablet: viewportSize === 'TABLET',
    isDesktop: viewportSize === 'DESKTOP',
    supportsTouch: supportsTouchEvents(),
    supportsHover: supportsHover(),
    hasCoarsePointer: hasCoarsePointer(),
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}

/**
 * Hook for comprehensive device capabilities
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isIOS: false,
        isAndroid: false,
        supportsTouch: false,
        supportsHover: true,
        hasCoarsePointer: false,
        pixelRatio: 1,
        viewportSize: 'DESKTOP',
        orientation: 'portrait',
        isStandalone: false,
        safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      };
    }
    return getDeviceCapabilities();
  });
  
  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities(getDeviceCapabilities());
    };
    
    updateCapabilities();
    
    window.addEventListener('resize', updateCapabilities);
    window.addEventListener('orientationchange', updateCapabilities);
    
    return () => {
      window.removeEventListener('resize', updateCapabilities);
      window.removeEventListener('orientationchange', updateCapabilities);
    };
  }, []);
  
  return capabilities;
}

/**
 * Hook for viewport breakpoint detection
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else if (width < 1536) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };
    
    updateBreakpoint();
    
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
  };
}

/**
 * Hook for safe area insets (notches, home indicators)
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  
  useEffect(() => {
    const updateInsets = () => {
      if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
        return;
      }
      
      const style = getComputedStyle(document.documentElement);
      
      setInsets({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };
    
    updateInsets();
    
    // Update on orientation change
    window.addEventListener('orientationchange', updateInsets);
    
    return () => window.removeEventListener('orientationchange', updateInsets);
  }, []);
  
  return insets;
}
