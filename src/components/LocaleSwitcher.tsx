'use client';

import { useEffect } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { announceLiveRegion } from '@/lib/accessibility/focus-manager';

const OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' }
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  // Update document language attribute when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      
      // Announce locale change to screen readers
      const announcement = locale === 'en' 
        ? 'Language changed to English' 
        : 'Язык изменён на русский';
      announceLiveRegion(announcement);
    }
  }, [locale]);

  return (
    <div className="flex items-center rounded-full border border-white/12 bg-[rgba(255,255,255,0.18)] p-0.5 shadow-[0_12px_28px_rgba(12,6,28,0.35)] backdrop-blur-lg">
      {OPTIONS.map((option) => {
        const isActive = option.value === locale;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={cn(
              'min-w-[44px] rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs',
              isActive
                ? 'bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] text-[#22021b] shadow-[0_12px_24px_rgba(255,0,148,0.4)]'
                : 'text-white/65 hover:text-white'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

