# Accessibility Implementation Guide

## Overview

This directory contains utilities and components for WCAG 2.1 AA compliance across the VibeStudy platform.

## Key Features

1. **Keyboard Navigation**: Full keyboard support with visible focus indicators
2. **Screen Reader Support**: ARIA labels and live regions
3. **Reduced Motion**: Respects prefers-reduced-motion preference
4. **High Contrast**: Support for high contrast mode
5. **Form Accessibility**: Proper labels and error messages
6. **Focus Management**: Trap focus in modals, restore on close

## Files

- `keyboard-navigation.ts` - Keyboard navigation utilities
- `focus-management.ts` - Focus trap and restoration
- `aria-announcer.tsx` - Live region announcements
- `reduced-motion.ts` - Motion preference detection
- `high-contrast.ts` - High contrast mode support
- `form-accessibility.ts` - Form validation and error handling
- `skip-links.tsx` - Skip to content navigation

## Usage

### Keyboard Navigation

```typescript
import { useKeyboardNavigation } from '@/lib/accessibility/keyboard-navigation';

function MyComponent() {
  useKeyboardNavigation({
    onEscape: () => closeModal(),
    onEnter: () => submitForm(),
  });
}
```

### Focus Management

```typescript
import { useFocusTrap } from '@/lib/accessibility/focus-management';

function Modal() {
  const modalRef = useFocusTrap(isOpen);
  return <div ref={modalRef}>...</div>;
}
```

### ARIA Announcements

```typescript
import { announce } from '@/lib/accessibility/aria-announcer';

// Announce to screen readers
announce('Task completed successfully', 'polite');
announce('Error occurred', 'assertive');
```

### Reduced Motion

```typescript
import { useReducedMotion } from '@/lib/accessibility/reduced-motion';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { scale: 1.1 }}
    />
  );
}
```

## WCAG 2.1 AA Compliance Checklist

### Perceivable
- [x] Text alternatives for non-text content
- [x] Captions and alternatives for multimedia
- [x] Content can be presented in different ways
- [x] Content is distinguishable (color contrast 4.5:1)

### Operable
- [x] All functionality available from keyboard
- [x] Users have enough time to read and use content
- [x] Content does not cause seizures (no flashing)
- [x] Users can easily navigate and find content
- [x] Multiple ways to navigate

### Understandable
- [x] Text is readable and understandable
- [x] Content appears and operates in predictable ways
- [x] Users are helped to avoid and correct mistakes

### Robust
- [x] Content is compatible with assistive technologies
- [x] Valid HTML and ARIA usage

## Testing

### Automated Testing
```bash
npm run test:a11y
```

### Manual Testing
1. **Keyboard Navigation**: Tab through entire interface
2. **Screen Reader**: Test with NVDA (Windows), JAWS (Windows), VoiceOver (Mac)
3. **Zoom**: Test at 200% zoom level
4. **Color Contrast**: Use browser DevTools accessibility panel

### Tools
- axe DevTools (browser extension)
- WAVE (browser extension)
- Lighthouse accessibility audit
- Screen readers (NVDA, JAWS, VoiceOver)
