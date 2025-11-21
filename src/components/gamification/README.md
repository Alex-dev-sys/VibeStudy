# Gamification Enhancement System

This directory contains the gamification components for the VibeStudy platform, implementing a comprehensive level system, streak tracking, achievement celebrations, and day completion rewards.

## Components

### 1. LevelProgressBar

Displays the user's current level, XP progress, and advancement toward the next level.

**Features:**
- 9 level tiers (Новичок → Легенда)
- Visual progress bar with gradient animation
- XP tracking (50 XP per completed day)
- Level-based progression (10 days per level)
- Total XP display

**Usage:**
```tsx
import { LevelProgressBar } from '@/components/gamification';

<LevelProgressBar />
```

**Level System:**
- 0-10 days: Новичок (Beginner)
- 11-20 days: Ученик (Student)
- 21-30 days: Практик (Practitioner)
- 31-40 days: Специалист (Specialist)
- 41-50 days: Эксперт (Expert)
- 51-60 days: Мастер (Master)
- 61-70 days: Профи (Professional)
- 71-80 days: Гуру (Guru)
- 81-90 days: Легенда (Legend)

### 2. StreakIndicator

Shows the current learning streak with visual warnings when at risk.

**Features:**
- Animated fire emoji
- Streak counter
- At-risk warning (pulsing animation)
- Responsive design

**Usage:**
```tsx
import { StreakIndicator } from '@/components/gamification';

<StreakIndicator />
```

**Integration Points:**
- Navigation header (desktop)
- Profile page
- Dashboard

### 3. DayCompletionModal

Celebration modal shown when a user completes all tasks for a day.

**Features:**
- Confetti animation (300 pieces, 4 seconds)
- Animated celebration emoji
- Three stat cards (XP, Streak, Progress)
- New achievement notifications with flip animation
- Next milestone display
- Smooth entrance/exit animations

**Usage:**
```tsx
import { DayCompletionModal } from '@/components/gamification';

const [showModal, setShowModal] = useState(false);

<DayCompletionModal
  day={15}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
/>
```

**Trigger Conditions:**
- All tasks for the day are completed
- User clicks "Завершить день" button

### 4. AchievementUnlockAnimation

Full-screen animation for achievement unlocks with badge flip effect.

**Features:**
- Badge flip animation (360° rotation)
- Particle burst effect (12 particles)
- Shine effect (repeating)
- Backdrop blur
- Smooth spring animations

**Usage:**
```tsx
import { AchievementUnlockAnimation } from '@/components/gamification';

const [achievement, setAchievement] = useState<Achievement | null>(null);

<AchievementUnlockAnimation
  achievement={achievement}
  onComplete={() => setAchievement(null)}
/>
```

**Trigger Conditions:**
- Achievement requirements met
- Checked via `useAchievementsStore.checkAndUnlockAchievements()`

## Integration Guide

### Step 1: Add to Navigation

Add the StreakIndicator to your navigation component:

```tsx
// src/components/layout/Navigation.tsx
import { StreakIndicator } from '@/components/gamification';

export function Navigation() {
  return (
    <nav>
      {/* Other nav items */}
      <StreakIndicator />
    </nav>
  );
}
```

### Step 2: Add to Profile/Dashboard

Display level progress on the user's profile or dashboard:

```tsx
// src/app/profile/page.tsx
import { LevelProgressBar } from '@/components/gamification';

export default function ProfilePage() {
  return (
    <div>
      <LevelProgressBar />
      {/* Other profile content */}
    </div>
  );
}
```

### Step 3: Integrate Day Completion

Show the completion modal when all tasks are done:

```tsx
// src/components/dashboard/DayCard.tsx
import { useState } from 'react';
import { DayCompletionModal } from '@/components/gamification';
import { useProgressStore } from '@/store/progress-store';

export function DayCard({ day }) {
  const [showCompletion, setShowCompletion] = useState(false);
  const markDayComplete = useProgressStore(state => state.markDayComplete);
  
  const handleCompleteDay = () => {
    markDayComplete(day);
    setShowCompletion(true);
  };
  
  return (
    <>
      <button onClick={handleCompleteDay}>
        Завершить день
      </button>
      
      <DayCompletionModal
        day={day}
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
      />
    </>
  );
}
```

### Step 4: Handle Achievement Unlocks

Listen for achievement unlocks and show animations:

```tsx
// src/components/achievements/AchievementListener.tsx
import { useEffect, useState } from 'react';
import { AchievementUnlockAnimation } from '@/components/gamification';
import { useAchievementsStore } from '@/store/achievements-store';

export function AchievementListener() {
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const unlockedAchievements = useAchievementsStore(
    state => state.unlockedAchievements
  );
  
  useEffect(() => {
    // Check for newly unlocked achievements
    const newAchievements = useAchievementsStore
      .getState()
      .checkAndUnlockAchievements();
    
    if (newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
    }
  }, [unlockedAchievements]);
  
  return (
    <AchievementUnlockAnimation
      achievement={currentAchievement}
      onComplete={() => setCurrentAchievement(null)}
    />
  );
}
```

## Design Specifications

### Colors

- **Level Progress**: Purple to Pink gradient (`from-purple-500 to-pink-500`)
- **XP Card**: Yellow to Orange gradient (`from-yellow-500/20 to-orange-500/20`)
- **Streak Card**: Red to Pink gradient (`from-red-500/20 to-pink-500/20`)
- **Progress Card**: Green to Emerald gradient (`from-green-500/20 to-emerald-500/20`)
- **Achievement**: Yellow to Orange gradient (`from-yellow-500/10 to-orange-500/10`)

### Animations

- **Confetti**: 300 pieces, 4-second duration, gravity 0.3
- **Badge Flip**: 360° rotation over 1.2 seconds
- **Particle Burst**: 12 particles radiating outward
- **Progress Bar**: 0.5-second fill animation
- **Modal Entrance**: Spring animation (stiffness: 300, damping: 30)

### Typography

- **Modal Title**: 3xl (text-3xl)
- **Level Name**: 2xl (text-2xl)
- **Stat Values**: 2xl (text-2xl)
- **Achievement Title**: 2xl (text-2xl)
- **Body Text**: Base (text-base)
- **Small Text**: xs (text-xs)

### Spacing

- **Card Padding**: 6 (p-6)
- **Modal Padding**: 8 (p-8)
- **Section Gaps**: 6 (gap-6)
- **Grid Gaps**: 4 (gap-4)

## Performance Considerations

1. **Confetti**: Auto-stops after 4 seconds to prevent performance issues
2. **Animations**: Uses CSS transforms for GPU acceleration
3. **Modal**: Locks body scroll when open
4. **Lazy Loading**: Components only render when needed

## Accessibility

- **Keyboard Navigation**: All modals close on Escape key
- **Focus Management**: Modal traps focus when open
- **ARIA Labels**: Close buttons have aria-label
- **Reduced Motion**: Respects prefers-reduced-motion (future enhancement)

## Testing

Visit the demo page to test all components:

```
http://localhost:3000/demo/gamification
```

## Dependencies

- `framer-motion`: Animations
- `react-confetti`: Confetti effect
- `@/store/progress-store`: Progress data
- `@/store/achievements-store`: Achievement data
- `@/lib/achievements`: Achievement definitions
- `@/components/ui/Modal`: Modal wrapper
- `@/components/ui/Card`: Card component
- `@/components/ui/Button`: Button component

## Future Enhancements

1. **Sound Effects**: Add audio feedback for achievements
2. **Haptic Feedback**: Vibration on mobile devices
3. **Leaderboards**: Compare progress with other users
4. **Custom Badges**: User-designed achievement icons
5. **Streak Recovery**: Allow users to maintain streaks with "freeze" items
6. **Level Rewards**: Unlock features at specific levels
7. **Social Sharing**: Share achievements on social media
8. **Reduced Motion**: Full support for accessibility preferences
