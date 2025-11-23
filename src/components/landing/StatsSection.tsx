'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Calendar, Code2, Trophy, Users } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

function StatItem({ icon, value, label, suffix = '', delay = 0 }: StatItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000; // 2 seconds
      const increment = end / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
    >
      <div className="rounded-full bg-gradient-to-br from-[#ff4bc1]/20 to-[#ffd34f]/20 p-4">
        {icon}
      </div>
      <div className="text-center">
        <div className="mb-2 text-4xl font-bold md:text-5xl">
          <span className="bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] bg-clip-text text-transparent">
            {count}
            {suffix}
          </span>
        </div>
        <div className="text-sm text-white/70 md:text-base">{label}</div>
      </div>
    </motion.div>
  );
}

interface StatsSectionProps {
  locale?: 'ru' | 'en';
}

export function StatsSection({ locale = 'ru' }: StatsSectionProps) {
  const content = {
    ru: {
      title: 'Платформа в цифрах',
      subtitle: 'Присоединяйся к тысячам студентов, которые уже начали свой путь',
      stats: [
        {
          icon: <Calendar className="h-8 w-8 text-[#ff4bc1]" />,
          value: 90,
          label: 'Дней обучения',
          suffix: '',
        },
        {
          icon: <Code2 className="h-8 w-8 text-[#ffd34f]" />,
          value: 7,
          label: 'Языков программирования',
          suffix: '',
        },
        {
          icon: <Trophy className="h-8 w-8 text-[#ff4bc1]" />,
          value: 21,
          label: 'Достижений',
          suffix: '',
        },
        {
          icon: <Users className="h-8 w-8 text-[#ffd34f]" />,
          value: 1000,
          label: 'Активных студентов',
          suffix: '+',
        },
      ],
    },
    en: {
      title: 'Platform in numbers',
      subtitle: 'Join thousands of students who have already started their journey',
      stats: [
        {
          icon: <Calendar className="h-8 w-8 text-[#ff4bc1]" />,
          value: 90,
          label: 'Days of learning',
          suffix: '',
        },
        {
          icon: <Code2 className="h-8 w-8 text-[#ffd34f]" />,
          value: 7,
          label: 'Programming languages',
          suffix: '',
        },
        {
          icon: <Trophy className="h-8 w-8 text-[#ff4bc1]" />,
          value: 21,
          label: 'Achievements',
          suffix: '',
        },
        {
          icon: <Users className="h-8 w-8 text-[#ffd34f]" />,
          value: 1000,
          label: 'Active students',
          suffix: '+',
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
          <p className="text-lg text-white/70 md:text-xl">{t.subtitle}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
