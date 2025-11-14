/**
 * Focus Management Utilities for Accessibility
 * Provides functions for managing focus in modals, dialogs, and complex UI components
 */

/**
 * Trap focus within a container element
 * Useful for modals and dialogs to prevent focus from escaping
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) {
    return () => {};
  }
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Store the element that had focus before trapping
  const previouslyFocusedElement = document.activeElement as HTMLElement;
  
  // Focus the first element
  firstElement.focus();
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }
    
    // Shift + Tab (backwards)
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
    // Tab (forwards)
    else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    // Restore focus to previously focused element
    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      previouslyFocusedElement.focus();
    }
  };
}

/**
 * Restore focus to a previously focused element
 * Useful after closing modals or dialogs
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && element.focus) {
    // Use setTimeout to ensure the element is visible and focusable
    setTimeout(() => {
      element.focus();
    }, 0);
  }
}

/**
 * Move focus to the first focusable element in a container
 * Useful for keyboard navigation
 */
export function moveFocusToFirstElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

/**
 * Move focus to the last focusable element in a container
 */
export function moveFocusToLastElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1].focus();
  }
}

/**
 * Get all focusable elements within a container
 * Returns elements in DOM order
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');
  
  const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  
  // Filter out elements that are not visible
  return elements.filter((element) => {
    return (
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    );
  });
}

/**
 * Announce a message to screen readers using ARIA live regions
 */
export function announceLiveRegion(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  // Find or create live region
  let liveRegion = document.getElementById('aria-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Screen reader only
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }
  
  // Update the message
  liveRegion.textContent = message;
  
  // Clear the message after a delay to allow re-announcing the same message
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  }, 1000);
}

/**
 * Create a focus trap hook for React components
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) {
      return;
    }
    
    const cleanup = trapFocus(containerRef.current);
    
    return cleanup;
  }, [containerRef, isActive]);
}

// Export React for the hook
import React from 'react';
