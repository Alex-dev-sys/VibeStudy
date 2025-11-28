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
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { BentoCard } from '@/components/ui/bento-card';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <GradientBackdrop className="opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/learn">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white pl-0 hover:bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
              </Link>
            </div>
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
              <Button variant="secondary" size="sm" className="h-9 border-white/10 bg-white/5 text-xs hover:bg-white/10 border">
                📊 Аналитика
              </Button>
            </Link>
            <Link href="/learn">
              <Button variant="primary" size="sm" className="h-9 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-0">
                Продолжить обучение
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Profile & Settings */}
          <div className="space-y-6 lg:col-span-4 xl:col-span-3">
            <section aria-label="Информация профиля">
              <BentoCard glowColor="blue" className="p-0 overflow-hidden">
                <div className="-m-6">
                  <ProfileCard />
                </div>
              </BentoCard>
            </section>
            <section aria-label="Настройки Telegram">
              <BentoCard glowColor="blue" className="p-0 overflow-hidden">
                <div className="-m-6">
                  <TelegramSettings />
                </div>
              </BentoCard>
            </section>
            <section aria-label="Реферальная программа">
              <BentoCard glowColor="green" className="p-0 overflow-hidden">
                <div className="-m-6">
                  <ReferralWidget />
                </div>
              </BentoCard>
            </section>
            <section aria-label="Настройки">
              <BentoCard glowColor="none" className="p-0 overflow-hidden">
                <div className="-m-6">
                  <SettingsSection />
                </div>
              </BentoCard>
            </section>
          </div>

          {/* Right Column: Stats & Achievements */}
          <div className="space-y-6 lg:col-span-8 xl:col-span-9">
            <section aria-label="Статистика">
              <BentoCard glowColor="purple" className="p-0 overflow-hidden">
                <div className="-m-6">
                  <StatisticsPanel />
                </div>
              </BentoCard>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section aria-label="Достижения">
                <BentoCard glowColor="yellow" className="p-0 overflow-hidden h-full">
                  <div className="-m-6 h-full">
                    <AchievementsPanel />
                  </div>
                </BentoCard>
              </section>
              <section aria-label="Аналитика">
                <BentoCard glowColor="pink" className="p-0 overflow-hidden h-full">
                  <div className="-m-6 h-full">
                    <AnalyticsPanel />
                  </div>
                </BentoCard>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

