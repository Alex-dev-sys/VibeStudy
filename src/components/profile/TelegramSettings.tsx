'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfileStore } from '@/store/profile-store';
import { isTelegramConnected } from '@/lib/telegram-db';
import { Smartphone, Bell, Clock, Check, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TelegramSettings() {
  const { profile, updateProfile } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState(profile.telegramUsername || '');
  const [reminderTime, setReminderTime] = useState(profile.reminderTime);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.telegramNotifications);

  const isConnected = !!profile.telegramUsername;

  const handleSave = () => {
    updateProfile({
      telegramUsername: telegramUsername.startsWith('@') ? telegramUsername.slice(1) : telegramUsername,
      reminderTime,
      telegramNotifications: notificationsEnabled
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTelegramUsername(profile.telegramUsername || '');
    setReminderTime(profile.reminderTime);
    setNotificationsEnabled(profile.telegramNotifications);
    setIsEditing(false);
  };

  const reminderTimes = [
    { value: '09:00', label: 'Утро', icon: '🌅' },
    { value: '14:00', label: 'День', icon: '☀️' },
    { value: '19:00', label: 'Вечер', icon: '🌆' },
    { value: '22:00', label: 'Ночь', icon: '🌙' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl bg-[#1e1e1e] shadow-lg ring-1 ring-white/5"
    >
      <div className="p-5">
        {/* Заголовок */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Telegram бот</h3>
              <p className="text-xs text-white/60">Напоминания и советы</p>
            </div>
          </div>
          {isConnected ? (
            <Badge tone="accent" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <Check className="mr-1 h-3 w-3" /> Подключен
            </Badge>
          ) : (
            <Badge tone="neutral" className="bg-white/5 text-white/40 border-white/10">
              Не подключен
            </Badge>
          )}
        </div>

        {/* Статус подключения */}
        {!isEditing && (
          <div className="mb-5 rounded-lg border border-white/5 bg-black/20 p-4">
            {profile.telegramUsername ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Username</span>
                  <span className="font-mono font-medium text-white">@{profile.telegramUsername}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Напоминания</span>
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-white/40" />
                    {profile.reminderTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Уведомления</span>
                  <div className={cn(
                    "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    profile.telegramNotifications ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  )}>
                    <Bell className="h-3 w-3" />
                    {profile.telegramNotifications ? 'Вкл' : 'Выкл'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-white/60">Telegram не подключен</p>
                <p className="mt-1 text-xs text-white/40">Подключи бота для получения напоминаний</p>
              </div>
            )}
          </div>
        )}

        {/* Форма редактирования */}
        {isEditing && (
          <div className="mb-5 space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">
                Telegram Username
              </label>
              <input
                type="text"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                placeholder="@username"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Время напоминаний */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">
                Время напоминаний
              </label>
              <div className="grid grid-cols-4 gap-2">
                {reminderTimes.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setReminderTime(time.value)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all",
                      reminderTime === time.value
                        ? "border-blue-500/50 bg-blue-500/10 text-white"
                        : "border-white/5 bg-black/20 text-white/40 hover:bg-white/5 hover:text-white/70"
                    )}
                  >
                    <span className="text-lg mb-1">{time.icon}</span>
                    <span className="text-[10px] font-medium">{time.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Уведомления */}
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-full p-1.5", notificationsEnabled ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-white/40")}>
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Уведомления</p>
                  <p className="text-[10px] text-white/40">Напоминания о занятиях</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  notificationsEnabled ? "bg-blue-500" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>
        )}

        {/* Кнопка бота */}
        {!isEditing && (
          <a
            href="https://t.me/study_vibe_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500/10 py-2.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
          >
            <ExternalLink className="h-4 w-4" />
            Открыть бота
          </a>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="flex-1 text-xs h-9">
                Отмена
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} className="flex-1 text-xs h-9">
                Сохранить
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full bg-white/5 hover:bg-white/10 border-white/5 text-xs h-9"
            >
              {profile.telegramUsername ? 'Настроить' : 'Подключить'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

