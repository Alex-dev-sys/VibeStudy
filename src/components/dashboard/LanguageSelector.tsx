'use client';

import { LANGUAGES } from '@/lib/languages';
import { useProgressStore } from '@/store/progress-store';
import { motion } from 'framer-motion';

export function LanguageSelector() {
  const languageId = useProgressStore((state) => state.languageId);
  const setLanguage = useProgressStore((state) => state.setLanguage);

  return (
    <section className="glass-panel rounded-2xl p-4 sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <h2 className="text-base font-semibold text-white sm:text-lg">Выбери язык обучения</h2>
        <p className="text-xs text-white/60 sm:text-sm">Можно менять язык на любом этапе — задания и теория перестроятся автоматически.</p>
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
                isActive ? 'border-accent/80 bg-accent/10 shadow-glow' : 'border-white/10 bg-black/40 hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white sm:text-base">{language.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-white/50 sm:text-xs">{language.monacoLanguage}</span>
              </div>
              <p className="text-xs text-white/60 sm:text-sm">{language.description}</p>
              {isActive && <span className="text-[10px] font-semibold uppercase text-accent sm:text-xs">Активно</span>}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

