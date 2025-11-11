'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { TelegramSettings } from '@/components/profile/TelegramSettings';
import { AchievementsPanel } from '@/components/achievements/AchievementsPanel';
import { StatisticsPanel } from '@/components/statistics/StatisticsPanel';
import { AnalyticsPanel } from '@/components/statistics/AnalyticsPanel';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-4 sm:py-8 md:gap-10 md:px-8 md:py-12 lg:px-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white/95 sm:text-4xl">
              <AnimatedGradientText className="px-1">Профиль</AnimatedGradientText>
            </h1>
            <p className="mt-2 text-sm text-white/75 sm:text-base">
              Управляй данными, подключай Telegram-бота, отслеживай достижения и аналитику.
            </p>
          </div>
          <Link href="/learn">
            <Button variant="secondary" size="md" className="border-white/15 text-white/90">
              ← Вернуться к обучению
            </Button>
          </Link>
        </div>

        <ProfileCard />
        <TelegramSettings />
        <AchievementsPanel />
        <StatisticsPanel />
        <AnalyticsPanel />
      </div>
    </main>
  );
}

