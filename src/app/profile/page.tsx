'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { TelegramSettings } from '@/components/profile/TelegramSettings';
import { GroupsPanel } from '@/components/profile/GroupsPanel';
import { AchievementsPanel } from '@/components/achievements/AchievementsPanel';
import { StatisticsPanel } from '@/components/statistics/StatisticsPanel';
import { AnalyticsPanel } from '@/components/statistics/AnalyticsPanel';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';

export default function ProfilePage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-4 sm:py-8 md:gap-10 md:px-8 md:py-12 lg:px-14">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white/95 sm:text-4xl">
              <AnimatedGradientText className="px-1">Профиль</AnimatedGradientText>
            </h1>
            <p className="mt-2 text-sm text-white/75 sm:text-base">
              Управляй данными, подключай Telegram-бота, отслеживай достижения и аналитику.
            </p>
          </div>
          <nav aria-label="Навигация профиля" className="flex gap-2">
            <Link href="/analytics">
              <Button variant="primary" size="md" aria-label="Перейти к аналитике">
                📊 Аналитика
              </Button>
            </Link>
            <Link href="/learn">
              <Button variant="secondary" size="md" className="border-white/15 text-white/90" aria-label="Вернуться к обучению">
                ← К обучению
              </Button>
            </Link>
          </nav>
        </header>

        <section aria-label="Информация профиля">
          <ProfileCard />
        </section>
        <section aria-label="Настройки Telegram">
          <TelegramSettings />
        </section>
        <section aria-label="Мои группы">
          <GroupsPanel />
        </section>
        <section aria-label="Достижения">
          <AchievementsPanel />
        </section>
        <section aria-label="Статистика">
          <StatisticsPanel />
        </section>
        <section aria-label="Аналитика">
          <AnalyticsPanel />
        </section>
      </div>
    </main>
  );
}

