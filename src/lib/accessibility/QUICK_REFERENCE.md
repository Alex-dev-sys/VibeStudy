# Accessibility Quick Reference

## 🚀 Quick Start

### 1. Import What You Need

```typescript
// Keyboard navigation
import { useKeyboardNavigation } from '@/lib/accessibility/keyboard-navigation';

// Focus management
import { useFocusTrap } from '@/lib/accessibility/focus-management';

// Announcements
import { announce } from '@/lib/accessibility/aria-announcer';

// Motion preferences
import { useReducedMotion } from '@/lib/accessibility/reduced-motion';

// Form components
import { Input, Textarea, Select, Checkbox } from '@/components/ui/Form';
```

### 2. Common Patterns

#### Accessible Button
```typescript
<Button
  ariaLabel="Close dialog"
  onClick={handleClick}
>
  <X />
</Button>
```

#### Accessible Modal
```typescript
function MyModal() {
  const modalRef = useFocusTrap(isOpen);
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dialog Title"
    >
      {content}
    </Modal>
  );
}
```

#### Accessible Form
```typescript
<Input
  label="Email"
  required
  error={errors.email}
  helperText="We'll never share your email"
/>
```

#### Screen Reader Announcement
```typescript
// Success message
announce('Task completed!', 'polite');

// Error message
announce('An error occurred', 'assertive');
```

#### Respect Motion Preferences
```typescript
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={prefersReducedMotion ? {} : { scale: 1.1 }}
/>
```

## 📋 Checklist for New Components

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] ARIA labels for icon-only buttons
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Respect reduced motion preference
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Touch targets are 44x44px minimum

## 🎯 Common Fixes

### Missing Alt Text
```typescript
// ❌ Bad
<img src="logo.png" />

// ✅ Good
<img src="logo.png" alt="VibeStudy logo" />
```

### Missing Button Label
```typescript
// ❌ Bad
<button><X /></button>

// ✅ Good
<button aria-label="Close"><X /></button>
```

### Missing Form Label
```typescript
// ❌ Bad
<input type="email" />

// ✅ Good
<Input label="Email" type="email" />
```

### Poor Contrast
```typescript
// ❌ Bad (2.1:1)
color: rgba(255, 255, 255, 0.4);

// ✅ Good (4.8:1)
color: rgba(255, 255, 255, 0.7);
```

### No Focus Indicator
```typescript
// ❌ Bad
button:focus {
  outline: none;
}

// ✅ Good
button:focus-visible {
  outline: 2px solid #ff0094;
  outline-offset: 2px;
}
```

## 🔧 Testing Commands

```bash
# Run accessibility tests
npm run test:a11y

# Check with Lighthouse
# Open DevTools → Lighthouse → Accessibility

# Test with screen reader
# Windows: NVDA (free)
# Mac: VoiceOver (Cmd+F5)
```

## 📚 More Resources

- Full Guide: `/src/lib/accessibility/README.md`
- Testing Guide: `/src/lib/accessibility/TESTING_GUIDE.md`
- Demo Page: `/demo/accessibility`
- Implementation Summary: `/.kiro/specs/professional-ux-redesign/task-15-implementation-summary.md`
