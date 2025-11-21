# Interactive Onboarding System

A simplified 3-step interactive onboarding system with spotlight highlighting and contextual tooltips.

## Features

### ✅ Core Requirements (Task 10)

1. **InteractiveOnboarding Component** - Main component with spotlight and tooltips
2. **3-Step Tutorial** - Simplified flow: start day → complete tasks → finish day
3. **Skip Button** - Always visible for user control
4. **Backdrop Blur Overlay** - Semi-transparent overlay with blur effect
5. **Spotlight Positioning** - Dynamic positioning based on target elements
6. **Progress Dots** - Visual indicators showing current step
7. **Save Progress** - Onboarding state persisted to localStorage for resume

### 🎯 Additional Features

- **Keyboard Navigation** - Arrow keys, Enter, and Esc support
- **Smooth Animations** - Framer Motion animations for all transitions
- **Responsive Tooltips** - Auto-positioning based on available space
- **Scroll Into View** - Target elements automatically scrolled into view
- **Accessibility** - ARIA labels and keyboard support

## Components

### InteractiveOnboarding

Main onboarding component that renders the spotlight and tooltip overlay.

```tsx
import { InteractiveOnboarding } from '@/components/onboarding/InteractiveOnboarding';

// Wrap your app or page
<InteractiveOnboarding />
```

### OnboardingProvider

Provider component that manages onboarding lifecycle and auto-starts in learning context.

```tsx
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';

<OnboardingProvider context="learning">
  {children}
</OnboardingProvider>
```

## Usage

### 1. Add Data Attributes to Target Elements

Mark elements you want to highlight with `data-onboarding` attributes:

```tsx
<Button data-onboarding="start-day">
  Начать день
</Button>

<div data-onboarding="task-list">
  {/* Task list content */}
</div>

<Button data-onboarding="complete-day">
  Завершить день
</Button>
```

### 2. Configure Steps

Edit `src/lib/onboarding/steps.ts` to customize the tutorial steps:

```typescript
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'start-day',
    title: 'Начни свой день',
    description: 'Нажми "Начать день", чтобы получить персональные задания от AI.',
    targetElement: '[data-onboarding="start-day"]',
    position: 'bottom'
  },
  // ... more steps
];
```

### 3. Control Onboarding Programmatically

Use the `useOnboardingStore` hook to control onboarding:

```tsx
import { useOnboardingStore } from '@/store/onboarding-store';

function MyComponent() {
  const { 
    startOnboarding, 
    skipOnboarding, 
    resetOnboarding,
    hasCompletedOnboarding 
  } = useOnboardingStore();

  return (
    <div>
      {!hasCompletedOnboarding && (
        <Button onClick={startOnboarding}>
          Start Tutorial
        </Button>
      )}
      <Button onClick={resetOnboarding}>
        Reset Tutorial
      </Button>
    </div>
  );
}
```

## Store API

### State

- `isActive: boolean` - Whether onboarding is currently active
- `currentStep: number` - Current step index (0-based)
- `steps: OnboardingStep[]` - Array of onboarding steps
- `hasCompletedOnboarding: boolean` - Whether user has completed onboarding
- `lastStepCompleted: number` - Last completed step for resume functionality

### Actions

- `startOnboarding()` - Start or resume onboarding
- `nextStep()` - Move to next step
- `previousStep()` - Move to previous step
- `skipOnboarding()` - Skip and mark as completed
- `completeOnboarding()` - Complete onboarding
- `resetOnboarding()` - Reset to initial state
- `setSteps(steps)` - Set custom steps

## Keyboard Shortcuts

- `→` or `Enter` - Next step
- `←` - Previous step
- `Esc` - Skip onboarding

## Positioning

The tooltip automatically positions itself based on the `position` property:

- `top` - Above the target element
- `bottom` - Below the target element
- `left` - Left of the target element
- `right` - Right of the target element
- `center` - Centered on screen (no spotlight)

## Styling

The component uses Tailwind CSS and follows the VibeStudy design system:

- Background: Gradient from `#1a0b2e` to `#16213e`
- Border: `border-white/20`
- Spotlight: Pink ring (`rgb(255, 0, 148)`)
- Backdrop: `bg-black/70 backdrop-blur-sm`

## Demo

Visit `/demo/onboarding` to see the interactive onboarding system in action.

## Requirements Mapping

This implementation satisfies all requirements from task 10:

| Requirement | Implementation |
|-------------|----------------|
| 15.1 - 3-step tutorial | ✅ Simplified to 3 steps in `steps.ts` |
| 15.2 - Skip button | ✅ Always visible in top-right corner |
| 15.3 - Tooltips and highlights | ✅ Spotlight + tooltip system |
| 15.4 - Save progress | ✅ `lastStepCompleted` in localStorage |
| 15.5 - Replay option | ✅ `resetOnboarding()` in settings |

## Best Practices

1. **Keep it short** - 3-5 steps maximum
2. **Target essential features** - Only highlight critical UI elements
3. **Clear descriptions** - Use simple, action-oriented language
4. **Test positioning** - Ensure tooltips don't overflow viewport
5. **Provide escape** - Always allow users to skip

## Migration from Old System

The new system replaces `OnboardingTour.tsx` with a simplified approach:

**Before (8 steps):**
- Welcome, language selection, day navigation, tasks, code editor, achievements, statistics, playground

**After (3 steps):**
- Start day, complete tasks, finish day

This reduces cognitive load and focuses on the core user journey.
