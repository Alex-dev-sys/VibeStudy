'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useProfileStore } from '@/store/profile-store';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { getCurrentUser } from '@/lib/supabase/auth';
import { User, Mail, Github, Calendar, Edit2, Camera, Save, X, Trophy, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfileCard() {
  const { profile, updateProfile } = useProfileStore();
  const completedDays = useProgressStore((state) => state.record.completedDays.length);
  const unlockedAchievements = useAchievementsStore((state) => state.unlockedAchievements.length);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedBio, setEditedBio] = useState(profile.bio || '');

  // Stable reference to updateProfile
  const updateProfileCallback = useCallback((updates: any) => {
    updateProfile(updates);
  }, [updateProfile]);

  // Load user data from Supabase on mount
  useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser();
      if (user) {
        const updates: any = {};
        
        // Set email if available
        if (user.email && !profile.email) {
          updates.email = user.email;
        }
        
        // Set name from user metadata or email
        if (!profile.name || profile.name === 'Гость') {
          updates.name = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'Пользователь';
        }
        
        // Set avatar from user metadata (Google OAuth provides avatar_url)
        if (user.user_metadata?.avatar_url && !profile.avatar) {
          updates.avatar = user.user_metadata.avatar_url;
        }
        
        if (Object.keys(updates).length > 0) {
          updateProfileCallback(updates);
        }
      }
    };
    
    loadUserData();
  }, [profile.email, profile.name, profile.avatar, updateProfileCallback]);

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
    <div className="relative overflow-hidden rounded-xl bg-[#1e1e1e] shadow-2xl ring-1 ring-white/5">
      {/* Header Background */}
      <div className="absolute top-0 h-24 w-full bg-gradient-to-r from-[#ff0094]/20 via-[#ff5bc8]/20 to-[#ffd200]/20 opacity-50" />
      
      <div className="relative px-6 pt-12 pb-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-[#1e1e1e] shadow-xl ring-2 ring-white/10"
            >
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
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
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110"
            >
              <Camera className="h-4 w-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {/* Edit Mode / View Mode */}
          {isEditing ? (
            <div className="w-full space-y-3">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full rounded-lg bg-black/20 px-3 py-2 text-center text-lg font-bold text-white placeholder-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-accent/50"
                placeholder="Ваше имя"
              />
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="w-full resize-none rounded-lg bg-black/20 px-3 py-2 text-sm text-white/80 placeholder-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-accent/50"
                placeholder="Расскажите о себе..."
                rows={2}
              />
              <div className="flex justify-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0 text-red-400 hover:bg-red-400/10 hover:text-red-300">
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0 text-green-400 hover:bg-green-400/10 hover:text-green-300">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="group relative mb-1 flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Edit2 className="h-3.5 w-3.5 text-white/40 hover:text-white" />
                </button>
              </div>
              
              {profile.email && (
                <div className="mb-3 flex items-center gap-1.5 text-xs text-white/40">
                  <Mail className="h-3 w-3" />
                  <span>{profile.email}</span>
                </div>
              )}

              {profile.bio && (
                <p className="mb-4 text-sm text-white/70">{profile.bio}</p>
              )}

              <div className="flex flex-wrap justify-center gap-3 text-xs text-white/50">
                <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {daysAgo === 0
                      ? 'С нами с сегодняшнего дня'
                      : `${daysAgo} дн. с нами`}
                  </span>
                </div>
                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Github className="h-3 w-3" />
                    <span>@{profile.githubUsername}</span>
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mini Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/5 pt-6">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white/5 p-3">
            <Target className="mb-1.5 h-5 w-5 text-emerald-400" />
            <span className="text-lg font-bold text-white">{completedDays}</span>
            <span className="text-[10px] text-white/40">Дней</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-white/5 p-3">
            <Trophy className="mb-1.5 h-5 w-5 text-yellow-400" />
            <span className="text-lg font-bold text-white">{unlockedAchievements}</span>
            <span className="text-[10px] text-white/40">Наград</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-white/5 p-3">
            <Flame className="mb-1.5 h-5 w-5 text-orange-400" />
            <span className="text-lg font-bold text-white">
              {Math.round((completedDays / 90) * 100)}%
            </span>
            <span className="text-[10px] text-white/40">Курс</span>
          </div>
        </div>
      </div>
    </div>
  );
}
