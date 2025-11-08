'use client';

import { Button } from '@/components/ui/Button';
import { useLocaleStore } from '@/store/locale-store';
import type { Locale } from '@/lib/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  ru: '🇷🇺 Русский',
  en: '🇬🇧 English'
};

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="flex gap-2">
      {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setLocale(loc)}
          className="text-xs sm:text-sm"
        >
          {LOCALE_LABELS[loc]}
        </Button>
      ))}
    </div>
  );
}

