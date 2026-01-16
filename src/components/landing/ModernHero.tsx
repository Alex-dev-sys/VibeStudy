'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GuestModeManager } from '@/lib/auth/guest-mode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      badge: 'Начни свой путь в программировании',
      title: 'Стань разработчиком за',
      titleHighlight: '90 дней',
      subtitle: 'Структурированное обучение с AI-ассистентом, геймификацией и поддержкой 7 языков программирования',
      cta: 'Начать бесплатно',
      ctaSecondary: 'Узнать больше',
    },
    en: {
      badge: 'Start your programming journey',
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
      {/* Static gradient background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 40%, rgba(255, 75, 193, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 211, 79, 0.1) 0%, transparent 50%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Badge variant="outline" className="px-6 py-3 text-sm bg-background/50 backdrop-blur-xl border-primary/30 text-foreground gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            {t.badge}
          </Badge>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
        >
          {t.title}
          <br />
          <span className="bg-gradient-to-r from-primary via-[hsl(340,90%,65%)] to-accent bg-clip-text text-transparent">
            {t.titleHighlight}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 text-lg text-muted-foreground md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
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
          <Button
            variant="gradient"
            size="xl"
            onClick={handleStart}
            className="group"
          >
            {t.cta}
            <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t.ctaSecondary}
          </Button>
        </motion.div>

        {/* Static decorative dots */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute h-1.5 w-1.5 rounded-full bg-primary/30" style={{ left: '20%', top: '30%' }} />
          <div className="absolute h-1 w-1 rounded-full bg-primary/20" style={{ left: '40%', top: '70%' }} />
          <div className="absolute h-2 w-2 rounded-full bg-primary/25" style={{ left: '60%', top: '20%' }} />
          <div className="absolute h-1.5 w-1.5 rounded-full bg-primary/30" style={{ left: '80%', top: '60%' }} />
          <div className="absolute h-1 w-1 rounded-full bg-primary/20" style={{ left: '10%', top: '80%' }} />
        </div>
      </div>
    </section>
  );
}

