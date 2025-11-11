'use client';

import { LANGUAGES } from '@/lib/languages';
import { useProgressStore } from '@/store/progress-store';
import { motion } from 'framer-motion';

export function LanguageSelector() {
  const languageId = useProgressStore((state) => state.languageId);
  const setLanguage = useProgressStore((state) => state.setLanguage);

  return (
    <section className="relative glass-panel-soft glow-border rounded-2xl p-4 sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <h2 className="text-base font-semibold text-white/95 sm:text-lg">Выбери язык обучения</h2>
        <p className="text-xs text-white/65 sm:text-sm">Можно менять язык на любом этапе — задания и теория перестроятся автоматически.</p>
      </div>
      <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {LANGUAGES.map((language) => {
          const isActive = language.id === languageId;
          return (
            <motion.button
              key={language.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLanguage(language.id)}
              className={`group flex flex-col gap-1.5 rounded-2xl border p-3 text-left transition-all duration-200 sm:gap-2 sm:rounded-3xl sm:p-4 ${
                isActive
                  ? 'border-transparent bg-gradient-to-br from-[#ff0094]/25 to-[#ffd200]/15 shadow-[0_22px_55px_rgba(255,0,148,0.35)]'
                  : 'border-white/12 bg-[rgba(255,255,255,0.1)] hover:border-white/25 hover:bg-[rgba(255,255,255,0.2)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/90 sm:text-base">{language.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-white/55 sm:text-xs">{language.monacoLanguage}</span>
              </div>
              <p className="text-xs text-white/65 sm:text-sm">{language.description}</p>
              {isActive && <span className="text-[10px] font-semibold uppercase text-gradient sm:text-xs">Активно</span>}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

