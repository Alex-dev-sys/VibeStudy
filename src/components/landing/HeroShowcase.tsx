 'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

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

const orbs = [
  { className: 'left-[-10%] top-[-20%] h-[420px] w-[420px] bg-accent/30', delay: 0 },
  { className: 'right-[-18%] top-[15%] h-[480px] w-[480px] bg-accent-soft/25', delay: 0.4 },
  { className: 'left-[35%] bottom-[-25%] h-[520px] w-[520px] bg-blue-500/20', delay: 0.8 }
];

export function HeroShowcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#040208] via-[#090422] to-[#070115] text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(97,87,255,0.22),_transparent_55%)]" />
      <div className="absolute inset-0 -z-10">
        {orbs.map((orb) => (
          <motion.div
            key={orb.className}
            className={`absolute rounded-full blur-3xl ${orb.className}`}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-20 sm:px-8 lg:flex-row lg:items-center lg:gap-20 lg:py-28">
        <div className="flex-1 space-y-8">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 shadow-[0_10px_30px_rgba(88,70,255,0.24)] backdrop-blur"
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
            Твой прорыв в&nbsp;
            <span className="bg-gradient-to-r from-accent via-blue-400 to-accent-soft bg-clip-text text-transparent">
              карьеру разработчика
            </span>
            &nbsp;за 90 дней.
          </motion.h1>

          <motion.p
            className="max-w-xl text-base text-white/70 sm:text-lg"
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
              <Button
                variant="secondary"
                size="lg"
                className="w-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition sm:w-auto"
              >
                Попробовать Playground
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur xl:max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/50 px-5 py-3 shadow-[0_12px_30px_rgba(68,50,255,0.18)]"
              >
                <div className="text-2xl font-semibold text-accent sm:text-3xl">{item.value}</div>
                <p className="max-w-[160px] text-xs text-white/60 sm:text-sm">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <motion.div
            className="absolute inset-0 -z-10 rounded-[36px] border border-white/10 bg-white/5/40 backdrop-blur-xl"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-[36px] border border-white/10 bg-black/60 p-8 shadow-[0_35px_90px_rgba(45,35,122,0.45)] backdrop-blur-lg"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(98,86,255,0.35),_transparent_70%)]"
              animate={{ opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />

            <div className="space-y-5">
              {featureCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  className="relative flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
                  animate={{ y: [0, index % 2 === 0 ? -12 : 12, 0] }}
                  transition={{ duration: 8 + index, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30 text-xl">
                    {card.icon}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-white">{card.title}</p>
                    <p className="text-white/65">{card.description}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                className="rounded-3xl border border-white/10 bg-black/40 p-5 text-sm text-white/70"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                «Команда VibeStudy помогла мне построить персональный план, а AI-помощник моментально объяснял сложные
                темы. Через 90 дней я прошёл собеседование и получил оффер.»
                <span className="mt-3 block text-xs text-white/40">— Влад, выпускник 2025 года</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
