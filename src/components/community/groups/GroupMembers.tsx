'use client';

import { motion } from 'framer-motion';
import type { GroupMember } from '@/types/groups';

interface GroupMembersProps {
  members: GroupMember[];
  ownerId: string;
}

export function GroupMembers({ members, ownerId }: GroupMembersProps) {
  // Sort members: owner first, then by join date
  const sortedMembers = [...members].sort((a, b) => {
    if (a.userId === ownerId) return -1;
    if (b.userId === ownerId) return 1;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Участники ({members.length})
      </h2>

      <div className="space-y-3">
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            {/* Avatar */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold">
              {member.user?.name?.[0]?.toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {member.user?.name || 'Пользователь'}
                </span>
                {member.userId === ownerId && (
                  <span className="text-sm" title="Владелец группы">
                    👑
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Присоединился: {formatDate(member.joinedAt)}</span>
              </div>
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}
                title={member.isOnline ? 'Онлайн' : 'Оффлайн'}
              />
              <span className="text-xs text-white/60">
                {member.isOnline ? 'Онлайн' : 'Оффлайн'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="py-12 text-center text-white/60">
          <div className="mb-2 text-4xl">👥</div>
          <p>Пока нет участников</p>
        </div>
      )}
    </div>
  );
}
