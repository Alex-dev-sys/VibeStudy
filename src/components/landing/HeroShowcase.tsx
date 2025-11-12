 'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagicCard } from '@/components/ui/magic-card';

const stats = [
  { value: '90', label: 'дней обучения' },
  { value: '450+', label: 'AI-практик' },
  { value: '24/7', label: 'поддержка наставников' }
];

const featureCards = [
  {
    icon: '🤖',
    title: 'ИИ-рефери',
    description: 'Проверяем код, генерируем подсказки и объяснения теории на лету.'
  },
  {
    icon: '🧠',
    title: 'Адаптивный план',
    description: 'Сложность уроков растёт вместе с твоим прогрессом и целями.'
  },
  {
    icon: '🚀',
    title: 'Профессиональные кейсы',
    description: 'Собери портфолио из реальных задач и подготовься к собеседованиям.'
  }
];

export function HeroShowcase() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden text-white">

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-20 sm:px-8 lg:flex-row lg:items-center lg:gap-20 lg:py-28">
        <div className="flex-1 space-y-8">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10/60 px-5 py-2 text-sm text-white/80 shadow-[0_18px_40px_rgba(12,6,28,0.35)] backdrop-blur-xl"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-lg">🌌</span>
            <span>AI наставник + адаптивный курс = твой старт в IT</span>
          </motion.div>

          <motion.h1
            className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.6 }}
          >
            Твой прорыв в{' '}
            <AnimatedGradientText className="px-2">
              карьеру разработчика
            </AnimatedGradientText>
            {' '}за 90 дней.
          </motion.h1>

          <motion.p
            className="max-w-xl text-base text-white/80 sm:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            VibeStudy — это ежедневный ритм: теория, практика, код-ревью от ИИ и наставников, телеграм-напоминания и
            персональная аналитика прогресса. Начни обучение сегодня и выйди на уровень junior с готовым портфолио.
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="group relative w-full overflow-hidden px-8 py-4 text-base font-semibold transition-all sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Начать обучение
                  <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 -z-10 bg-[conic-gradient(from_120deg_at_50%_50%,rgba(130,110,255,0.8),rgba(69,174,255,0.7),rgba(130,110,255,0.8))] opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </Link>
            <Link href="/playground">
              <Button variant="secondary" size="lg" className="w-full px-8 py-4 text-base font-semibold sm:w-auto">
                Попробовать Playground
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="grid gap-4 xl:max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            {stats.map((item) => (
              <MagicCard key={item.label} className="rounded-[24px] p-[1.5px]" innerClassName="flex items-center justify-between rounded-[22px] px-5 py-3">
                <div className="text-2xl font-semibold text-accent sm:text-3xl">{item.value}</div>
                <p className="max-w-[160px] text-xs text-white/60 sm:text-sm">{item.label}</p>
              </MagicCard>
            ))}
          </motion.div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <motion.div
            className="absolute inset-0 -z-10 rounded-[36px] bg-[rgba(255,255,255,0.18)] backdrop-blur-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_70%)]" />
          </motion.div>
            <motion.div
            className="relative w-full max-w-lg rounded-[36px] border border-white/12 bg-[rgba(12,6,28,0.82)] p-8 shadow-[0_40px_110px_rgba(8,3,20,0.65)] backdrop-blur-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="space-y-5">
              {featureCards.map((card, index) => (
                <MagicCard key={card.title} className="p-[2px]" innerClassName="relative flex items-start gap-4 rounded-[28px] p-5">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl shadow-[0_12px_30px_rgba(12,6,28,0.4)]"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: index * 0.2 }}
                  >
                    {card.icon}
                  </motion.div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gradient font-semibold">{card.title}</p>
                    <p className="text-white/75">{card.description}</p>
                  </div>
                </MagicCard>
              ))}

              <motion.div
                className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.2)] p-5 text-sm text-white/80"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              >
                «Команда VibeStudy помогла мне построить персональный план, а AI-наставник моментально объяснял сложные
                темы. Через 90 дней я прошёл собеседование и получил оффер.»
                <span className="mt-3 block text-xs text-white/50">— Влад, выпускник 2025 года</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
