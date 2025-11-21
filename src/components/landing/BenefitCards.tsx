'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BenefitCard {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

const benefits: BenefitCard[] = [
  {
    icon: '🎯',
    title: 'Персональный план обучения',
    description: 'AI адаптирует сложность заданий под твой уровень и темп обучения. Каждый день — новая тема с теорией и практикой.'
  },
  {
    icon: '🤖',
    title: 'AI-наставник 24/7',
    description: 'Проверка кода, подсказки и объяснения в реальном времени. Получай фидбек мгновенно, как от опытного ментора.'
  },
  {
    icon: '📊',
    title: 'Отслеживание прогресса',
    description: 'Детальная аналитика твоих успехов, слабых мест и рекомендации по улучшению. Видь свой рост каждый день.'
  },
  {
    icon: '🏆',
    title: 'Система достижений',
    description: 'Зарабатывай награды за выполнение заданий, поддержание стриков и достижение целей. Геймификация делает обучение увлекательным.'
  },
  {
    icon: '💼',
    title: 'Портфолио проектов',
    description: 'Собирай реальные кейсы для резюме. К концу курса у тебя будет портфолио, которое впечатлит работодателей.'
  },
  {
    icon: '🌍',
    title: '7 языков программирования',
    description: 'Python, JavaScript, TypeScript, Java, C++, C#, Go — выбери свой путь или изучи несколько языков параллельно.',
    action: {
      label: 'Начать обучение',
      href: '/login'
    }
  }
];

export function BenefitCards() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Почему выбирают <span className="text-gradient">VibeStudy</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-white/70 sm:text-lg">
            Современная платформа для изучения программирования с AI-поддержкой и персональным подходом
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel-enhanced group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent-soft/20 text-3xl">
                {benefit.icon}
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-white">
                {benefit.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-white/70">
                {benefit.description}
              </p>

              {/* Optional action */}
              {benefit.action && (
                <Link href={benefit.action.href}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2 w-full"
                  >
                    {benefit.action.label}
                  </Button>
                </Link>
              )}

              {/* Hover effect */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/0 to-accent-soft/0 opacity-0 transition-opacity duration-300 group-hover:from-accent/10 group-hover:to-accent-soft/5 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
