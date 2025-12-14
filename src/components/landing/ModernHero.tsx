'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GuestModeManager } from '@/lib/auth/guest-mode';

interface ModernHeroProps {
  locale?: 'ru' | 'en';
}

export function ModernHero({ locale = 'ru' }: ModernHeroProps) {
  const router = useRouter();

  const handleStart = () => {
    GuestModeManager.startAsGuest();
    router.push('/learn');
  };

  const content = {
    ru: {
      badge: '🚀 Начни свой путь в программировании',
      title: 'Стань разработчиком за',
      titleHighlight: '90 дней',
      subtitle: 'Структурированное обучение с AI-ассистентом, геймификацией и поддержкой 7 языков программирования',
      cta: 'Начать бесплатно',
      ctaSecondary: 'Узнать больше',
    },
    en: {
      badge: '🚀 Start your programming journey',
      title: 'Become a developer in',
      titleHighlight: '90 days',
      subtitle: 'Structured learning with AI assistant, gamification, and support for 7 programming languages',
      cta: 'Start for free',
      ctaSecondary: 'Learn more',
    },
  };

  const t = content[locale];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255, 75, 193, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255, 211, 79, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(255, 75, 193, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255, 75, 193, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-[#ffd34f]" />
          <span className="text-sm text-white/90">{t.badge}</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-5xl font-bold leading-tight md:text-7xl lg:text-8xl"
        >
          {t.title}
          <br />
          <span className="bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] bg-clip-text text-transparent">
            {t.titleHighlight}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 text-lg text-white/70 md:text-xl lg:text-2xl max-w-3xl mx-auto"
        >
          {t.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            aria-label={t.cta}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] px-8 py-4 font-semibold text-white shadow-lg shadow-[#ff4bc1]/50 transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.cta}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff4bc1]/80 to-[#ffd34f]/80 opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label={t.ctaSecondary}
            className="rounded-full border-2 border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
          >
            {t.ctaSecondary}
          </motion.button>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
