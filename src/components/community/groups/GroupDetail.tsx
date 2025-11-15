'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GroupMembers } from './GroupMembers';
import { GroupChat } from './GroupChat';
import { GroupSettings } from './GroupSettings';
import { useGroupsStore } from '@/store/groups-store';
import { getCurrentUser } from '@/lib/supabase/auth';
import { LANGUAGES } from '@/lib/languages';
import { toast } from 'sonner';

interface GroupDetailProps {
  groupId: string;
}

export function GroupDetail({ groupId }: GroupDetailProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');

  const {
    currentGroup,
    members,
    fetchGroupById,
    fetchMembers,
    leaveGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    isLoading,
    error
  } = useGroupsStore();

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);

      await fetchGroupById(groupId);
      await fetchMembers(groupId);
      
      if (user) {
        subscribeToMessages(groupId);
      }
    };

    init();

    return () => {
      unsubscribeFromMessages();
    };
  }, [groupId, fetchGroupById, fetchMembers, subscribeToMessages, unsubscribeFromMessages]);

  const handleLeave = async () => {
    if (!confirm('Вы уверены, что хотите покинуть группу?')) {
      return;
    }

    try {
      await leaveGroup(groupId);
      toast.success('Вы покинули группу');
      window.location.href = '/community/groups';
    } catch (error) {
      toast.error('Не удалось покинуть группу');
    }
  };

  const language = LANGUAGES.find((lang) => lang.id === currentGroup?.languageId);
  const isOwner = currentGroup?.ownerId === userId;
  const isMember = members.some((m) => m.userId === userId);

  if (isLoading && !currentGroup) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-white/70">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !currentGroup) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <p className="mb-4 text-white/70">{error || 'Группа не найдена'}</p>
          <Link href="/community/groups">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <Link href="/community/groups">
                <Button variant="ghost" size="sm" className="gap-2">
                  <span>←</span>
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{currentGroup.name}</h1>
              {isOwner && (
                <span className="text-2xl" title="Вы владелец">
                  👑
                </span>
              )}
            </div>

            <p className="mb-4 text-white/70">{currentGroup.description}</p>

            <div className="flex flex-wrap items-center gap-4">
              <div
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${language?.highlightColor}20`,
                  color: language?.highlightColor
                }}
              >
                {language?.label || currentGroup.languageId}
              </div>

              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>👥</span>
                <span>{currentGroup.memberCount} участников</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="gap-2"
              >
                <span>⚙️</span>
                <span>Настройки</span>
              </Button>
            )}

            {isMember && !isOwner && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLeave}
                className="gap-2"
              >
                <span>🚪</span>
                <span>Покинуть</span>
              </Button>
            )}
          </div>
        </div>

        {/* Auth Notice */}
        {!isAuthenticated && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">
            <p className="text-sm text-blue-200">
              💡 Войдите в систему, чтобы общаться в группе
            </p>
            <Link href="/login">
              <Button variant="primary" size="sm" className="mt-3">
                Войти
              </Button>
            </Link>
          </div>
        )}

        {/* Not Member Notice */}
        {isAuthenticated && !isMember && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
            <p className="text-sm text-yellow-200">
              ⚠️ Вы не являетесь участником этой группы
            </p>
            <Link href="/community/groups">
              <Button variant="secondary" size="sm" className="mt-3">
                Вернуться к списку
              </Button>
            </Link>
          </div>
        )}

        {/* Tabs */}
        {isAuthenticated && isMember && (
          <>
            <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                💬 Чат
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'members'
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                👥 Участники ({members.length})
              </button>
            </div>

            {/* Content */}
            {activeTab === 'chat' ? (
              <GroupChat groupId={groupId} />
            ) : (
              <GroupMembers members={members} ownerId={currentGroup.ownerId} />
            )}
          </>
        )}
      </motion.div>

      {/* Settings Dialog */}
      {isOwner && (
        <GroupSettings
          group={currentGroup}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
