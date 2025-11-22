# Mobile Responsive Design Guide

## Overview

The AI Learning Assistant chat interface has been fully optimized for mobile devices with responsive design patterns, touch-friendly interactions, and adaptive layouts.

## Key Features

### 1. Responsive Layout

**Desktop (>768px)**
- Floating panel (400px width) positioned at bottom-right
- Rounded corners with shadow
- Minimize/maximize functionality
- Slide-in animation from right

**Mobile (<768px)**
- Full-screen overlay
- Covers entire viewport
- Back button instead of minimize/close
- Slide-up animation from bottom

### 2. Touch-Friendly Interactions

All interactive elements meet WCAG 2.1 touch target guidelines:
- **Minimum size**: 44x44px for all buttons
- **Touch manipulation**: CSS property prevents double-tap zoom
- **Active states**: Scale-down effect on tap for visual feedback
- **Spacing**: Adequate spacing between touch targets

### 3. Keyboard Optimization

The interface adapts when the mobile keyboard appears:
- Message container adjusts height dynamically
- Input remains visible above keyboard
- Auto-scroll maintains context
- Proper viewport height calculation

### 4. Components

#### ChatInterface
```tsx
import { ChatInterface } from '@/components/ai-assistant';

<ChatInterface
  isOpen={isOpen}
  onClose={handleClose}
  userTier="premium"
  locale="ru"
/>
```

**Mobile Adaptations:**
- Full-screen mode on mobile
- Back button navigation
- Optimized message bubbles (85% max-width on mobile)
- Touch-optimized input area

#### FloatingChatButton
```tsx
import { FloatingChatButton } from '@/components/ai-assistant';

<FloatingChatButton
  onClick={handleOpen}
  locale="ru"
  hasUnread={false}
/>
```

**Features:**
- Fixed positioning (bottom-right)
- Gradient background with hover effects
- Unread indicator badge
- Tooltip on hover (desktop only)
- Ripple animation effect
- Responsive sizing (56px mobile, 64px desktop)

### 5. Animations

All animations are defined in `tailwind.config.ts`:

```typescript
// Mobile-specific animations
'slide-in-right': 'slide-in-right 0.3s ease-out',  // Desktop entry
'slide-up': 'slide-up 0.3s ease-out',              // Mobile entry
'fade-in': 'fade-in 0.2s ease-out',                // Message appearance
```

### 6. Accessibility

**Mobile Accessibility Features:**
- Proper ARIA labels for all buttons
- Focus management on open/close
- Screen reader announcements
- High contrast support
- Reduced motion support (respects prefers-reduced-motion)

### 7. Performance Optimizations

**Mobile Performance:**
- Lazy loading of chat interface
- Optimized re-renders with React.memo
- Efficient scroll handling
- Debounced resize listeners
- CSS transforms for animations (GPU-accelerated)

## Usage Example

### Basic Integration

```tsx
'use client';

import { useState } from 'react';
import { ChatInterface, FloatingChatButton } from '@/components/ai-assistant';
import { useProfileStore } from '@/store/profile-store';

export function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { profile } = useProfileStore();

  return (
    <div>
      {/* Your dashboard content */}
      
      {/* Floating button to open chat */}
      <FloatingChatButton
        onClick={() => setIsChatOpen(true)}
        locale={profile.locale}
      />
      
      {/* Chat interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userTier={profile.tier}
        locale={profile.locale}
      />
    </div>
  );
}
```

### With useAIAssistant Hook

```tsx
'use client';

import { ChatInterface, FloatingChatButton } from '@/components/ai-assistant';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useProfileStore } from '@/store/profile-store';

export function Dashboard() {
  const { isOpen, openChat, closeChat } = useAIAssistant();
  const { profile } = useProfileStore();

  return (
    <div>
      {/* Your dashboard content */}
      
      <FloatingChatButton
        onClick={openChat}
        locale={profile.locale}
      />
      
      <ChatInterface
        isOpen={isOpen}
        onClose={closeChat}
        userTier={profile.tier}
        locale={profile.locale}
      />
    </div>
  );
}
```

## Mobile Testing Checklist

- [ ] Chat opens in full-screen on mobile
- [ ] Back button closes chat on mobile
- [ ] All buttons are at least 44x44px
- [ ] Touch interactions feel responsive
- [ ] Keyboard doesn't cover input
- [ ] Messages scroll smoothly
- [ ] Quick actions are easily tappable
- [ ] Animations are smooth (60fps)
- [ ] Works in portrait and landscape
- [ ] Safe area insets respected (notches)
- [ ] No horizontal scrolling
- [ ] Text is readable without zoom

## Browser Support

- **iOS Safari**: 14+
- **Chrome Mobile**: Latest 2 versions
- **Firefox Mobile**: Latest 2 versions
- **Samsung Internet**: Latest version

## Known Limitations

1. **iOS Keyboard**: On iOS, the viewport height changes when keyboard appears. The interface handles this with dynamic height calculations.

2. **Android Back Button**: The Android back button will close the chat if it's open (handled by browser default behavior).

3. **Landscape Mode**: In landscape mode on small devices, the chat may cover most of the screen. This is intentional for better usability.

## Future Enhancements

- [ ] Swipe-down to close on mobile
- [ ] Voice input support
- [ ] Haptic feedback on interactions
- [ ] Picture-in-picture mode
- [ ] Offline message queue
- [ ] Push notifications for responses

## Troubleshooting

### Chat doesn't open on mobile
- Check that `useBreakpoint` hook is working
- Verify z-index is high enough (1000)
- Check for conflicting CSS

### Buttons too small on mobile
- Verify `min-w-[44px] min-h-[44px]` classes are applied
- Check that parent containers don't restrict size

### Keyboard covers input
- Ensure viewport meta tag is set correctly
- Check dynamic height calculation in ChatInterface
- Test on actual device (not just browser DevTools)

### Animations are janky
- Check for layout thrashing
- Verify CSS transforms are used (not top/left)
- Test on lower-end devices
- Consider reducing animation complexity

## Resources

- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile Web Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/principles)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
