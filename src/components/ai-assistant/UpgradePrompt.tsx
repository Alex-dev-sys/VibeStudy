'use client';

/**
 * Upgrade Prompt Component
 * Displayed to users with expired subscriptions
 */

import React from 'react';
import { X, AlertCircle, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  expirationDate?: string;
  locale?: 'ru' | 'en';
}

export function UpgradePrompt({
  isOpen,
  onClose,
  expirationDate,
  locale = 'ru',
}: UpgradePromptProps) {
  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const content = {
    ru: {
      title: 'Подписка истекла',
      subtitle: 'Продли подписку, чтобы продолжить использовать AI-ассистента',
      expiredOn: 'Истекла',
      benefits: [
        'Безлимитные AI-запросы',
        'Доступ к лучшим моделям',
        'Персональные рекомендации',
        'Приоритетная поддержка',
      ],
      renewButton: 'Продлить подписку',
      closeButton: 'Закрыть',
      note: 'Ваш прогресс и достижения сохранены',
    },
    en: {
      title: 'Subscription Expired',
      subtitle: 'Renew your subscription to continue using AI assistant',
      expiredOn: 'Expired on',
      benefits: [
        'Unlimited AI requests',
        'Access to best models',
        'Personal recommendations',
        'Priority support',
      ],
      renewButton: 'Renew Subscription',
      closeButton: 'Close',
      note: 'Your progress and achievements are saved',
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        {/* Expiration info */}
        {expirationDate && (
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-400">
              {t.expiredOn}: {formatDate(expirationDate)}
            </span>
          </div>
        )}

        {/* Benefits */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            {locale === 'ru' ? 'Что вы получите:' : 'What you get:'}
          </h3>
          <div className="space-y-2">
            {t.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#ff4bc1] flex-shrink-0" />
                <span className="text-white">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="bg-[#2a2a2a] rounded-xl p-3 mb-6 text-center">
          <p className="text-sm text-gray-400">{t.note}</p>
        </div>

        {/* CTA Button */}
        <Link href="/pricing" onClick={onClose}>
          <button className="w-full py-3 px-6 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
            {t.renewButton}
          </button>
        </Link>
      </div>
    </div>
  );
}
