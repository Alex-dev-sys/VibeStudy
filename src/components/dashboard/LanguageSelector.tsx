'use client';

import { LANGUAGES } from '@/lib/content/languages';
import { useProgressStore } from '@/store/progress-store';
import { useTranslations } from '@/store/locale-store';
import { motion } from 'framer-motion';

export function LanguageSelector() {
  const t = useTranslations();
  const languageId = useProgressStore((state) => state.languageId);
  const setLanguage = useProgressStore((state) => state.setLanguage);

  return (
    <section className="relative flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white tracking-tight">{t.languageSelector.title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGES.map((language) => {
          const isActive = language.id === languageId;
          const langKey = language.id as keyof typeof t.languageSelector.languages;
          const langTranslation = t.languageSelector.languages[langKey];

          return (
            <motion.button
              key={language.id}
              onClick={() => setLanguage(language.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 h-full min-h-[160px] ${isActive
                  ? 'border-[#ff0094]/50 bg-gradient-to-br from-[#ff0094]/20 to-[#ffd200]/10 shadow-[0_8px_30px_rgba(255,0,148,0.25)]'
                  : 'border-white/10 bg-[#120b22] hover:border-white/30 hover:bg-[#1a1030]'
                }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-[#ff0094]/20 border border-[#ff0094]/30">
                  <span className="text-[10px] font-bold uppercase text-[#ff0094] tracking-wider">
                    {t.languageSelector.active}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2">{langTranslation.name}</h3>
                <p className="text-sm text-white/60 leading-relaxed max-w-[90%]">
                  {langTranslation.description}
                </p>
              </div>

              {/* Tag */}
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${isActive
                    ? 'bg-[#ff0094]/10 border-[#ff0094]/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/50'
                  }`}>
                  {language.id}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

