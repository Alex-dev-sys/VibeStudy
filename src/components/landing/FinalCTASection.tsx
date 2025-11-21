'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthFlow } from '@/components/auth/AuthFlow';
import { Sparkles } from 'lucide-react';

export function FinalCTASection() {
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  return (
    <section className="relative py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-primary/20 to-accent/20 border border-white/20 p-8 md:p-12"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.1),_transparent_50%)]" />
          
          <div className="relative z-10 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            
            {/* Heading */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Начни свой путь в IT сегодня
            </h2>
            
            {/* Description */}
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Присоединяйся к 1000+ студентов, которые уже меняют свою жизнь. 
              Первый день — бесплатно, без регистрации.
            </p>
            
            {/* CTA */}
            {!showAuthFlow ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => setShowAuthFlow(true)}
                  className="text-lg px-10 py-5 shadow-2xl shadow-accent/50"
                >
                  Начать обучение бесплатно
                </Button>
                
                {/* Trust indicator */}
                <p className="mt-4 text-sm text-white/60">
                  ✓ Без кредитной карты • ✓ Отмена в любой момент
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <AuthFlow trigger="landing" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
