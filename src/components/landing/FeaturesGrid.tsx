'use client';

import { motion } from 'framer-motion';
import { Bot, Code2, Gamepad2, Languages, Sparkles, Trophy } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff4bc1]/10 to-[#ffd34f]/10 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-[#ff4bc1]/20 to-[#ffd34f]/20 p-4">
          {icon}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>

        {/* Description */}
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>

      {/* Decorative corner */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#ff4bc1]/20 to-[#ffd34f]/20 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}

interface FeaturesGridProps {
  locale?: 'ru' | 'en';
}

export function FeaturesGrid({ locale = 'ru' }: FeaturesGridProps) {
  const content = {
    ru: {
      title: 'Всё для успешного обучения',
      subtitle: 'Современные инструменты и методики для эффективного освоения программирования',
      features: [
        {
          icon: <Bot className="h-8 w-8 text-[#ff4bc1]" />,
          title: 'AI-ассистент',
          description: 'Персональный помощник проверяет код, даёт подсказки и объясняет сложные темы 24/7',
        },
        {
          icon: <Languages className="h-8 w-8 text-[#ffd34f]" />,
          title: '7 языков программирования',
          description: 'Python, JavaScript, TypeScript, Java, C++, C#, Go — выбери свой путь',
        },
        {
          icon: <Gamepad2 className="h-8 w-8 text-[#ff4bc1]" />,
          title: 'Геймификация',
          description: 'Достижения, стрики и прогресс делают обучение увлекательным и мотивирующим',
        },
        {
          icon: <Code2 className="h-8 w-8 text-[#ffd34f]" />,
          title: 'Практика с первого дня',
          description: 'Реальные задачи и проекты для портфолио, а не просто теория',
        },
        {
          icon: <Trophy className="h-8 w-8 text-[#ff4bc1]" />,
          title: 'Система достижений',
          description: '21 достижение за прогресс, стрики и выполнение сложных задач',
        },
        {
          icon: <Sparkles className="h-8 w-8 text-[#ffd34f]" />,
          title: 'Адаптивное обучение',
          description: 'Программа подстраивается под твой темп и уровень знаний',
        },
      ],
    },
    en: {
      title: 'Everything for successful learning',
      subtitle: 'Modern tools and methods for effective programming mastery',
      features: [
        {
          icon: <Bot className="h-8 w-8 text-[#ff4bc1]" />,
          title: 'AI Assistant',
          description: 'Personal helper checks code, gives hints and explains complex topics 24/7',
        },
        {
          icon: <Languages className="h-8 w-8 text-[#ffd34f]" />,
          title: '7 Programming Languages',
          description: 'Python, JavaScript, TypeScript, Java, C++, C#, Go — choose your path',
        },
        {
          icon: <Gamepad2 className="h-8 w-8 text-[#ff4bc1]" />,
          title: 'Gamification',
          description: 'Achievements, streaks and progress make learning engaging and motivating',
        },
        {
          icon: <Code2 className="h-8 w-8 text-[#ffd34f]" />,
          title: 'Practice from day one',
          description: 'Real tasks and projects for portfolio, not just theory',
        },
        {
          icon: <Trophy className="h-8 w-8 text-[#ff4bc1]" />,
          title: 'Achievement System',
          description: '21 achievements for progress, streaks and completing challenging tasks',
        },
        {
          icon: <Sparkles className="h-8 w-8 text-[#ffd34f]" />,
          title: 'Adaptive Learning',
          description: 'Program adapts to your pace and knowledge level',
        },
      ],
    },
  };

  const t = content[locale];

  return (
    <section className="relative py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">{t.title}</h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70 md:text-xl">{t.subtitle}</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
