'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { TelegramSettings } from '@/components/profile/TelegramSettings';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { ReferralWidget } from '@/components/referral/ReferralWidget';
import { AchievementsPanel } from '@/components/achievements/AchievementsPanel';
import { StatisticsPanel } from '@/components/statistics/StatisticsPanel';
import { AnalyticsPanel } from '@/components/statistics/AnalyticsPanel';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';


export default function ProfilePage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      {/* Backgrounds removed to show global cosmic theme */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Профиль
              </span>
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Управляйте своим прогрессом и настройками аккаунта
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/analytics">
              <Button variant="secondary" size="sm" className="h-9 border-white/10 bg-white/5 text-xs hover:bg-white/10">
                📊 Аналитика
              </Button>
            </Link>
            <Link href="/learn">
              <Button variant="primary" size="sm" className="h-9 text-xs">
                Продолжить обучение
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Profile & Settings */}
          <div className="space-y-6 lg:col-span-4 xl:col-span-3">
            <section aria-label="Информация профиля">
              <ProfileCard />
            </section>
            <section aria-label="Настройки Telegram">
              <TelegramSettings />
            </section>
            <section aria-label="Реферальная программа">
              <ReferralWidget />
            </section>
            <section aria-label="Настройки">
              <SettingsSection />
            </section>
          </div>

          {/* Right Column: Stats & Achievements */}
          <div className="space-y-6 lg:col-span-8 xl:col-span-9">
            <section aria-label="Статистика">
              <StatisticsPanel />
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section aria-label="Достижения">
                <AchievementsPanel />
              </section>
              <section aria-label="Аналитика">
                <AnalyticsPanel />
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

