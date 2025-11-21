# Task 11: Empty States Visual Reference

## Component Hierarchy

```
EmptyState (Generic)
├── EmptyAchievements (Profile)
├── EmptyStatistics (Profile)
├── EmptySnippets (Playground)
├── EmptyAnalytics (Analytics)
└── EmptyState (Day Card) - Already existed
```

## Visual Structure

All empty states follow this consistent structure:

```
┌─────────────────────────────────────┐
│                                     │
│           [Illustration]            │
│        (Icon or Emoji)              │
│                                     │
│            [Heading]                │
│                                     │
│         [Description]               │
│      (Max 2 sentences)              │
│                                     │
│          💡 [Help Text]             │
│          (Optional)                 │
│                                     │
│      [Primary CTA Button]           │
│    [Secondary CTA] (Optional)       │
│                                     │
│          [Metadata]                 │
│         (Optional)                  │
│                                     │
└─────────────────────────────────────┘
```

## Size Variants

### Small (sm)
- Container padding: `py-8` (32px)
- Icon container: 64px × 64px
- Icon size: 32px × 32px
- Emoji size: `text-4xl`
- Title: `text-xl`
- Use case: Compact sections, cards

### Medium (md) - Default
- Container padding: `py-12` (48px)
- Icon container: 96px × 96px
- Icon size: 48px × 48px
- Emoji size: `text-6xl`
- Title: `text-2xl`
- Use case: Standard sections, most common

### Large (lg)
- Container padding: `py-16` (64px)
- Icon container: 128px × 128px
- Icon size: 64px × 64px
- Emoji size: `text-8xl`
- Title: `text-3xl`
- Use case: Full-page empty states

## Color Palette

### Background & Borders
```css
background: rgba(255, 255, 255, 0.08)
border: 1px dashed rgba(255, 255, 255, 0.15)
border-radius: 1rem (16px)
```

### Icon Container
```css
background: linear-gradient(
  to bottom right,
  rgba(255, 75, 200, 0.2),  /* accent/20 */
  rgba(255, 0, 148, 0.2)     /* primary/20 */
)
border-radius: 50%
```

### Text Colors
```css
title: rgba(255, 255, 255, 0.95)
description: rgba(255, 255, 255, 0.70)
help-text: rgba(255, 255, 255, 0.50)
metadata: rgba(255, 255, 255, 0.50)
```

## Component Examples

### 1. EmptyAchievements
```
┌─────────────────────────────────────┐
│                                     │
│              🏆                     │
│         (Trophy Icon)               │
│                                     │
│      Пока нет достижений            │
│                                     │
│  Начни обучение и выполняй задания, │
│  чтобы разблокировать первые        │
│  достижения. Каждое достижение —    │
│  это твой прогресс!                 │
│                                     │
│  💡 Первое достижение можно         │
│     получить уже после первого      │
│     дня обучения                    │
│                                     │
│      [Начать обучение]              │
│                                     │
│  🏆 21 достижение • 🎯 4 категории  │
│                                     │
└─────────────────────────────────────┘
```

### 2. EmptyStatistics
```
┌─────────────────────────────────────┐
│                                     │
│              📊                     │
│       (Bar Chart Icon)              │
│                                     │
│      Статистика пока пуста          │
│                                     │
│  Начни обучение, чтобы отслеживать  │
│  свой прогресс. Здесь будет         │
│  детальная аналитика твоих          │
│  достижений и активности.           │
│                                     │
│  💡 Статистика обновляется          │
│     автоматически после каждого     │
│     выполненного задания            │
│                                     │
│      [Начать первый день]           │
│                                     │
│  📊 Графики • 📈 Календарь • ⏱️ Время│
│                                     │
└─────────────────────────────────────┘
```

### 3. EmptySnippets (Small)
```
┌─────────────────────────────────────┐
│                                     │
│              💻                     │
│                                     │
│    Нет сохранённых сниппетов        │
│                                     │
│  Сохраняй интересные фрагменты      │
│  кода, чтобы вернуться к ним        │
│  позже. Создай свою коллекцию!      │
│                                     │
│  💡 Используй кнопку 'Сохранить     │
│     сниппет' в редакторе кода       │
│                                     │
│        [Написать код]               │
│                                     │
│  💾 Неограниченное • 📂 Все языки   │
│                                     │
└─────────────────────────────────────┘
```

### 4. EmptyAnalytics
```
┌─────────────────────────────────────┐
│                                     │
│              📈                     │
│      (Trending Up Icon)             │
│                                     │
│      Аналитика недоступна           │
│                                     │
│  Начни обучение, чтобы увидеть      │
│  детальную аналитику своего         │
│  прогресса. Отслеживай свои успехи  │
│  и находи области для улучшения.    │
│                                     │
│  💡 Аналитика включает графики      │
│     прогресса, календарь активности │
│     и рекомендации                  │
│                                     │
│      [Начать обучение]              │
│                                     │
│  📊 Визуализация • 🎯 Рекомендации  │
│  📈 Тренды обучения                 │
│                                     │
└─────────────────────────────────────┘
```

### 5. Day Card Empty State
```
┌─────────────────────────────────────┐
│                                     │
│              📖                     │
│         (Book Icon)                 │
│                                     │
│      День 1: Основы Python          │
│                                     │
│  Получи персональную теорию и       │
│  практические задания, подобранные  │
│  AI под твой уровень и цели.        │
│                                     │
│        [Начать день 1]              │
│                                     │
│  ⏱️ ~30 минут • 📝 3-5 заданий      │
│                                     │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Full-width CTAs
- Stacked buttons (primary above secondary)
- Reduced padding
- Smaller icon sizes

### Tablet (640px - 1024px)
- Maintain center alignment
- Comfortable spacing
- Side-by-side buttons if space allows

### Desktop (> 1024px)
- Maximum width constraints (max-w-md for description)
- Generous spacing
- Side-by-side buttons
- Full icon sizes

## Accessibility Features

### Keyboard Navigation
- All CTAs are keyboard accessible
- Tab order: Primary CTA → Secondary CTA
- Enter/Space to activate buttons
- Visible focus indicators

### Screen Readers
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive button labels
- Alt text for icons (via aria-label)

### Color Contrast
- All text meets WCAG AA standards
- Title: High contrast (white/95)
- Description: Medium contrast (white/70)
- Help text: Lower contrast but readable (white/50)

## Animation Guidelines

### Entrance
- Fade in: `opacity: 0 → 1`
- Slide up: `y: 20px → 0`
- Duration: 300ms
- Easing: ease-out

### Icon
- Subtle pulse on hover (optional)
- No continuous animations
- Respect `prefers-reduced-motion`

### CTA Hover
- Scale: `1 → 1.02`
- Brightness increase
- Smooth transition: 200ms

## Usage Guidelines

### When to Use

✅ **Use empty states when:**
- No data exists yet (new user)
- User cleared all data
- Feature requires setup
- Content is loading (with skeleton)
- Search returns no results

❌ **Don't use empty states for:**
- Error states (use error messages)
- Loading states (use skeletons)
- Temporary unavailability (use status messages)
- Permission denied (use permission prompts)

### Content Guidelines

**Title (Heading)**
- Keep it short (3-5 words)
- State the situation clearly
- Use neutral or positive tone
- Examples: "Пока нет достижений", "Статистика пока пуста"

**Description**
- Maximum 2 sentences
- Explain the benefit of taking action
- Use "you" language (implied in Russian)
- Focus on what user will gain

**Help Text**
- Optional, use when helpful
- Provide specific guidance
- Keep it concise (1 sentence)
- Prefix with 💡 emoji

**CTA Label**
- Action verb + object
- Clear and specific
- Examples: "Начать обучение", "Написать код", "Создать сниппет"

## Testing Checklist

- [ ] Visual appearance matches design
- [ ] Responsive on all screen sizes
- [ ] CTAs trigger correct actions
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] Text is clear and encouraging
- [ ] Icons display correctly
- [ ] Colors meet contrast requirements
- [ ] Animations respect reduced motion

## File Locations

```
src/components/
├── ui/
│   ├── EmptyState.tsx              # Generic component
│   └── EMPTY_STATES_GUIDE.md       # Full documentation
├── profile/
│   ├── EmptyAchievements.tsx       # Profile achievements
│   └── EmptyStatistics.tsx         # Profile statistics
├── playground/
│   └── EmptySnippets.tsx           # Playground snippets
├── analytics/
│   └── EmptyAnalytics.tsx          # Analytics page
└── dashboard/
    └── EmptyState.tsx              # Day card (existing)
```

## Demo Page

Interactive showcase available at: `/demo/empty-states`

Features:
- All size variants
- All specialized components
- Design guidelines
- Interactive examples
- Copy-paste code snippets
