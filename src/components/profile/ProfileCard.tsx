'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProfileStore } from '@/store/profile-store';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';

export function ProfileCard() {
  const { profile, updateProfile } = useProfileStore();
  const completedDays = useProgressStore((state) => state.record.completedDays.length);
  const unlockedAchievements = useAchievementsStore((state) => state.unlockedAchievements.length);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedBio, setEditedBio] = useState(profile.bio || '');

  const handleSave = () => {
    updateProfile({
      name: editedName,
      bio: editedBio
    });
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getDefaultAvatar = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent to-accent-soft text-4xl font-bold text-white">
        {initial}
      </div>
    );
  };

  const daysAgo = Math.floor((Date.now() - profile.joinedAt) / (1000 * 60 * 60 * 24));

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-accent/30"
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getDefaultAvatar(profile.name)
              )}
            </motion.div>
            
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/80 text-white transition-colors hover:bg-accent"
            >
              📷
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-white focus:border-accent focus:outline-none"
                  placeholder="Ваше имя"
                />
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-white focus:border-accent focus:outline-none"
                  placeholder="Расскажите о себе..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    Сохранить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(profile.name);
                      setEditedBio(profile.bio || '');
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    {profile.email && (
                      <p className="mt-1 text-sm text-white/60">{profile.email}</p>
                    )}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                    ✏️ Редактировать
                  </Button>
                </div>

                {profile.bio && (
                  <p className="text-sm text-white/70">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>
                      {daysAgo === 0
                        ? 'Присоединился сегодня'
                        : `${daysAgo} ${daysAgo === 1 ? 'день' : daysAgo < 5 ? 'дня' : 'дней'} с нами`}
                    </span>
                  </div>
                  {profile.githubUsername && (
                    <div className="flex items-center gap-2">
                      <span>🐙</span>
                      <a
                        href={`https://github.com/${profile.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        @{profile.githubUsername}
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{completedDays}</div>
            <div className="text-xs text-white/60">Дней завершено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{unlockedAchievements}</div>
            <div className="text-xs text-white/60">Достижений</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {Math.round((completedDays / 90) * 100)}%
            </div>
            <div className="text-xs text-white/60">Прогресс</div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

