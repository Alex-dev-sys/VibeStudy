'use client';

import { motion } from 'framer-motion';

const trustIndicators = [
  { icon: '⚡', value: '90', label: 'дней до результата' },
  { icon: '🎯', value: '450+', label: 'практических задач' },
  { icon: '🤖', label: 'AI-наставник 24/7' },
  { icon: '🏆', value: '1000+', label: 'выпускников' }
];

export function SocialProofBanner() {
  return (
    <section className="relative py-12 border-y border-white/10 bg-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {trustIndicators.map((indicator, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-3xl mb-2">{indicator.icon}</div>
              {indicator.value && (
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {indicator.value}
                </div>
              )}
              <div className="text-sm text-white/60">{indicator.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
