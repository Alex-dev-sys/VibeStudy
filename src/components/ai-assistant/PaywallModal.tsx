'use client';

/**
 * Paywall Modal Component
 * Displayed to free users when they attempt to access AI assistant
 */

import React from 'react';
import { X, Sparkles, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: 'ru' | 'en';
}

export function PaywallModal({ isOpen, onClose, locale = 'ru' }: PaywallModalProps) {
  if (!isOpen) return null;

  const content = {
    ru: {
      title: 'AI Ассистент доступен в Premium',
      subtitle: 'Разблокируй безлимитный доступ к AI-помощнику',
      features: [
        {
          icon: Zap,
          title: 'Безлимитные запросы',
          description: 'Задавай вопросы без ограничений',
        },
        {
          icon: Sparkles,
          title: 'Лучшие AI модели',
          description: 'GPT-4o и Claude 3.5 Sonnet',
        },
        {
          icon: Crown,
          title: 'Персональная помощь',
          description: 'Индивидуальные рекомендации и советы',
        },
      ],
      freeTier: 'Бесплатный план: 5 запросов в день',
      upgradeButton: 'Перейти на Premium',
      closeButton: 'Закрыть',
    },
    en: {
      title: 'AI Assistant Available in Premium',
      subtitle: 'Unlock unlimited access to AI assistant',
      features: [
        {
          icon: Zap,
          title: 'Unlimited Requests',
          description: 'Ask questions without limits',
        },
        {
          icon: Sparkles,
          title: 'Best AI Models',
          description: 'GPT-4o and Claude 3.5 Sonnet',
        },
        {
          icon: Crown,
          title: 'Personal Help',
          description: 'Individual recommendations and advice',
        },
      ],
      freeTier: 'Free plan: 5 requests per day',
      upgradeButton: 'Upgrade to Premium',
      closeButton: 'Close',
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-6">
          {t.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-[#2a2a2a] rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#ff4bc1]/20 to-[#ffd34f]/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#ff4bc1]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free tier info */}
        <div className="bg-gray-800/50 rounded-xl p-3 mb-6 text-center">
          <p className="text-sm text-gray-400">{t.freeTier}</p>
        </div>

        {/* CTA Button */}
        <Link href="/pricing" onClick={onClose}>
          <button className="w-full py-3 px-6 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
            {t.upgradeButton}
          </button>
        </Link>
      </div>
    </div>
  );
}
