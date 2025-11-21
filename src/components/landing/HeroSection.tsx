'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthFlow } from '@/components/auth/AuthFlow';
import Link from 'next/link';

export function HeroSection() {
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center mobile-padding py-12 md:py-20">
      {/* Simplified background - single gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c]" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Clear value proposition */}
        <motion.h1 
          className="text-responsive-3xl mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Стань разработчиком
          <span className="block text-gradient mt-2 md:mt-3">за 90 дней</span>
        </motion.h1>
        
        <motion.p 
          className="text-responsive-base text-white/80 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Персональный AI-наставник, ежедневная практика и готовое портфолио. 
          Начни бесплатно прямо сейчас.
        </motion.p>
        
        {/* Single primary CTA */}
        {!showAuthFlow ? (
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowAuthFlow(true)}
              className="w-full sm:w-auto text-base md:text-lg touch-target-recommended"
            >
              Начать обучение бесплатно
            </Button>
            
            {/* Secondary CTA - less prominent */}
            <Link href="/playground" className="w-full sm:w-auto">
              <Button 
                variant="ghost" 
                size="lg"
                className="w-full text-sm md:text-base touch-target"
              >
                Посмотреть как это работает →
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto px-4"
          >
            <AuthFlow trigger="landing" />
          </motion.div>
        )}
        
        {/* Trust indicators */}
        <motion.div 
          className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-white/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-green-400">✓</span> Без кредитной карты
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-green-400">✓</span> 7 языков программирования
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-green-400">✓</span> 1000+ выпускников
          </span>
        </motion.div>
      </div>
    </section>
  );
}
