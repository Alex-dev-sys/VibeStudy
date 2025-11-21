# Task 4: Component Hierarchy

## Component Tree

```
SimplifiedDayCard
├── LoadingState (when loading)
├── EmptyState (when no content)
│   ├── Illustration (BookOpen icon)
│   ├── Heading (Day X: Topic)
│   ├── Description (benefit-focused)
│   ├── Primary CTA Button
│   └── Metadata (time, tasks)
└── ContentState (when content exists)
    ├── Header Card
    │   ├── Day Title + Badge
    │   ├── Description
    │   ├── Language Badge
    │   └── ProgressIndicator
    │       ├── Completed/Total Text
    │       └── Animated Progress Bar
    ├── Theory Section (Collapsible)
    │   ├── Section Header (with icon)
    │   ├── Chevron Icon
    │   └── TheoryBlock (when expanded)
    ├── RecapQuestionCard (if applicable)
    ├── Recap Task Card (if applicable)
    │   └── TaskList (single recap task)
    ├── Tasks Section (Collapsible)
    │   ├── Section Header (with icon)
    │   ├── Chevron Icon
    │   └── TaskList (when expanded)
    └── Complete Day CTA (when all tasks done)
        ├── Success Icon
        ├── Celebration Message
        └── Complete Button
```

## State Machine

```
┌─────────────────┐
│   Initial Load  │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │Loading?│
    └───┬────┘
        │
    ┌───┴───┐
    │  Yes  │──────► LoadingState
    └───┬───┘
        │
    ┌───┴───┐
    │   No  │
    └───┬───┘
        │
        ▼
  ┌──────────┐
  │ Pending? │
  └────┬─────┘
       │
   ┌───┴───┐
   │  Yes  │──────► EmptyState
   └───┬───┘
       │
   ┌───┴───┐
   │   No  │──────► ContentState
   └───────┘
```

## Progressive Disclosure Pattern

### Default State (Cognitive Load: 5-7 items)
1. Header with day info
2. Progress indicator
3. Theory section header (collapsed or expanded)
4. Tasks section header (collapsed)
5. Complete day CTA (if ready)

### Theory Expanded (Cognitive Load: 6-8 items)
- Theory section header
- Theory content (formatted text)
- Tasks section header (collapsed)
- Other elements remain

### Tasks Expanded (Cognitive Load: 6-8 items)
- Theory section header (collapsed)
- Tasks section header
- Task list (titles only, expand on click)
- Other elements remain

## Key Features

### EmptyState
- **Single Focus**: One primary action
- **Clear Value**: Benefit-oriented messaging
- **Minimal Elements**: 5 total items
- **Visual Hierarchy**: Icon → Title → Description → CTA → Metadata

### ContentState
- **Progressive Disclosure**: Collapsible sections
- **Visual Feedback**: Animated transitions
- **Clear Progress**: Always visible indicator
- **Celebration**: Success state when complete
- **Responsive**: Mobile and desktop optimized

### ProgressIndicator
- **Clear Metrics**: X/Y format
- **Visual Progress**: Animated bar
- **Color Coding**: Green gradient for success
- **Smooth Animation**: 0.5s ease-out transition

## Design Principles Applied

1. **Miller's Law (7±2)**: Limited visible elements
2. **Progressive Disclosure**: Information revealed as needed
3. **Single Responsibility**: Each component has one job
4. **Visual Hierarchy**: Clear importance levels
5. **Feedback**: Immediate visual responses
6. **Accessibility**: Semantic HTML, ARIA labels

## Comparison: Old vs New

### Old DayCard
- 15+ visible elements at once
- All information shown simultaneously
- Complex conditional rendering
- Multiple CTAs competing for attention
- Cognitive overload

### New SimplifiedDayCard
- 5-7 visible elements at once
- Progressive disclosure of information
- Clear state machine (3 states)
- Single primary action per state
- Reduced cognitive load

## Performance

- **Code Splitting**: Components lazy-loaded
- **Animation**: GPU-accelerated transforms
- **Re-renders**: Optimized with useMemo
- **Bundle Size**: Minimal increase (~2KB)

## Accessibility

- **Keyboard Navigation**: All interactive elements
- **Screen Readers**: Proper ARIA labels
- **Focus Management**: Clear focus indicators
- **Reduced Motion**: Respects prefers-reduced-motion
- **Color Contrast**: WCAG AA compliant
