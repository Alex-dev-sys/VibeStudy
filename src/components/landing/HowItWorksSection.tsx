'use client';

import { motion } from 'framer-motion';
import { BookOpen, Code, Trophy } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Изучай теорию',
    description: 'Каждый день получай новую тему с понятными объяснениями и примерами кода'
  },
  {
    number: '02',
    icon: Code,
    title: 'Решай задачи',
    description: 'Практикуйся на реальных задачах с проверкой от AI-наставника и мгновенным фидбеком'
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Получай результат',
    description: 'Собирай портфолио, зарабатывай достижения и становись junior разработчиком'
  }
];

export function HowItWorksSection() {
  return (
    <section className="relative py-20 bg-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Как это работает
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Простой и эффективный путь к карьере разработчика
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="text-center">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary mb-6 relative z-10">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
