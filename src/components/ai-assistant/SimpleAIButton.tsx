'use client';

/**
 * Simple AI Assistant Button
 * Minimal implementation without complex dependencies
 */

import { useState } from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export function SimpleAIButton() {
  const [showPaywall, setShowPaywall] = useState(false);

  const handleClick = () => {
    setShowPaywall(true);
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-[140px] md:bottom-[88px] right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="AI Ассистент"
        title="AI Ассистент"
      >
        <Bot className="w-6 h-6 text-white" />
      </motion.button>

      {/* Simple Paywall Modal */}
      {showPaywall && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowPaywall(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  AI Ассистент
                </h2>
                <p className="text-gray-400">
                  Персональный помощник для изучения программирования
                </p>
              </div>

              {/* Features */}
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Объяснения сложных концепций простым языком
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Помощь с отладкой и исправлением ошибок
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Персональные рекомендации по обучению
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3 pt-4">
                <a
                  href="/pricing"
                  className="block w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Получить доступ
                </a>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="block w-full py-3 px-6 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  Закрыть
                </button>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-500">
                Доступно на тарифах Premium и Pro+
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
