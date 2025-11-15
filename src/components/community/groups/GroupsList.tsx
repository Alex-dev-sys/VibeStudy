'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GroupCard } from './GroupCard';
import { GroupFilters } from './GroupFilters';
import { CreateGroupDialog } from './CreateGroupDialog';
import { useGroupsStore } from '@/store/groups-store';
import { getCurrentUser } from '@/lib/supabase/auth';

export function GroupsList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    fetchGroups,
    getFilteredGroups,
    isLoading: storeLoading,
    error
  } = useGroupsStore();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };

    checkAuth();
    fetchGroups();
  }, [fetchGroups]);

  const filteredGroups = getFilteredGroups();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-white/70">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-6xl px-4 py-8">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/community">
                <Button variant="ghost" size="sm" className="gap-2">
                  <span>←</span>
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">👥 Группы</h1>
            </div>
            <p className="mt-2 text-white/70">
              Присоединяйтесь к группам или создайте свою
            </p>
          </div>

          {isAuthenticated && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2"
            >
              <span>+</span>
              <span>Создать группу</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <GroupFilters />

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">❌ {error}</p>
          </div>
        )}

        {/* Groups Grid */}
        {storeLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-xl font-semibold">Групп не найдено</h3>
            <p className="mb-6 text-white/70">
              Попробуйте изменить фильтры или создайте первую группу
            </p>
            {isAuthenticated && (
              <Button
                variant="primary"
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
                <span>+</span>
                <span>Создать группу</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <GroupCard group={group} isAuthenticated={isAuthenticated} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Auth Notice */}
        {!isAuthenticated && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">
            <p className="text-sm text-blue-200">
              💡 Войдите в систему, чтобы создавать группы и присоединяться к ним
            </p>
            <Link href="/login">
              <Button variant="primary" size="sm" className="mt-3">
                Войти
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}
