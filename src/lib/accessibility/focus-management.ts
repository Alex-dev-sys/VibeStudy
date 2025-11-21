/**
 * Focus Management Utilities
 * Handles focus trapping, restoration, and management
 */

import { useEffect, useRef, useCallback } from 'react';
import { getFocusableElements } from './keyboard-navigation';

/**
 * Hook to trap focus within a container (for modals, dialogs)
 */
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean,
  options: {
    initialFocus?: HTMLElement | null;
    returnFocus?: boolean;
  } = {}
) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const { initialFocus, returnFocus = true } = options;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus the initial element or first focusable element
    const focusableElements = getFocusableElements(containerRef.current);
    const elementToFocus = initialFocus || focusableElements[0];
    
    if (elementToFocus) {
      // Use setTimeout to ensure the element is rendered
      setTimeout(() => elementToFocus.focus(), 0);
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);

      // Restore focus to previously focused element
      if (returnFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive, initialFocus, returnFocus]);

  return containerRef;
}

/**
 * Hook to restore focus when component unmounts
 */
export function useFocusRestore() {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    return () => {
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, []);
}

/**
 * Hook to manage focus visible state (show focus ring only for keyboard)
 */
export function useFocusVisible() {
  const isFocusVisibleRef = useRef(false);

  useEffect(() => {
    const handleMouseDown = () => {
      isFocusVisibleRef.current = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isFocusVisibleRef.current = true;
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return isFocusVisibleRef;
}

/**
 * Focus the first error in a form
 */
export function focusFirstError(formElement: HTMLElement) {
  const errorElements = formElement.querySelectorAll('[aria-invalid="true"]');
  const firstError = errorElements[0] as HTMLElement;
  
  if (firstError) {
    firstError.focus();
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Create a focus guard to prevent focus from leaving a container
 */
export function createFocusGuard(container: HTMLElement) {
  const beforeGuard = document.createElement('div');
  const afterGuard = document.createElement('div');

  beforeGuard.tabIndex = 0;
  afterGuard.tabIndex = 0;

  beforeGuard.style.position = 'fixed';
  afterGuard.style.position = 'fixed';
  beforeGuard.style.opacity = '0';
  afterGuard.style.opacity = '0';
  beforeGuard.style.pointerEvents = 'none';
  afterGuard.style.pointerEvents = 'none';

  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  beforeGuard.addEventListener('focus', () => {
    lastElement?.focus();
  });

  afterGuard.addEventListener('focus', () => {
    firstElement?.focus();
  });

  container.insertBefore(beforeGuard, container.firstChild);
  container.appendChild(afterGuard);

  return () => {
    beforeGuard.remove();
    afterGuard.remove();
  };
}

/**
 * Hook to scroll element into view when focused
 */
export function useScrollIntoView<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);

  const scrollIntoView = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleFocus = () => scrollIntoView();
    element.addEventListener('focus', handleFocus);

    return () => element.removeEventListener('focus', handleFocus);
  }, [scrollIntoView]);

  return elementRef;
}
