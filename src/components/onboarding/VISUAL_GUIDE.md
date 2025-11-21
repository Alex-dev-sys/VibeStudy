# Interactive Onboarding - Visual Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Onboarding Flow                          │
└─────────────────────────────────────────────────────────────┘

User enters /learn page (first time)
         ↓
   Wait 1.5 seconds
         ↓
   Check hasCompletedOnboarding
         ↓
    ┌────┴────┐
    │  false  │ → Start onboarding
    └─────────┘
         ↓
   Resume from lastStepCompleted
         ↓
   Show InteractiveOnboarding
```

## Component Structure

```
InteractiveOnboarding
├── Backdrop Overlay (blur + semi-transparent)
├── Spotlight (highlights target element)
└── Tooltip (positioned near target)
    ├── Header (title + skip button)
    ├── Description
    ├── Progress Dots
    ├── Navigation Buttons
    └── Keyboard Hints
```

## Visual Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ████████████████████████████████████████████████████████   │
│  █                                                      █   │
│  █  Backdrop Overlay (black/70 + backdrop-blur)        █   │
│  █                                                      █   │
│  █    ┌─────────────────────────────┐                  █   │
│  █    │                             │                  █   │
│  █    │  ╔═══════════════════════╗  │  ← Spotlight    █   │
│  █    │  ║  Target Element      ║  │     (pink ring) █   │
│  █    │  ║  [Start Day Button]  ║  │                  █   │
│  █    │  ╚═══════════════════════╝  │                  █   │
│  █    └─────────────────────────────┘                  █   │
│  █              ↓                                       █   │
│  █    ┌─────────────────────────────┐                  █   │
│  █    │  Tooltip                 [X]│                  █   │
│  █    │  ─────────────────────────  │                  █   │
│  █    │  Начни свой день            │                  █   │
│  █    │                             │                  █   │
│  █    │  Нажми "Начать день"...     │                  █   │
│  █    │                             │                  █   │
│  █    │  ● ○ ○  (progress dots)     │                  █   │
│  █    │                             │                  █   │
│  █    │  [← Назад]  1/3  [Далее →] │                  █   │
│  █    │                             │                  █   │
│  █    │  ← → Navigation  Esc Skip   │                  █   │
│  █    └─────────────────────────────┘                  █   │
│  █                                                      █   │
│  ████████████████████████████████████████████████████████   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Step Flow

```
Step 1: Start Day
┌─────────────────────────────────────┐
│  Target: [data-onboarding="start-day"]
│  Position: bottom
│  Title: "Начни свой день"
│  Description: "Нажми 'Начать день'..."
└─────────────────────────────────────┘
         ↓ (Next)
         
Step 2: Complete Tasks
┌─────────────────────────────────────┐
│  Target: [data-onboarding="task-list"]
│  Position: right
│  Title: "Выполняй задания"
│  Description: "Кликни на задание..."
└─────────────────────────────────────┘
         ↓ (Next)
         
Step 3: Finish Day
┌─────────────────────────────────────┐
│  Target: [data-onboarding="complete-day"]
│  Position: top
│  Title: "Завершай дни"
│  Description: "После выполнения..."
└─────────────────────────────────────┘
         ↓ (Complete)
         
✓ Onboarding Complete
```

## Tooltip Positioning Logic

```
Target Element Position
         ↓
    ┌────┴────┐
    │ Element │
    └─────────┘

Position: 'top'
    ┌─────────┐
    │ Tooltip │
    └────┬────┘
         ↓
    ┌────┴────┐
    │ Element │
    └─────────┘

Position: 'bottom'
    ┌─────────┐
    │ Element │
    └────┬────┘
         ↓
    ┌────┴────┐
    │ Tooltip │
    └─────────┘

Position: 'left'
┌─────────┐    ┌─────────┐
│ Tooltip │ ←→ │ Element │
└─────────┘    └─────────┘

Position: 'right'
┌─────────┐    ┌─────────┐
│ Element │ ←→ │ Tooltip │
└─────────┘    └─────────┘

Position: 'center'
    ┌─────────────┐
    │             │
    │  ┌───────┐  │
    │  │Tooltip│  │
    │  └───────┘  │
    │             │
    └─────────────┘
```

## Progress Dots States

```
Step 1 Active:
● ○ ○  (filled, empty, empty)

Step 2 Active:
● ● ○  (filled, filled, empty)

Step 3 Active:
● ● ●  (filled, filled, filled)

Colors:
● Active: rgb(255, 0, 148) - Primary pink
● Completed: rgba(255, 0, 148, 0.5) - 50% opacity
○ Upcoming: rgba(255, 255, 255, 0.2) - 20% white
```

## Spotlight Effect

```css
/* Box shadow creates cutout effect */
box-shadow: 
  0 0 0 9999px rgba(0, 0, 0, 0.7),  /* Large shadow covers screen */
  0 0 0 4px rgb(255, 0, 148);        /* Pink ring around element */

/* Result: */
████████████████████████████████
████████████████████████████████
████╔═══════════════════╗████████  ← Pink ring (4px)
████║                   ║████████
████║  Target Element   ║████████  ← Clear area
████║                   ║████████
████╚═══════════════════╝████████
████████████████████████████████
████████████████████████████████
     ↑ Dark overlay (70% black)
```

## State Management

```
useOnboardingStore
├── isActive: boolean
│   └── Controls visibility of overlay
├── currentStep: number
│   └── Index of current step (0-2)
├── steps: OnboardingStep[]
│   └── Array of step configurations
├── hasCompletedOnboarding: boolean
│   └── Persisted to localStorage
└── lastStepCompleted: number
    └── For resume functionality

Actions:
├── startOnboarding() → Set isActive=true, resume from last step
├── nextStep() → Increment step, save progress
├── previousStep() → Decrement step
├── skipOnboarding() → Set completed=true, hide overlay
├── completeOnboarding() → Set completed=true, save final step
└── resetOnboarding() → Clear all state
```

## Keyboard Navigation

```
┌─────────────────────────────────────┐
│  Key         Action                 │
├─────────────────────────────────────┤
│  →           Next step               │
│  Enter       Next step / Complete    │
│  ←           Previous step           │
│  Esc         Skip onboarding         │
└─────────────────────────────────────┘
```

## Animation Timeline

```
Onboarding Start
    ↓
Backdrop: opacity 0 → 1 (300ms)
    ↓
Spotlight: opacity 0 → 1 (300ms)
    ↓
Tooltip: scale 0.9 → 1, opacity 0 → 1 (300ms)
    ↓
Progress Dots: scale 0.8 → 1 (300ms)

Step Change
    ↓
Tooltip: scale 1 → 0.9 → 1 (300ms)
    ↓
Progress Dots: animate color + scale (300ms)
    ↓
Spotlight: reposition (instant)

Onboarding End
    ↓
All elements: opacity 1 → 0 (300ms)
    ↓
Remove from DOM
```

## Responsive Behavior

```
Desktop (≥768px)
├── Tooltip: max-width 384px
├── Positioning: All directions supported
└── Keyboard hints: Visible

Mobile (<768px)
├── Tooltip: max-width 90vw
├── Positioning: Prefer top/bottom
└── Keyboard hints: Hidden
```

## Integration Points

```
Learning Page (/learn)
├── DayCard
│   └── data-onboarding="start-day"
├── TaskList
│   └── data-onboarding="task-list"
└── CompleteButton
    └── data-onboarding="complete-day"

Settings Page (/profile)
└── ReplayTutorial Button
    └── onClick={resetOnboarding}
```

## Color Palette

```
Background Gradient:
from-[#1a0b2e] → to-[#16213e]

Border:
border-white/20 (20% opacity)

Text:
- Primary: text-white
- Secondary: text-white/70
- Tertiary: text-white/40

Accent:
- Primary: rgb(255, 0, 148) - Pink
- Hover: hover:bg-white/10

Backdrop:
bg-black/70 backdrop-blur-sm
```

## Z-Index Hierarchy

```
10000 - Tooltip (highest)
9999  - Spotlight
9998  - Backdrop overlay
...   - Regular content
```

## Performance Optimizations

```
✓ GPU-accelerated animations (transform, opacity)
✓ Debounced scroll/resize listeners
✓ Cleanup on unmount
✓ Conditional rendering (only when active)
✓ Memoized position calculations
✓ Lazy component loading
```

## Accessibility Features

```
✓ ARIA labels on interactive elements
✓ Keyboard navigation support
✓ Focus management
✓ Screen reader announcements
✓ High contrast support
✓ Reduced motion support (prefers-reduced-motion)
```

## Testing Scenarios

```
1. First-time user
   → Auto-starts after 1.5s
   → Shows step 1

2. Returning user (incomplete)
   → Resumes from last step
   → Shows progress

3. Completed user
   → No auto-start
   → Can replay from settings

4. Skip during tutorial
   → Marks as completed
   → Doesn't show again

5. Navigate away mid-tutorial
   → Saves progress
   → Resumes on return
```
