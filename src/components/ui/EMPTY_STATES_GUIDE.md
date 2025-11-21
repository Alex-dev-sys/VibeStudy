# Empty States Guide

## Overview

Empty states are crucial UX elements that guide users when no content is available. This guide documents the empty state system implemented across the VibeStudy platform.

## Design Principles

Following UX requirements 6.1-6.5, all empty states adhere to these principles:

1. **Clear Visual Hierarchy**: Illustration → Heading → Description → CTA
2. **Encouraging Language**: Action-oriented, positive messaging
3. **Single Primary Action**: One prominent CTA, optional secondary action
4. **Contextual Help**: Helpful hints when appropriate
5. **Visual Consistency**: Unified design across all empty states

## Generic EmptyState Component

Located at: `src/components/ui/EmptyState.tsx`

### Props

```typescript
interface EmptyStateProps {
  icon?: LucideIcon | string;        // Icon component or emoji
  title: string;                      // Main heading
  description: string;                // Description (max 2 sentences)
  action?: {                          // Primary action
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {                 // Optional secondary action
    label: string;
    onClick: () => void;
  };
  helpText?: string;                  // Contextual help
  metadata?: ReactNode;               // Additional info below CTA
  illustration?: ReactNode;           // Custom illustration
  size?: 'sm' | 'md' | 'lg';         // Size variant
  dashed?: boolean;                   // Dashed border style
}
```

### Usage Example

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen } from 'lucide-react';

<EmptyState
  icon={BookOpen}
  title="No content yet"
  description="Start learning to see your progress here."
  action={{
    label: 'Start Learning',
    onClick: () => router.push('/learn')
  }}
  helpText="Your first achievement unlocks after day 1"
  metadata={
    <div className="flex gap-4">
      <span>🏆 21 achievements</span>
      <span>•</span>
      <span>🎯 4 categories</span>
    </div>
  }
  size="md"
/>
```

## Specialized Empty States

### 1. Day Content Empty State

**Location**: `src/components/dashboard/EmptyState.tsx`

**When shown**: Day card without generated content

**Features**:
- Shows day number and topic
- Explains benefit of AI-generated content
- Displays estimated time and task count
- Single "Start Day" CTA

**Usage**:
```tsx
<EmptyState day={1} onStart={handleStartDay} />
```

### 2. Achievements Empty State

**Location**: `src/components/profile/EmptyAchievements.tsx`

**When shown**: No achievements unlocked yet

**Features**:
- Trophy icon
- Encouraging message about first achievements
- Link to start learning
- Shows total available achievements

**Usage**:
```tsx
<EmptyAchievements onStartLearning={() => router.push('/learn')} />
```

### 3. Statistics Empty State

**Location**: `src/components/profile/EmptyStatistics.tsx`

**When shown**: No learning data exists

**Features**:
- Bar chart icon
- Explains what statistics will show
- Highlights automatic tracking
- Lists available analytics features

**Usage**:
```tsx
<EmptyStatistics onStartLearning={() => router.push('/learn')} />
```

### 4. Playground Snippets Empty State

**Location**: `src/components/playground/EmptySnippets.tsx`

**When shown**: No saved code snippets

**Features**:
- Code icon
- Explains snippet functionality
- Smaller size (sm)
- No dashed border
- Shows storage benefits

**Usage**:
```tsx
<EmptySnippets onCreateSnippet={() => setIsSaveModalOpen(true)} />
```

### 5. Analytics Empty State

**Location**: `src/components/analytics/EmptyAnalytics.tsx`

**When shown**: No analytics data available

**Features**:
- Trending up icon
- Describes analytics features
- Lists visualization types
- Mentions personalized recommendations

**Usage**:
```tsx
<EmptyAnalytics onStartLearning={() => router.push('/learn')} />
```

## Implementation Checklist

When implementing empty states:

- [ ] Use encouraging, action-oriented language
- [ ] Provide clear visual illustration (icon or emoji)
- [ ] Include benefit-focused description (max 2 sentences)
- [ ] Add single prominent CTA
- [ ] Consider contextual help text
- [ ] Add relevant metadata if helpful
- [ ] Ensure CTA is visually distinct and centered
- [ ] Test on mobile and desktop
- [ ] Verify accessibility (keyboard navigation, screen readers)

## Language Guidelines

### ✅ Good Examples

- "Пока нет достижений" (Clear, neutral)
- "Начни обучение и выполняй задания" (Action-oriented)
- "Каждое достижение — это твой прогресс!" (Encouraging)
- "Сохраняй интересные фрагменты кода" (Benefit-focused)

### ❌ Avoid

- "Ошибка: нет данных" (Negative, technical)
- "Здесь ничего нет" (Unhelpful)
- "Вы должны начать обучение" (Demanding)
- "Пустая страница" (Obvious, not helpful)

## Accessibility

All empty states include:

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard-accessible CTAs
- Sufficient color contrast
- Screen reader friendly text
- Focus indicators on interactive elements

## Visual Design

### Colors

- Background: `rgba(255, 255, 255, 0.08)`
- Border: `border-white/15` (dashed or solid)
- Icon background: `from-accent/20 to-primary/20`
- Text primary: `text-white`
- Text secondary: `text-white/70`
- Help text: `text-white/50`

### Spacing

- Small: `py-8` (32px vertical padding)
- Medium: `py-12` (48px vertical padding)
- Large: `py-16` (64px vertical padding)

### Icon Sizes

- Small: 64px container, 32px icon
- Medium: 96px container, 48px icon
- Large: 128px container, 64px icon

## Testing

Test empty states for:

1. **Visual appearance**: Matches design system
2. **Responsiveness**: Works on all screen sizes
3. **Interactions**: CTAs work correctly
4. **Accessibility**: Keyboard and screen reader support
5. **Content**: Clear, encouraging language
6. **Context**: Appears at the right time

## Future Enhancements

Potential improvements:

- [ ] Animated illustrations
- [ ] Interactive tutorials in empty states
- [ ] Personalized messages based on user history
- [ ] A/B testing different messaging
- [ ] Localization for multiple languages
- [ ] Dark/light mode variants
