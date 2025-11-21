# Micro-Interactions System

This document describes the micro-interactions and feedback system implemented for the VibeStudy platform.

## Overview

The micro-interactions system provides immediate visual and haptic feedback for user actions, following the design principle that all interactions should provide feedback within 100ms.

## Components

### 1. Enhanced Button Component

**Location:** `src/components/ui/Button.tsx`

**Features:**
- Press animation with scale effect (0.98)
- Haptic feedback on mobile devices (10ms vibration)
- Visual brightness change on press
- Loading state support
- Framer Motion integration for smooth animations

**Usage:**
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button variant="primary" isLoading>
  Loading...
</Button>
```

**Variants:**
- `primary`: Gradient background with shadow
- `secondary`: Transparent with border
- `ghost`: Minimal styling

**Sizes:**
- `sm`: 36px min-height
- `md`: 44px min-height (default)
- `lg`: 56px min-height

### 2. Task Completion Animation

**Location:** `src/components/ui/TaskCompletionAnimation.tsx`

**Features:**
- Confetti celebration effect (200 pieces)
- Animated checkmark with path drawing
- Auto-dismisses after 3 seconds
- Responsive to window size
- Custom color palette matching brand

**Usage:**
```tsx
import { TaskCompletionAnimation } from '@/components/ui/TaskCompletionAnimation';

const [showAnimation, setShowAnimation] = useState(false);

<TaskCompletionAnimation 
  isVisible={showAnimation}
  onComplete={() => setShowAnimation(false)}
/>
```

### 3. Toast Notification System

**Location:** `src/lib/toast.ts`

**Features:**
- Multiple toast types (success, error, info, warning, loading)
- Custom toasts for specific events (task complete, day complete, achievements)
- Auto-dismiss with configurable duration
- Promise-based toasts for async operations
- Styled to match dark theme

**Usage:**
```tsx
import { toast } from '@/lib/toast';

// Basic toasts
toast.success('Success!', 'Operation completed');
toast.error('Error!', 'Something went wrong');
toast.info('Info', 'This is information');
toast.warning('Warning!', 'Be careful');

// Loading toast
const loadingId = toast.loading('Processing...');
// ... async operation
toast.dismiss(loadingId);
toast.success('Done!');

// Promise toast
toast.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded!',
    error: 'Failed to load data'
  }
);

// Custom event toasts
toast.taskComplete('Task title');
toast.dayComplete(5);
toast.streakMilestone(10);
toast.achievementUnlock('Achievement', 'Description');
```

### 4. Skeleton Loading States

**Location:** `src/components/ui/Skeleton.tsx`

**Features:**
- Animated pulse effect
- Multiple variants (text, circular, rectangular)
- Pre-built skeleton components (Card, Button, Avatar)
- Customizable dimensions
- Reduced motion support

**Usage:**
```tsx
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonButton, 
  SkeletonAvatar,
  SkeletonText 
} from '@/components/ui/Skeleton';

// Basic skeleton
<Skeleton className="h-8 w-48" />

// Pre-built skeletons
<SkeletonCard />
<SkeletonButton />
<SkeletonAvatar size="md" />
<SkeletonText lines={3} />
```

### 5. Loading State Wrapper

**Location:** `src/components/ui/LoadingState.tsx`

**Features:**
- Automatic delay before showing loading (500ms default)
- Minimum duration to prevent flash (300ms default)
- Smooth fade transitions
- Custom fallback support
- Hook for managing loading states

**Usage:**
```tsx
import { LoadingState, useLoadingState } from '@/components/ui/LoadingState';

// Component wrapper
<LoadingState 
  isLoading={isLoading}
  fallback={<SkeletonCard />}
  delay={500}
  minDuration={300}
>
  <YourContent />
</LoadingState>

// Hook usage
const { isLoading, startLoading, stopLoading } = useLoadingState();

const handleAction = async () => {
  startLoading('Loading...');
  await performAction();
  stopLoading();
};
```

### 6. Visual Feedback Components

**Location:** `src/components/ui/VisualFeedback.tsx`

**Features:**
- Ripple effect for clicks
- Pulse animation for active states
- Shake animation for errors
- Bounce animation for success
- Haptic feedback utility
- Form validation feedback

**Usage:**
```tsx
import { 
  Pulse, 
  Shake, 
  Bounce, 
  SuccessPulse,
  triggerHaptic,
  ValidationFeedback 
} from '@/components/ui/VisualFeedback';

// Pulse effect
<Pulse isActive={isActive}>
  <div>Content</div>
</Pulse>

// Shake on error
<Shake trigger={hasError}>
  <div>Content</div>
</Shake>

// Bounce on success
<Bounce trigger={isSuccess}>
  <div>Content</div>
</Bounce>

// Haptic feedback
triggerHaptic('light');  // 10ms
triggerHaptic('medium'); // 20ms
triggerHaptic('heavy');  // 30ms

// Form validation
<ValidationFeedback isValid={isValid} isInvalid={isInvalid}>
  <input />
</ValidationFeedback>
```

## Design Principles

### 1. Immediate Feedback (<100ms)
All user interactions should provide visual feedback within 100ms:
- Button press animations
- Hover states
- Focus indicators

### 2. Loading States (>500ms)
Actions taking longer than 500ms should show loading indicators:
- Skeleton screens
- Loading spinners
- Progress indicators

### 3. Celebratory Animations
Significant achievements should be celebrated:
- Task completion: Confetti + checkmark
- Day completion: Celebration modal
- Streak milestones: Fire animation
- Achievement unlocks: Badge animation

### 4. Haptic Feedback
Mobile interactions should include haptic feedback:
- Button presses: 10ms light vibration
- Task completion: 30ms heavy vibration
- Errors: 20ms medium vibration

### 5. Reduced Motion Support
All animations should respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Performance Considerations

### 1. Animation Performance
- Use CSS transforms (translate, scale, rotate) instead of position properties
- Use `will-change` sparingly and only when needed
- Prefer `opacity` and `transform` for animations
- Use `requestAnimationFrame` for JavaScript animations

### 2. Confetti Optimization
- Limit particle count to 200
- Set `recycle={false}` to prevent continuous rendering
- Auto-dismiss after 3 seconds
- Only render when visible

### 3. Loading State Optimization
- Delay showing loading states by 500ms
- Enforce minimum duration of 300ms to prevent flash
- Use skeleton screens instead of spinners when possible
- Lazy load heavy components

## Accessibility

### 1. Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are visible
- Tab order is logical

### 2. Screen Readers
- Loading states announce to screen readers
- Success/error messages are announced
- Animations don't interfere with screen reader navigation

### 3. Reduced Motion
- Respect `prefers-reduced-motion` setting
- Provide alternative feedback for users who disable animations
- Ensure functionality works without animations

## Testing

### Manual Testing Checklist
- [ ] Button press animations work on all variants
- [ ] Haptic feedback works on mobile devices
- [ ] Task completion animation shows confetti
- [ ] Toast notifications appear and dismiss correctly
- [ ] Loading states show after 500ms delay
- [ ] Skeleton screens animate smoothly
- [ ] Visual feedback components work as expected
- [ ] Reduced motion is respected

### Automated Testing
```tsx
// Example test
describe('Button micro-interactions', () => {
  it('should show press animation on click', async () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    // Check for brightness class
    expect(button).toHaveClass('brightness-90');
  });
  
  it('should trigger haptic feedback on mobile', async () => {
    const vibrateSpy = jest.spyOn(navigator, 'vibrate');
    render(<Button>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });
});
```

## Demo Page

Visit `/demo/micro-interactions` to see all micro-interactions in action.

## Future Enhancements

1. **Sound Effects**: Add optional sound effects for interactions
2. **Custom Animations**: Allow custom animation configurations
3. **Animation Presets**: Provide preset animation combinations
4. **Performance Monitoring**: Track animation performance metrics
5. **A/B Testing**: Test different animation styles for conversion optimization
