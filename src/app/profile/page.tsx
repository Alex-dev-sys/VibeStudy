'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { TelegramSettings } from '@/components/profile/TelegramSettings';
import { AchievementsPanel } from '@/components/achievements/AchievementsPanel';
import { StatisticsPanel } from '@/components/statistics/StatisticsPanel';
import { AnalyticsPanel } from '@/components/statistics/AnalyticsPanel';

export default function ProfilePage() {
  return (
    <main className="relative flex min-h-screen flex-col gap-4 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8 md:gap-8 md:px-8 md:py-10 lg:px-14">
      <div className="absolute inset-0 -z-10 bg-gradient-accent opacity-60" aria-hidden />
      
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Профиль</h1>
          <Link href="/learn">
            <Button variant="secondary" size="md">
              ← Вернуться к обучению
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <ProfileCard />

        {/* Telegram Settings */}
        <TelegramSettings />

        {/* Achievements */}
        <AchievementsPanel />

        {/* Statistics */}
        <StatisticsPanel />

        {/* Analytics */}
        <AnalyticsPanel />
      </div>
    </main>
  );
}

