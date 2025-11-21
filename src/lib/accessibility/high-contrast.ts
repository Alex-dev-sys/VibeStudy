/**
 * High Contrast Mode Support
 * Detects and adapts to high contrast mode preferences
 */

'use client';

import { useEffect, useState } from 'react';

export type ContrastPreference = 'no-preference' | 'more' | 'less' | 'custom';

/**
 * Hook to detect high contrast mode preference
 */
export function useHighContrast(): ContrastPreference {
  const [contrast, setContrast] = useState<ContrastPreference>('no-preference');

  useEffect(() => {
    const checkContrast = () => {
      if (window.matchMedia('(prefers-contrast: more)').matches) {
        setContrast('more');
      } else if (window.matchMedia('(prefers-contrast: less)').matches) {
        setContrast('less');
      } else if (window.matchMedia('(prefers-contrast: custom)').matches) {
        setContrast('custom');
      } else {
        setContrast('no-preference');
      }
    };

    checkContrast();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-contrast: more)'),
      window.matchMedia('(prefers-contrast: less)'),
      window.matchMedia('(prefers-contrast: custom)'),
    ];

    const handleChange = () => checkContrast();
    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, []);

  return contrast;
}

/**
 * Check if Windows High Contrast Mode is active
 */
export function isWindowsHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Windows High Contrast Mode
  return window.matchMedia('(forced-colors: active)').matches;
}

/**
 * Get color values adjusted for high contrast
 */
export function getHighContrastColors(preference: ContrastPreference) {
  if (preference === 'more') {
    return {
      background: '#000000',
      foreground: '#FFFFFF',
      primary: '#FFFF00',
      secondary: '#00FFFF',
      border: '#FFFFFF',
      focus: '#FFFF00',
    };
  }

  if (preference === 'less') {
    return {
      background: '#1a1a1a',
      foreground: '#e0e0e0',
      primary: '#ff0094',
      secondary: '#ffd200',
      border: '#404040',
      focus: '#ff0094',
    };
  }

  // Default colors
  return {
    background: '#0c061c',
    foreground: '#ffffff',
    primary: '#ff0094',
    secondary: '#ffd200',
    border: 'rgba(255, 255, 255, 0.1)',
    focus: '#ff0094',
  };
}

/**
 * Apply high contrast styles
 */
export function applyHighContrastStyles(preference: ContrastPreference) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const colors = getHighContrastColors(preference);

  if (preference === 'more') {
    root.style.setProperty('--high-contrast-bg', colors.background);
    root.style.setProperty('--high-contrast-fg', colors.foreground);
    root.style.setProperty('--high-contrast-primary', colors.primary);
    root.style.setProperty('--high-contrast-border', colors.border);
    root.style.setProperty('--high-contrast-focus', colors.focus);
    root.classList.add('high-contrast-mode');
  } else {
    root.classList.remove('high-contrast-mode');
  }
}

/**
 * Hook to apply high contrast styles
 */
export function useHighContrastStyles() {
  const preference = useHighContrast();

  useEffect(() => {
    applyHighContrastStyles(preference);
  }, [preference]);

  return preference;
}

/**
 * Get CSS class for high contrast mode
 */
export function getHighContrastClass(preference: ContrastPreference): string {
  switch (preference) {
    case 'more':
      return 'high-contrast-more';
    case 'less':
      return 'high-contrast-less';
    case 'custom':
      return 'high-contrast-custom';
    default:
      return '';
  }
}

/**
 * Ensure minimum contrast ratio (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 */
export function ensureContrastRatio(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): string {
  // This is a simplified version - in production, use a proper color contrast library
  const luminance = (color: string) => {
    // Convert hex to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgLuminance = luminance(foreground);
  const bgLuminance = luminance(background);

  const ratio =
    (Math.max(fgLuminance, bgLuminance) + 0.05) /
    (Math.min(fgLuminance, bgLuminance) + 0.05);

  if (ratio >= minRatio) {
    return foreground;
  }

  // If contrast is insufficient, return white or black depending on background
  return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * CSS for high contrast mode
 */
export const highContrastStyles = `
  @media (prefers-contrast: more) {
    :root {
      --bg-primary: #000000;
      --text-primary: #FFFFFF;
      --border-color: #FFFFFF;
      --focus-color: #FFFF00;
    }

    * {
      border-color: var(--border-color) !important;
    }

    a, button {
      text-decoration: underline;
    }

    :focus-visible {
      outline: 3px solid var(--focus-color) !important;
      outline-offset: 2px;
    }
  }

  @media (forced-colors: active) {
    * {
      forced-color-adjust: auto;
    }

    .glass-panel,
    .glass-panel-enhanced {
      background: Canvas !important;
      border: 1px solid CanvasText !important;
    }

    button, a {
      border: 1px solid ButtonText !important;
    }
  }
`;
