'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useGroupsStore } from '@/store/groups-store';
import { toast } from 'sonner';
import type { GroupWithMembership } from '@/types/groups';
import { LANGUAGES } from '@/lib/languages';

interface GroupCardProps {
  group: GroupWithMembership;
  isAuthenticated: boolean;
}

export function GroupCard({ group, isAuthenticated }: GroupCardProps) {
  const { joinGroup, isLoading } = useGroupsStore();

  const language = LANGUAGES.find((lang) => lang.id === group.languageId);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.error('Необходима авторизация');
      return;
    }

    try {
      await joinGroup(group.id);
      toast.success('Вы присоединились к группе!');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('MAX_GROUPS_JOINED')) {
          toast.error('Вы можете состоять максимум в 10 группах');
        } else if (error.message.includes('ALREADY_MEMBER')) {
          toast.error('Вы уже участник этой группы');
        } else {
          toast.error('Не удалось присоединиться к группе');
        }
      }
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
      {/* Language Badge */}
      <div
        className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium"
        style={{
          backgroundColor: `${language?.highlightColor}20`,
          color: language?.highlightColor
        }}
      >
        {language?.label || group.languageId}
      </div>

      {/* Group Info */}
      <div className="mb-4">
        <h3 className="mb-2 text-xl font-semibold">{group.name}</h3>
        <p className="line-clamp-2 text-sm text-white/70">{group.description}</p>
      </div>

      {/* Members Count */}
      <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
        <span>👥</span>
        <span>{group.memberCount} участников</span>
      </div>

      {/* Action Button */}
      {group.isMember ? (
        <Link href={`/community/groups/${group.id}`}>
          <Button variant="secondary" size="sm" className="w-full gap-2">
            <span>✓</span>
            <span>Открыть</span>
          </Button>
        </Link>
      ) : (
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={handleJoin}
          disabled={isLoading || !isAuthenticated}
        >
          {isLoading ? 'Загрузка...' : 'Присоединиться'}
        </Button>
      )}

      {/* Owner Badge */}
      {group.isOwner && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-yellow-400">
          <span>👑</span>
          <span>Вы владелец</span>
        </div>
      )}
    </div>
  );
}
