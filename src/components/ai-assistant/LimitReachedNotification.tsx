'use client';

/**
 * Limit Reached Notification Component
 * Displayed when user reaches their daily AI request limit
 */

import React from 'react';
import { X, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface LimitReachedNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  requestsUsed: number;
  requestsLimit: number;
  locale?: 'ru' | 'en';
}

export function LimitReachedNotification({
  isOpen,
  onClose,
  requestsUsed,
  requestsLimit,
  locale = 'ru',
}: LimitReachedNotificationProps) {
  if (!isOpen) return null;

  const content = {
    ru: {
      title: 'Лимит запросов исчерпан',
      subtitle: 'Вы использовали все доступные запросы на сегодня',
      usageInfo: 'Использовано',
      resetInfo: 'Лимит обновится завтра',
      upgradeTitle: 'Хотите больше?',
      upgradeDescription: 'Обновитесь до Premium для безлимитного доступа',
      premiumFeatures: [
        'Безлимитные AI-запросы',
        'Продвинутые AI модели',
        'Приоритетная генерация',
      ],
      upgradeButton: 'Перейти на Premium',
      closeButton: 'Понятно',
    },
    en: {
      title: 'Request Limit Reached',
      subtitle: "You've used all available requests for today",
      usageInfo: 'Used',
      resetInfo: 'Limit resets tomorrow',
      upgradeTitle: 'Want more?',
      upgradeDescription: 'Upgrade to Premium for unlimited access',
      premiumFeatures: [
        'Unlimited AI requests',
        'Advanced AI models',
        'Priority generation',
      ],
      upgradeButton: 'Upgrade to Premium',
      closeButton: 'Got it',
    },
  };

  const t = content[locale];

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800 p-6 m-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={t.closeButton}
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        {/* Usage stats */}
        <div className="mb-6">
          <div className="bg-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t.usageInfo}</span>
              <span className="text-lg font-bold text-white">
                {requestsUsed}/{requestsLimit}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] transition-all duration-300"
                style={{ width: `${(requestsUsed / requestsLimit) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">{t.resetInfo}</p>
          </div>
        </div>

        {/* Upgrade section */}
        <div className="bg-gradient-to-r from-[#ff4bc1]/10 to-[#ffd34f]/10 rounded-xl p-4 mb-6 border border-[#ff4bc1]/20">
          <div className="flex items-start gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#ff4bc1] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">{t.upgradeTitle}</h3>
              <p className="text-sm text-gray-400">{t.upgradeDescription}</p>
            </div>
          </div>
          <ul className="space-y-2 mb-4">
            {t.premiumFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 bg-[#ff4bc1] rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/pricing" onClick={onClose}>
            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
              {t.upgradeButton}
            </button>
          </Link>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-[#2a2a2a] text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t.closeButton}
        </button>
      </div>
    </div>
  );
}
