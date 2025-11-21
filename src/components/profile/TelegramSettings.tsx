'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfileStore } from '@/store/profile-store';
import { isTelegramConnected } from '@/lib/telegram-db';

export function TelegramSettings() {
  const { profile, updateProfile } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState(profile.telegramUsername || '');
  const [reminderTime, setReminderTime] = useState(profile.reminderTime);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.telegramNotifications);

  const isConnected = profile.telegramUsername ? isTelegramConnected(profile.telegramUsername) : false;

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
    { value: '09:00', label: '🌅 Утро (9:00)', emoji: '🌅' },
    { value: '14:00', label: '☀️ День (14:00)', emoji: '☀️' },
    { value: '19:00', label: '🌆 Вечер (19:00)', emoji: '🌆' },
    { value: '22:00', label: '🌙 Ночь (22:00)', emoji: '🌙' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-black/40">
        <div className="p-4 sm:p-6">
          {/* Заголовок */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📱</span>
              <div>
                <h3 className="text-lg font-semibold text-white sm:text-xl">Telegram бот</h3>
                <p className="text-xs text-white/60 sm:text-sm">Напоминания и советы по обучению</p>
              </div>
            </div>
            {isConnected && (
              <Badge tone="accent" className="bg-emerald-500/20 text-emerald-300">
                ✓ Подключен
              </Badge>
            )}
          </div>

          {/* Статус подключения */}
          {!isEditing && (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/40 p-4">
              {profile.telegramUsername ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Telegram username:</span>
                    <span className="font-semibold text-white">@{profile.telegramUsername}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Время напоминаний:</span>
                    <span className="font-semibold text-white">
                      {reminderTimes.find(t => t.value === profile.reminderTime)?.emoji} {profile.reminderTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Уведомления:</span>
                    <Badge tone="accent" className={profile.telegramNotifications ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}>
                      {profile.telegramNotifications ? 'Включены' : 'Выключены'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-white/60">Telegram не подключен</p>
                  <p className="mt-1 text-xs text-white/40">Укажи свой username для получения напоминаний</p>
                </div>
              )}
            </div>
          )}

          {/* Форма редактирования */}
          {isEditing && (
            <div className="mb-4 space-y-4">
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Telegram Username
                </label>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="@username или username"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:border-accent/50 focus:outline-none"
                />
                <p className="mt-1 text-xs text-white/50">
                  Укажи свой Telegram username (можно без @)
                </p>
              </div>

              {/* Время напоминаний */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Время напоминаний
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {reminderTimes.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => setReminderTime(time.value)}
                      className={`rounded-lg border p-3 text-center text-sm transition-all ${
                        reminderTime === time.value
                          ? 'border-accent bg-accent/20 text-white'
                          : 'border-white/10 bg-black/20 text-white/60 hover:border-white/20 hover:bg-black/40'
                      }`}
                    >
                      <div className="text-xl">{time.emoji}</div>
                      <div className="mt-1 text-xs">{time.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Включение/выключение уведомлений */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4">
                <div>
                  <p className="font-semibold text-white">Уведомления</p>
                  <p className="text-xs text-white/60">Получать напоминания и советы</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative h-8 w-14 rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-accent' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Кнопка перехода к боту */}
          {!isEditing && (
            <div className="mb-4">
              <a
                href="https://t.me/study_vibe_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-6 py-4 text-center font-semibold text-white transition-all hover:border-blue-400/70 hover:from-blue-500/30 hover:to-purple-500/30 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <span className="text-2xl">🤖</span>
                <span>Открыть Telegram бота</span>
                <span className="text-sm opacity-70">↗</span>
              </a>
            </div>
          )}

          {/* Инструкция */}
          {!profile.telegramUsername && !isEditing && (
            <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <h4 className="mb-2 text-sm font-semibold text-blue-200">📖 Как подключить бота:</h4>
              <ol className="space-y-1 text-xs text-blue-200/80 sm:text-sm">
                <li>1. Нажми кнопку выше "Открыть Telegram бота"</li>
                <li>2. Нажми /start в чате с ботом</li>
                <li>3. Укажи свой username здесь в профиле</li>
                <li>4. Бот автоматически свяжется с тобой!</li>
              </ol>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="md" onClick={handleCancel} className="flex-1">
                  Отмена
                </Button>
                <Button variant="primary" size="md" onClick={handleSave} className="flex-1">
                  Сохранить
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                {profile.telegramUsername ? 'Изменить настройки' : 'Подключить Telegram'}
              </Button>
            )}
          </div>

          {/* Дополнительная информация */}
          {profile.telegramUsername && !isEditing && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/60">
                💡 Бот будет отправлять тебе напоминания о занятиях, персональные советы на основе твоего прогресса и мотивационные сообщения.
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

