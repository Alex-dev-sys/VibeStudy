'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Фоновые градиенты */}
      <div className="absolute inset-0 -z-10 bg-gradient-soft" />
      <div className="absolute inset-0 -z-10 bg-gradient-accent opacity-40" />
      
      {/* Анимированные круги на фоне */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent-soft/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Контент */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Лого/Бейдж */}
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-lg sm:text-2xl">🚀</span>
            <span className="hidden sm:inline">90-дневный путь к карьере в IT</span>
            <span className="sm:hidden">Путь к карьере в IT</span>
          </motion.div>

          {/* Заголовок */}
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
            Стань <span className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">Junior</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            разработчиком
            <br />
            за 90 дней
          </h1>

          {/* Описание */}
          <p className="mb-6 px-4 text-base text-white/70 sm:mb-8 sm:text-lg md:text-xl">
            Структурированный курс программирования с нуля до уровня junior.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Теория, практика и AI-генерируемые задания каждый день.
          </p>

          {/* Преимущества */}
          <div className="mb-8 grid grid-cols-2 gap-3 text-xs text-white/60 sm:mb-10 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl">📚</span>
              <span>Подробная теория</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl">💻</span>
              <span>Интерактивный редактор</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl">🤖</span>
              <span>AI-задания</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl">📊</span>
              <span>Отслеживание прогресса</span>
            </div>
          </div>

          {/* Кнопки */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
          >
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="group relative w-full overflow-hidden px-8 py-4 text-base font-semibold shadow-2xl shadow-accent/50 transition-all hover:shadow-accent/70 sm:w-auto sm:px-12 sm:py-6 sm:text-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  Начать обучение
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-accent-soft to-accent opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </Link>
            <Link href="/playground">
              <Button
                variant="secondary"
                size="lg"
                className="w-full px-8 py-4 text-base font-semibold sm:w-auto sm:px-12 sm:py-6 sm:text-xl"
              >
                🎨 Playground
              </Button>
            </Link>
          </motion.div>

          {/* Дополнительная информация */}
          <motion.p
            className="mt-4 text-xs text-white/50 sm:mt-6 sm:text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Бесплатно • Быстрая регистрация • 7 языков программирования
          </motion.p>
        </motion.div>

        {/* Статистика */}
        <motion.div
          className="mt-10 grid grid-cols-3 gap-3 sm:mt-16 sm:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="glass-panel rounded-xl p-4 backdrop-blur-xl sm:rounded-2xl sm:p-6">
            <div className="text-2xl font-bold text-accent sm:text-3xl">90</div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">Дней обучения</div>
          </div>
          <div className="glass-panel rounded-xl p-4 backdrop-blur-xl sm:rounded-2xl sm:p-6">
            <div className="text-2xl font-bold text-accent sm:text-3xl">450+</div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">Практических задач</div>
          </div>
          <div className="glass-panel rounded-xl p-4 backdrop-blur-xl sm:rounded-2xl sm:p-6">
            <div className="text-2xl font-bold text-accent sm:text-3xl">7</div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">Языков на выбор</div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

