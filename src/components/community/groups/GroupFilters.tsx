'use client';

import { useGroupsStore } from '@/store/groups-store';
import { LANGUAGES } from '@/lib/languages';

export function GroupFilters() {
  const { searchQuery, languageFilter, setSearchQuery, setLanguageFilter } = useGroupsStore();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-row">
      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="🔍 Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/50 outline-none transition-colors focus:border-white/30 focus:bg-white/10"
        />
      </div>

      {/* Language Filter */}
      <div className="sm:w-48">
        <select
          value={languageFilter || ''}
          onChange={(e) => setLanguageFilter(e.target.value || null)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition-colors focus:border-white/30 focus:bg-white/10 [&>option]:bg-[#1a0f1f] [&>option]:text-white"
        >
          <option value="" className="bg-[#1a0f1f] text-white">Все языки</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-[#1a0f1f] text-white">
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
