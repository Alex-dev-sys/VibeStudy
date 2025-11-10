'use client';

import { useLocaleStore } from '@/store/locale-store';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' }
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="flex items-center rounded-full border border-white/10 bg-black/30 p-0.5">
      {OPTIONS.map((option) => {
        const isActive = option.value === locale;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={cn(
              'min-w-[44px] rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs',
              isActive ? 'bg-accent text-white shadow-glow' : 'text-white/60 hover:text-white'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

