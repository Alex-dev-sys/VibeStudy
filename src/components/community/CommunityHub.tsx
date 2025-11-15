'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const sections = [
  {
    id: 'leaderboard',
    icon: '🏆',
    title: 'Лидерборд',
    description: 'Соревнуйтесь с другими студентами',
    href: '/community/leaderboard',
    available: false
  },
  {
    id: 'groups',
    icon: '👥',
    title: 'Группы',
    description: 'Учитесь вместе с единомышленниками',
    href: '/community/groups',
    available: true
  },
  {
    id: 'discussions',
    icon: '💬',
    title: 'Обсуждения',
    description: 'Задавайте вопросы и делитесь опытом',
    href: '/community/discussions',
    available: false
  },
  {
    id: 'find-partner',
    icon: '🤝',
    title: 'Найти напарника',
    description: 'Найдите партнера для совместного обучения',
    href: '/community/find-partner',
    available: false
  }
];

export function CommunityHub() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-20">
      <motion.div
        className="w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-5xl">👥</span>
            <h1 className="text-4xl font-bold">Сообщество VibeStudy</h1>
          </div>
          <p className="text-lg text-white/70">Выбери раздел:</p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {section.available ? (
                <Link href={section.href}>
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <span className="text-5xl transition-transform group-hover:scale-110">
                        {section.icon}
                      </span>
                      <div>
                        <h2 className="text-xl font-semibold">{section.title}</h2>
                        <p className="mt-1 text-sm text-white/60">{section.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 opacity-50 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <span className="text-5xl">{section.icon}</span>
                    <div>
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                      <p className="mt-1 text-sm text-white/60">{section.description}</p>
                      <p className="mt-2 text-xs text-yellow-400">Скоро будет доступен!</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <motion.div
          className="flex justify-center pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="/">
            <Button variant="secondary" size="lg" className="gap-2">
              <span>←</span>
              <span>Назад</span>
            </Button>
          </Link>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div
          className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-sm text-yellow-200">
            ⚡ Этот раздел сообщества скоро будет доступен! Следите за обновлениями.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
