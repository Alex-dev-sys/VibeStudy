'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, ExternalLink } from 'lucide-react';

/**
 * Страница для мобильных пользователей с просьбой открыть сайт на ПК
 */
export default function MobileRedirectPage() {
  useEffect(() => {
    // Добавляем класс для фона
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        {/* Иконки устройств */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div className="text-white text-2xl">→</div>
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center animate-pulse">
            <Monitor className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Используйте ПК
        </h1>

        {/* Описание */}
        <p className="text-white/90 text-center mb-6 leading-relaxed">
          VibeStudy оптимизирован для работы на настольных компьютерах и ноутбуках.
          Для лучшего опыта работы с редактором кода и обучения откройте сайт на ПК.
        </p>

        {/* Причины */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3 text-white/80">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">✓</span>
            </div>
            <p className="text-sm">Monaco Editor требует большого экрана для комфортной работы</p>
          </div>
          <div className="flex items-start gap-3 text-white/80">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">✓</span>
            </div>
            <p className="text-sm">Клавиатура необходима для эффективного написания кода</p>
          </div>
          <div className="flex items-start gap-3 text-white/80">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">✓</span>
            </div>
            <p className="text-sm">Полноценный интерфейс с аналитикой и дашбордом</p>
          </div>
        </div>

        {/* URL для копирования */}
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <p className="text-white/60 text-xs mb-2">Адрес сайта:</p>
          <div className="flex items-center gap-2">
            <code className="text-white font-mono text-sm flex-1">
              {typeof window !== 'undefined' ? window.location.origin : 'vibestudy.ru'}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.origin : 'https://vibestudy.ru';
                navigator.clipboard.writeText(url);
              }}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Кнопка продолжить (для Telegram Mini Apps) */}
        <Button
          className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold py-6 text-lg rounded-xl"
          onClick={() => {
            // Если это Telegram Mini App - открываем в браузере
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
              // @ts-expect-error - openLink exists in Telegram WebApp API but not in types
              window.Telegram.WebApp.openLink?.(window.location.origin);
            } else {
              // Иначе просто показываем уведомление
              alert('Скопируйте адрес и откройте его на ПК');
            }
          }}
        >
          Открыть на ПК
        </Button>

        {/* Дополнительная информация */}
        <p className="text-white/50 text-xs text-center mt-6">
          Мы работаем над мобильной версией! 📱
        </p>
      </div>
    </div>
  );
}
