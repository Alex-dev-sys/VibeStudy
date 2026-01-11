/**
 * Lazy-loaded component definitions for code splitting
 * This file centralizes all dynamic imports for better bundle optimization
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading fallback components
function LoadingFallback() {
  return <Skeleton className="w-full h-64" />;
}

function CardLoadingFallback() {
  return <Skeleton className="w-full h-32 rounded-xl" />;
}

function ModalLoadingFallback() {
  return <Skeleton className="w-full h-96 rounded-2xl" />;
}

// Dashboard Components (Heavy - lazy load)
export const LazyLearningDashboard = dynamic(
  () => import('@/components/dashboard/LearningDashboard'),
  {
    ssr: false,
    loading: LoadingFallback
  }
);

export const LazyDayTimeline = dynamic(
  () => import('@/components/dashboard/DayTimeline').then(mod => ({ default: mod.DayTimeline })),
  {
    ssr: false,
    loading: CardLoadingFallback
  }
);

export const LazyContentState = dynamic(
  () => import('@/components/dashboard/ContentState').then(mod => ({ default: mod.ContentState })),
  {
    ssr: false,
    loading: LoadingFallback
  }
);

// Monaco Editor (Very Heavy - lazy load)
export const LazyMonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => {
      return <Skeleton className="w-full h-[400px] rounded-xl" />;
    }
  }
);

// Gamification Components (Below fold - lazy load)
export const LazyLevelProgressBar = dynamic(
  () => import('@/components/gamification/LevelProgressBar').then(mod => ({ default: mod.LevelProgressBar })),
  {
    ssr: false,
    loading: CardLoadingFallback
  }
);

export const LazyDayCompletionModal = dynamic(
  () => import('@/components/gamification/DayCompletionModal').then(mod => ({ default: mod.DayCompletionModal })),
  {
    ssr: false,
    loading: ModalLoadingFallback
  }
);

export const LazyAchievementUnlockAnimation = dynamic(
  () => import('@/components/gamification/AchievementUnlockAnimation').then(mod => ({ default: mod.AchievementUnlockAnimation })),
  {
    ssr: false
  }
);

// Analytics Components (Heavy charts - lazy load)
export const LazyAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
  {
    ssr: false,
    loading: LoadingFallback
  }
);

export const LazyActivityCalendar = dynamic(
  () => import('@/components/statistics/ActivityCalendar').then(mod => ({ default: mod.ActivityCalendar })),
  {
    ssr: false,
    loading: CardLoadingFallback
  }
);

export const LazyProgressChart = dynamic(
  () => import('@/components/statistics/ProgressChart').then(mod => ({ default: mod.ProgressChart })),
  {
    ssr: false,
    loading: CardLoadingFallback
  }
);

// Profile Components (Below fold - lazy load)
export const LazySettingsSection = dynamic(
  () => import('@/components/profile/SettingsSection').then(mod => ({ default: mod.SettingsSection })),
  {
    ssr: false,
    loading: CardLoadingFallback
  }
);

// Onboarding (Conditional - lazy load)
export const LazyInteractiveOnboarding = dynamic(
  () => import('@/components/onboarding/InteractiveOnboarding').then(mod => ({ default: mod.InteractiveOnboarding })),
  {
    ssr: false
  }
);

// Confetti Animation (Conditional - lazy load)
export const LazyConfetti = dynamic(
  () => import('react-confetti'),
  {
    ssr: false
  }
);
