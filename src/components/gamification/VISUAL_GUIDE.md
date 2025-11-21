# Gamification Components - Visual Guide

## Component Previews

### 1. LevelProgressBar

```
┌─────────────────────────────────────────────────────────┐
│  Твой уровень                        Следующий          │
│  Практик                             Специалист         │
│                                                          │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  150 / 500 XP              5 / 10 дней до следующего    │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                    ⚡                                     │
│                   1250                                   │
│                 Всего XP                                 │
└─────────────────────────────────────────────────────────┘
```

**Visual Features:**
- Purple-to-pink gradient progress bar
- Animated fill on mount
- Glowing border effect
- Responsive layout

---

### 2. StreakIndicator

**Normal State:**
```
┌──────────────────┐
│  🔥              │
│  15              │
│  Дней подряд     │
└──────────────────┘
```

**At-Risk State (Pulsing):**
```
┌──────────────────┐
│  🔥 (rotating)   │
│  15              │
│  Не теряй серию! │
└──────────────────┘
```

**Visual Features:**
- Animated fire emoji
- Pulsing border when at risk
- Orange warning colors
- Compact design for navigation

---

### 3. DayCompletionModal

```
┌─────────────────────────────────────────────────────────┐
│                    [Confetti Animation]                  │
│                                                          │
│                         🎉                               │
│                                                          │
│                  День 15 завершён!                       │
│            Отличная работа, продолжай в том же духе      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │    ⚡    │  │    🔥    │  │    📈    │              │
│  │   +50    │  │    15    │  │  15/90   │              │
│  │XP заработ│  │Дней подря│  │ Прогресс │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  Новые достижения разблокированы!                        │
│  ┌─────────────────────────────────────────────┐        │
│  │ 🔥🔥  Неделя без перерыва                   │        │
│  │       Учитесь 7 дней подряд                 │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  Следующая цель                                          │
│  Завершить 30 дней (Месяц упорства)                     │
│                                                          │
│  [        Продолжить обучение        ]                  │
└─────────────────────────────────────────────────────────┘
```

**Visual Features:**
- Full-screen confetti (300 pieces)
- Animated celebration emoji
- Three gradient stat cards
- Achievement cards with flip animation
- Smooth modal transitions

---

### 4. AchievementUnlockAnimation

```
┌─────────────────────────────────────────────────────────┐
│                  [Backdrop Blur]                         │
│                                                          │
│              [Particle Burst Effect]                     │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │         [Shine Effect Sweeping]             │        │
│  │                                             │        │
│  │              🏆 (Flipping 360°)             │        │
│  │                                             │        │
│  │      ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО!             │        │
│  │                                             │        │
│  │           Первый шаг                        │        │
│  │    Завершите первый день обучения           │        │
│  │                                             │        │
│  │          [  Продолжить  ]                   │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Visual Features:**
- Badge flip animation (360° rotation)
- 12 particles bursting outward
- Repeating shine effect
- Backdrop blur
- Yellow-orange gradient card

---

## Color Palette

### Level Progress
- **Gradient**: `#a855f7` → `#ec4899` (Purple to Pink)
- **Background**: `rgba(168, 85, 247, 0.1)` → `rgba(236, 72, 153, 0.1)`
- **Border**: `rgba(168, 85, 247, 0.3)`

### Stat Cards
- **XP Card**: Yellow-Orange gradient
  - `rgba(234, 179, 8, 0.2)` → `rgba(249, 115, 22, 0.2)`
- **Streak Card**: Red-Pink gradient
  - `rgba(239, 68, 68, 0.2)` → `rgba(236, 72, 153, 0.2)`
- **Progress Card**: Green-Emerald gradient
  - `rgba(34, 197, 94, 0.2)` → `rgba(16, 185, 129, 0.2)`

### Achievement
- **Gradient**: `rgba(234, 179, 8, 0.1)` → `rgba(249, 115, 22, 0.1)`
- **Border**: `rgba(234, 179, 8, 0.4)`

---

## Animation Timings

### LevelProgressBar
- Progress fill: `0.5s ease-out`
- Initial mount: `0s delay`

### StreakIndicator
- Pulse (at-risk): `2s infinite`
- Rotation (at-risk): `1.5s infinite`

### DayCompletionModal
- Confetti: `4s duration`
- Celebration emoji: `0.5s scale animation`
- Stat cards: `0.2s, 0.3s, 0.4s staggered delays`
- Achievement cards: `0.1s stagger per item`
- Modal entrance: Spring animation (stiffness: 300, damping: 30)

### AchievementUnlockAnimation
- Badge flip: `1.2s ease-in-out`
- Particle burst: `1s ease-out`
- Shine effect: `1.5s infinite (2s delay)`
- Modal entrance: Spring animation (stiffness: 200, damping: 20)

---

## Responsive Behavior

### Desktop (≥768px)
- LevelProgressBar: Full width with side-by-side layout
- StreakIndicator: Horizontal layout in navigation
- DayCompletionModal: 3-column stat grid
- AchievementUnlockAnimation: Centered with max-width

### Mobile (<768px)
- LevelProgressBar: Stacked layout
- StreakIndicator: Compact version
- DayCompletionModal: Single column stat grid
- AchievementUnlockAnimation: Full-width with padding

---

## Interaction States

### Hover
- Cards: Slight scale increase (`scale: 1.02`)
- Buttons: Background opacity increase
- Achievement cards: Scale to `1.05`

### Active/Pressed
- Buttons: Scale to `0.98`
- Cards: Scale to `0.99`

### Focus
- All interactive elements: Visible focus ring
- Keyboard navigation: Tab order follows visual order

---

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Escape**: Close modals
- **Enter/Space**: Activate buttons

### Screen Readers
- Semantic HTML structure
- ARIA labels on close buttons
- Descriptive text for stats
- Achievement descriptions read aloud

### Reduced Motion
- Future enhancement: Respect `prefers-reduced-motion`
- Will disable confetti and complex animations
- Keep essential feedback animations

---

## Usage Examples

### Example 1: Profile Page
```tsx
import { LevelProgressBar, StreakIndicator } from '@/components/gamification';

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LevelProgressBar />
        <div className="flex items-center justify-center">
          <StreakIndicator />
        </div>
      </div>
      {/* Other profile content */}
    </div>
  );
}
```

### Example 2: Day Completion Flow
```tsx
import { useState } from 'react';
import { DayCompletionModal } from '@/components/gamification';
import { useProgressStore } from '@/store/progress-store';

export function DayCard({ day }) {
  const [showModal, setShowModal] = useState(false);
  const markDayComplete = useProgressStore(state => state.markDayComplete);
  
  const handleComplete = () => {
    markDayComplete(day);
    setShowModal(true);
  };
  
  return (
    <>
      <button onClick={handleComplete}>
        Завершить день
      </button>
      
      <DayCompletionModal
        day={day}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
```

### Example 3: Achievement System
```tsx
import { useEffect, useState } from 'react';
import { AchievementUnlockAnimation } from '@/components/gamification';
import { useAchievementsStore } from '@/store/achievements-store';

export function AchievementListener() {
  const [achievement, setAchievement] = useState(null);
  
  useEffect(() => {
    const checkAchievements = () => {
      const newAchievements = useAchievementsStore
        .getState()
        .checkAndUnlockAchievements();
      
      if (newAchievements.length > 0) {
        setAchievement(newAchievements[0]);
      }
    };
    
    // Check on mount and when relevant state changes
    checkAchievements();
  }, []);
  
  return (
    <AchievementUnlockAnimation
      achievement={achievement}
      onComplete={() => setAchievement(null)}
    />
  );
}
```

---

## Performance Tips

1. **Confetti**: Auto-stops after 4 seconds
2. **Animations**: Use CSS transforms for GPU acceleration
3. **Lazy Loading**: Only render when needed
4. **Memoization**: Prevent unnecessary re-renders
5. **Event Listeners**: Clean up on unmount

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Demo

Visit `/demo/gamification` to see all components in action with interactive examples.
