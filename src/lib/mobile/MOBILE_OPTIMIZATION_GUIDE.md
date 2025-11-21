# Mobile-First Responsive Design Guide

## Overview

This guide documents the mobile-first responsive design system implemented for VibeStudy. All components and layouts follow WCAG 2.1 Level AAA guidelines and mobile best practices.

## Touch Target Requirements

### Minimum Sizes
- **WCAG 2.1 AAA**: 44x44px minimum
- **Material Design**: 48x48dp recommended
- **iOS HIG**: 44x44pt minimum

### Implementation
All interactive elements (buttons, links, form inputs) meet or exceed 44x44px:

```tsx
// Button component automatically enforces minimum sizes
<Button size="sm">Text</Button>  // min-h-[44px] min-w-[44px]
<Button size="md">Text</Button>  // min-h-[44px] min-w-[44px]
<Button size="lg">Text</Button>  // min-h-[56px] min-w-[56px]
```

### Spacing Between Targets
- **Minimum**: 8px between interactive elements
- **Recommended**: 12px for better usability

```tsx
// Use touch-spacing utilities
<div className="touch-spacing flex">  // gap-2 (8px)
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>

<div className="touch-spacing-safe flex">  // gap-3 (12px)
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

## Viewport Optimization

### Target Viewport Ranges
- **Small Mobile**: 320px - 374px (iPhone SE, small Android)
- **Medium Mobile**: 375px - 413px (iPhone 12/13/14, most Android)
- **Large Mobile**: 414px - 428px (iPhone Plus/Pro Max)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Testing Viewports
Test on these specific widths:
- 320px (iPhone SE)
- 375px (iPhone 12/13)
- 390px (iPhone 14 Pro)
- 414px (iPhone Plus)
- 428px (iPhone 14 Pro Max)

## Responsive Typography

### Fluid Typography System
Uses `clamp()` for smooth scaling across viewports:

```css
.text-responsive-base {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
}
```

### Typography Scale
| Element | Mobile | Desktop | Usage |
|---------|--------|---------|-------|
| Caption | 12px | 12px | Small labels, metadata |
| Small | 14px | 14px | Secondary text |
| Body | 16px | 16px | Main content |
| Body Large | 18px | 20px | Emphasized content |
| H3 | 18px | 20px | Section headings |
| H2 | 20px | 24px | Page sections |
| H1 | 24px | 32px | Page titles |
| Hero | 32px | 48px | Landing page hero |

### Usage
```tsx
<h1 className="text-responsive-2xl">Page Title</h1>
<h2 className="text-responsive-xl">Section Heading</h2>
<p className="text-responsive-base">Body content</p>
```

## Mobile Navigation

### Bottom Navigation Bar
- Fixed to bottom of screen on mobile
- Minimum 56px height for touch targets
- Safe area insets for devices with home indicators
- 4 primary navigation items maximum

```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-navigation safe-area-inset-bottom">
  {/* Navigation items with min-h-[56px] */}
</nav>
```

### Desktop Navigation
- Fixed to top of screen
- Horizontal layout with clear labels
- Persistent across all pages

## Floating Action Buttons (FAB)

### Primary FAB
- 56px diameter (default) or 64px (large)
- Positioned bottom-right with safe spacing
- Can be extended to show label
- Automatic haptic feedback on mobile

```tsx
<FloatingActionButton
  icon={Plus}
  label="Add New"
  position="bottom-right"
  size="default"
  extended={false}
/>
```

### Mini FAB
- 40px diameter
- Used for secondary actions
- Can be grouped together

```tsx
<MiniFAB icon={Heart} label="Like" />
```

## Responsive Containers

### Mobile-First Padding
```tsx
<div className="responsive-container">
  {/* Automatically adjusts padding:
      Mobile: 16px
      Tablet: 24px
      Desktop: 32px
  */}
</div>
```

### Max Width Constraints
- Mobile: 100% width
- Tablet: 768px max
- Desktop: 1280px max

## Grid Systems

### Mobile Grid
Automatically adjusts columns based on viewport:

```tsx
<div className="mobile-grid">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

## Horizontal Scrolling

### Touch-Optimized Scrolling
```tsx
<div className="mobile-scroll flex gap-3">
  {items.map(item => (
    <div className="flex-shrink-0 w-32 h-32">
      {item.content}
    </div>
  ))}
</div>
```

Features:
- Smooth touch scrolling
- Thin scrollbar (4px)
- Momentum scrolling on iOS

## Safe Area Insets

### Device Notches and Home Indicators
```tsx
// Automatic safe area handling
<div className="safe-area-inset-top">Header</div>
<div className="safe-area-inset-bottom">Footer</div>
```

### Hook Usage
```tsx
const insets = useSafeAreaInsets();
// { top: 44, right: 0, bottom: 34, left: 0 }
```

## Mobile Detection Hooks

### useMobileResponsive
```tsx
const mobile = useMobileResponsive();

// Available properties:
mobile.isMobile          // true/false
mobile.isIOS             // true/false
mobile.isAndroid         // true/false
mobile.viewportSize      // 'SMALL_MOBILE' | 'MEDIUM_MOBILE' | etc.
mobile.orientation       // 'portrait' | 'landscape'
mobile.supportsTouch     // true/false
mobile.supportsHover     // true/false
```

### useBreakpoint
```tsx
const breakpoint = useBreakpoint();

// Available properties:
breakpoint.breakpoint    // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
breakpoint.isMobile      // true for xs/sm
breakpoint.isTablet      // true for md
breakpoint.isDesktop     // true for lg/xl/2xl
```

## Performance Optimizations

### Image Optimization
```tsx
<img 
  src="/image.jpg"
  className="responsive-image"
  loading="lazy"
  decoding="async"
/>
```

### Reduced Motion Support
Automatically respects user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Event Optimization
```tsx
import { hapticFeedback } from '@/lib/mobile/mobile-detector';

function handleClick() {
  hapticFeedback('light'); // Provides tactile feedback
  // ... handle action
}
```

## Accessibility

### Focus Indicators
- Larger focus rings on touch devices (3px vs 2px)
- High contrast focus states
- Visible on all interactive elements

### Screen Reader Support
- All interactive elements have proper ARIA labels
- Navigation landmarks properly defined
- Dynamic content changes announced

### Keyboard Navigation
- Full keyboard support maintained
- Logical tab order
- Skip links for main content

## Testing Checklist

### Manual Testing
- [ ] Test on real devices (iOS and Android)
- [ ] Test in portrait and landscape orientations
- [ ] Verify touch targets are easily tappable
- [ ] Check spacing between interactive elements
- [ ] Test scrolling behavior (horizontal and vertical)
- [ ] Verify safe area insets on notched devices
- [ ] Test with one-handed use
- [ ] Verify text is readable without zooming

### Automated Testing
- [ ] Lighthouse mobile score > 90
- [ ] No horizontal scrolling on mobile viewports
- [ ] All touch targets meet 44x44px minimum
- [ ] Proper viewport meta tag configured
- [ ] Touch events properly handled

### Viewport Testing
Test at these specific widths:
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12/13)
- [ ] 390px (iPhone 14 Pro)
- [ ] 414px (iPhone Plus)
- [ ] 428px (iPhone 14 Pro Max)
- [ ] 768px (iPad)
- [ ] 1024px (Desktop)

## Common Patterns

### Mobile-First Card
```tsx
<Card className="mobile-padding">
  <CardHeader>
    <CardTitle className="text-responsive-xl">Title</CardTitle>
    <CardDescription className="text-responsive-base">
      Description
    </CardDescription>
  </CardHeader>
  <div className="px-4 pb-4 md:px-6 md:pb-6">
    <div className="touch-spacing-safe flex flex-wrap">
      <Button size="md">Action 1</Button>
      <Button size="md">Action 2</Button>
    </div>
  </div>
</Card>
```

### Responsive Layout
```tsx
<div className="responsive-container py-6">
  <div className="mobile-card-stack">
    <Card>Content 1</Card>
    <Card>Content 2</Card>
    <Card>Content 3</Card>
  </div>
</div>
```

### Mobile Modal
```tsx
<div className="mobile-modal">
  <div className="safe-area-inset-top p-6">
    {/* Modal content */}
  </div>
</div>
```

## Resources

### Documentation
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)

### Tools
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- BrowserStack for real device testing
- Lighthouse for mobile performance

## Support

For questions or issues with mobile responsiveness:
1. Check this guide first
2. Review the demo page at `/demo/mobile-responsive`
3. Test with the mobile detection hooks
4. Verify touch target sizes with browser DevTools
