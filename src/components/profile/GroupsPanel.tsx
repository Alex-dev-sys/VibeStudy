'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useGroupsStore } from '@/store/groups-store';
import { getCurrentUser } from '@/lib/supabase/auth';
import { LANGUAGES } from '@/lib/languages';

export function GroupsPanel() {
  const { groups, fetchGroups, isLoading } = useGroupsStore();

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (user) {
        await fetchGroups();
      }
    };

    init();
  }, [fetchGroups]);

  const myGroups = groups.filter((g) => g.isMember);
  const ownedGroups = groups.filter((g) => g.isOwner);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">👥 Мои группы</h2>
          <p className="mt-1 text-sm text-white/60">
            Группы, в которых вы участвуете
          </p>
        </div>
        <Link href="/community/groups">
          <Button variant="secondary" size="sm">
            Все группы
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : myGroups.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-5xl">👥</div>
          <p className="mb-2 text-white/70">Вы пока не состоите в группах</p>
          <p className="mb-6 text-sm text-white/50">
            Присоединяйтесь к группам для совместного обучения
          </p>
          <Link href="/community/groups">
            <Button variant="primary" size="sm">
              Найти группы
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myGroups.slice(0, 5).map((group, index) => {
            const language = LANGUAGES.find((lang) => lang.id === group.languageId);

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link href={`/community/groups/${group.id}`}>
                  <div className="group flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{group.name}</h3>
                        {group.isOwner && (
                          <span className="text-sm" title="Вы владелец">
                            👑
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{
                            backgroundColor: `${language?.highlightColor}20`,
                            color: language?.highlightColor
                          }}
                        >
                          {language?.label}
                        </span>
                        <span>👥 {group.memberCount}</span>
                      </div>
                    </div>
                    <div className="text-white/40 transition-colors group-hover:text-white">
                      →
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {myGroups.length > 5 && (
            <Link href="/community/groups">
              <Button variant="ghost" size="sm" className="w-full">
                Показать все ({myGroups.length})
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      {myGroups.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{myGroups.length}</div>
            <div className="text-sm text-white/60">Групп</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{ownedGroups.length}</div>
            <div className="text-sm text-white/60">Создано</div>
          </div>
        </div>
      )}
    </div>
  );
}
