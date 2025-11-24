'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDictionary } from '@/lib/i18n/dictionaries';

export function BenefitsSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { benefits } = getDictionary('ru');

  return (
    <section className="relative py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {benefits.title} <span className="text-gradient">VibeStudy</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {benefits.subtitle}
          </p>
        </motion.div>

        {/* Benefits grid with progressive disclosure */}
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.items.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full text-left p-6 rounded-2xl bg-white/5 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-2xl">
                    {benefit.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {benefit.title}
                      </h3>
                      {benefit.details && (
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-white/60 transition-transform duration-300',
                            expandedIndex === index && 'rotate-180'
                          )}
                        />
                      )}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {benefit.description}
                    </p>

                    {/* Expanded details */}
                    {benefit.details && expandedIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 pt-3"
                      >
                        <p className="text-white/60 text-sm">
                          {benefit.details}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
