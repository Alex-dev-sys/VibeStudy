# VibeStudy Telegram Bot — Технический Промт (Node.js + Next.js)

## 📋 Общее описание проекта

Разрабатываешь **Telegram бота** для платформы **VibeStudy** на **Node.js + Next.js** с интеграцией **node-telegram-bot-api**, хранением данных в **Supabase (PostgreSQL)** и AI на базе **GPT Lama API**.

### Основные характеристики:
- **Язык**: JavaScript/TypeScript
- **Backend Framework**: Next.js 14+ (API routes + serverless)
- **Telegram Bot Library**: node-telegram-bot-api
- **База данных**: Supabase (PostgreSQL)
- **AI**: GPT Lama API
- **Scheduling**: node-cron для расписания задач
- **Кэширование**: Redis (optional) / Supabase для состояния
- **Развертывание**: Vercel / Docker
- **Масштабируемость**: Поддержка 100k+ активных пользователей

---

## 🏗️ Архитектура и файловая структура

```
vibestudy-bot/
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.ts           # Telegram webhook endpoint
│   │   ├── bot/
│   │   │   ├── handlers/
│   │   │   │   ├── route.ts       # Main bot handler
│   │   │   │   ├── quests.ts      # Quest handlers
│   │   │   │   ├── leaderboard.ts # Leaderboard handlers
│   │   │   │   ├── mentor.ts      # AI Mentor handlers
│   │   │   │   ├── social.ts      # Social features handlers
│   │   │   │   └── recommendations.ts
│   │   ├── webhooks/
│   │   │   ├── task-completed/    # Webhook from web app
│   │   │   ├── sync/              # Sync with web app
│   │   │   └── events/
│   │   └── admin/
│   │       ├── analytics/
│   │       └── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── bot/
│   │   ├── client.ts              # Bot initialization
│   │   ├── middleware.ts          # Bot middleware
│   │   ├── commands.ts            # /start, /help, /menu commands
│   │   └── error-handler.ts       # Error handling
│   ├── modules/
│   │   ├── quests/
│   │   │   ├── service.ts         # Quest business logic
│   │   │   ├── repository.ts      # Quest DB operations
│   │   │   └── types.ts           # Quest types & interfaces
│   │   ├── leaderboard/
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   ├── cache.ts           # Cache logic
│   │   │   └── types.ts
│   │   ├── mentor/
│   │   │   ├── gpt-lama.ts        # GPT Lama API client
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── types.ts
│   │   ├── social/
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── types.ts
│   │   ├── recommendations/
│   │   │   ├── engine.ts          # Recommendation algorithm
│   │   │   ├── service.ts
│   │   │   └── types.ts
│   │   ├── seasonal-events/
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   └── types.ts
│   │   ├── notifications/
│   │   │   ├── service.ts
│   │   │   └── scheduler.ts       # Cron jobs
│   │   └── sync/
│   │       ├── service.ts
│   │       └── types.ts
│   ├── ui/
│   │   ├── keyboards/
│   │   │   ├── main-menu.ts       # Main inline buttons
│   │   │   ├── quests.ts
│   │   │   ├── leaderboard.ts
│   │   │   ├── social.ts
│   │   │   └── builders.ts        # Helper functions
│   │   └── messages/
│   │       ├── formatters.ts      # Markdown formatting
│   │       ├── templates.ts       # Message templates
│   │       └── emojis.ts          # Emoji constants
│   ├── db/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── migrations.ts          # DB migrations helper
│   │   └── seeds.ts               # DB seeds
│   ├── utils/
│   │   ├── cache.ts               # Cache utilities
│   │   ├── validators.ts          # Input validation
│   │   ├── rate-limiter.ts        # Rate limiting
│   │   ├── logger.ts              # Logging
│   │   ├── errors.ts              # Error classes
│   │   └── constants.ts           # App constants
│   ├── config/
│   │   ├── env.ts                 # Environment variables
│   │   └── constants.ts
│   └── types/
│       ├── bot.ts                 # Bot-related types
│       ├── user.ts
│       ├── quest.ts
│       ├── leaderboard.ts
│       ├── badge.ts
│       └── common.ts
├── scripts/
│   ├── setup-db.ts                # Setup database
│   ├── seed-data.ts               # Seed initial data
│   ├── start-scheduler.ts         # Start cron jobs
│   └── migrate.ts                 # Run migrations
├── tests/
│   ├── unit/
│   │   ├── quests.test.ts
│   │   ├── mentor.test.ts
│   │   └── recommendations.test.ts
│   ├── integration/
│   │   ├── bot.integration.test.ts
│   │   └── webhooks.integration.test.ts
│   └── fixtures/
│       ├── users.ts
│       └── quests.ts
├── .env.example                   # Environment variables example
├── .env.local                     # Local environment (gitignored)
├── package.json
├── tsconfig.json
├── next.config.js
├── docker-compose.yml
├── Dockerfile
├── README.md
└── docs/
    ├── API.md
    ├── DATABASE.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

---

## 🔧 Инициализация и конфиг

### `lib/config/env.ts` — Переменные окружения

```typescript
const env = {
  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
  TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL!,
  TELEGRAM_WEBHOOK_PORT: parseInt(process.env.TELEGRAM_WEBHOOK_PORT || '3000'),
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_KEY: process.env.SUPABASE_KEY!,
  
  // AI/LLM
  GPT_LAMA_API_KEY: process.env.GPT_LAMA_API_KEY!,
  GPT_LAMA_API_URL: process.env.GPT_LAMA_API_URL || 'https://api.gpt-lama.com',
  GPT_LAMA_MODEL: process.env.GPT_LAMA_MODEL || 'llama-2-13b',
  
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  
  // Cache/Redis (optional)
  REDIS_URL: process.env.REDIS_URL,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

export default env;
```

### `lib/bot/client.ts` — Инициализация бота

```typescript
import TelegramBot from 'node-telegram-bot-api';
import env from '@/lib/config/env';
import { setupMiddleware } from './middleware';
import { registerCommands } from './commands';
import { errorHandler } from './error-handler';

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot {
  if (!bot) {
    bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
      polling: process.env.NODE_ENV === 'development',
      webHook: {
        port: env.TELEGRAM_WEBHOOK_PORT,
        host: '0.0.0.0',
      },
    });

    // Setup webhook for production
    if (process.env.NODE_ENV === 'production') {
      bot.setWebHook(`${env.TELEGRAM_WEBHOOK_URL}/api/webhook`);
    }

    // Setup middleware
    setupMiddleware(bot);

    // Register commands
    registerCommands(bot);

    // Setup error handler
    bot.on('error', errorHandler);
  }

  return bot;
}

export function initializeBot(): TelegramBot {
  return getBot();
}

export default getBot;
```

### `lib/db/supabase.ts` — Supabase клиент

```typescript
import { createClient } from '@supabase/supabase-js';
import env from '@/lib/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// User management
export const usersDB = {
  async getUser(telegramId: number) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(telegramId: number, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('telegram_id', telegramId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async incrementXP(telegramId: number, xpAmount: number) {
    const { data: user } = await supabase
      .from('users')
      .select('xp, level')
      .eq('telegram_id', telegramId)
      .single();

    if (!user) throw new Error('User not found');

    const newXP = user.xp + xpAmount;
    const newLevel = Math.floor(newXP / 500) + 1;

    return this.updateUser(telegramId, {
      xp: newXP,
      level: newLevel,
      updated_at: new Date(),
    });
  },
};

// Quests management
export const questsDB = {
  async getDailyQuests(telegramId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('telegram_id', telegramId)
      .eq('quest_date', today)
      .eq('type', 'daily');
    
    if (error) throw error;
    return data;
  },

  async completeQuest(telegramId: number, questId: string, xpEarned: number) {
    const { data, error } = await supabase
      .from('user_quests')
      .update({
        completed_at: new Date(),
        xp_earned: xpEarned,
      })
      .eq('telegram_id', telegramId)
      .eq('quest_id', questId)
      .select()
      .single();
    
    if (error) throw error;

    // Update user XP
    await usersDB.incrementXP(telegramId, xpEarned);

    return data;
  },
};

// Leaderboard
export const leaderboardDB = {
  async getGlobalLeaderboard(limit: number = 50) {
    const { data, error } = await supabase
      .from('users')
      .select('telegram_id, username, level, xp, tasks_solved')
      .order('xp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getWeeklyLeaderboard(limit: number = 25) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('users')
      .select('telegram_id, username, level, xp, tasks_solved')
      .gte('last_activity', weekAgo.toISOString())
      .order('xp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getLanguageLeaderboard(language: string, limit: number = 15) {
    const { data, error } = await supabase
      .from('users')
      .select('telegram_id, username, level, xp, tasks_solved')
      .eq('main_language', language)
      .order('xp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getUserRank(telegramId: number) {
    const { data: users, error } = await supabase
      .from('users')
      .select('telegram_id, xp')
      .order('xp', { ascending: false });
    
    if (error) throw error;

    const rank = users.findIndex(u => u.telegram_id === telegramId) + 1;
    const totalUsers = users.length;

    return { rank, totalUsers };
  },
};

export default supabase;
```

---

## 🎛️ UI и клавиатуры (Keyboards)

### `lib/ui/keyboards/main-menu.ts` — Главное меню

```typescript
import TelegramBot from 'node-telegram-bot-api';

export function getMainMenuKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '📚 Уроки', callback_data: 'btn_lessons' },
        { text: '📊 Статистика', callback_data: 'btn_stats' },
      ],
      [
        { text: '🎯 Следующая задача', callback_data: 'btn_next_task' },
        { text: '🏆 Рейтинг', callback_data: 'btn_leaderboard' },
      ],
      [
        { text: '❓ AI Помощь', callback_data: 'btn_mentor' },
        { text: '⚙️ Настройки', callback_data: 'btn_settings' },
      ],
      [{ text: '👥 Социум', callback_data: 'btn_social' }],
    ],
  };
}

export function getQuestMenuKeyboard(questId: string): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '✨ Принять квест', callback_data: `quest_accept_${questId}` },
        { text: '📖 Условие', callback_data: `quest_details_${questId}` },
      ],
      [{ text: '🎁 Награда', callback_data: `quest_rewards_${questId}` }],
      [{ text: '🔙 Назад', callback_data: 'btn_menu' }],
    ],
  };
}

export function getLeaderboardKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '🌍 Глобальный', callback_data: 'leaderboard_global' },
        { text: '📅 Неделя', callback_data: 'leaderboard_weekly' },
      ],
      [
        { text: '💻 По языкам', callback_data: 'leaderboard_languages' },
        { text: '🔝 Топ-100', callback_data: 'leaderboard_top100' },
      ],
      [{ text: '🔙 Назад', callback_data: 'btn_menu' }],
    ],
  };
}

export function getPaginationKeyboard(
  currentPage: number,
  totalPages: number,
  baseCallback: string
): TelegramBot.InlineKeyboardMarkup {
  const buttons: TelegramBot.InlineKeyboardButton[][] = [];

  const navigation: TelegramBot.InlineKeyboardButton[] = [];

  if (currentPage > 1) {
    navigation.push({
      text: '⬅️ Назад',
      callback_data: `${baseCallback}_${currentPage - 1}`,
    });
  }

  navigation.push({
    text: `${currentPage}/${totalPages}`,
    callback_data: 'noop',
  });

  if (currentPage < totalPages) {
    navigation.push({
      text: 'Далее ➡️',
      callback_data: `${baseCallback}_${currentPage + 1}`,
    });
  }

  buttons.push(navigation);
  buttons.push([{ text: '🔙 Назад', callback_data: 'btn_menu' }]);

  return { inline_keyboard: buttons };
}
```

### `lib/ui/messages/formatters.ts` — Форматирование сообщений

```typescript
import { User, Quest, LeaderboardEntry } from '@/lib/types';

const EMOJIS = {
  success: '🎉',
  xp: '✨',
  level: '📈',
  streak: '🔥',
  badge: '🏅',
  friend: '👤',
  group: '👥',
  mentor: '🤖',
  menu: '📋',
  back: '🔙',
};

export function formatUserProfile(user: User): string {
  return `
*👤 Профиль*

${EMOJIS.xp} *Уровень:* ${user.level}
${EMOJIS.xp} *XP:* ${user.xp} / ${user.level * 500}
📊 *Решено задач:* ${user.tasks_solved}
🎓 *Основной язык:* ${user.main_language}
🔥 *Текущая серия:* ${user.current_streak} дней

*Достижения:* ${user.badges?.length || 0}
${user.badges?.map(b => `${EMOJIS.badge} ${b.name}`).join('\n') || 'Нет ещё'}
  `.trim();
}

export function formatQuestList(quests: Quest[]): string {
  const questLines = quests.map((q, i) => `
${i + 1}. *${q.name}*
   ${q.description}
   💰 Награда: ${q.rewards.xp} XP
   ${q.completed_at ? '✅ Завершено' : `⏳ Прогресс: ${q.progress}/${q.target}`}
  `);

  return `*📚 Ваши квесты*\n\n${questLines.join('\n')}`;
}

export function formatLeaderboard(
  entries: LeaderboardEntry[],
  userRank?: { rank: number; totalUsers: number }
): string {
  const leaderboardLines = entries
    .slice(0, 10)
    .map((entry, i) => `
${i + 1}. *${entry.username}*
   Уровень: ${entry.level} | XP: ${entry.xp}
   Задач: ${entry.tasks_solved}
    `);

  let result = `*🏆 Глобальный рейтинг*\n\n${leaderboardLines.join('\n')}`;

  if (userRank) {
    result += `\n\n*Твой ранг:* #${userRank.rank} из ${userRank.totalUsers}`;
  }

  return result;
}

export function formatXPReward(xp: number, multiplier: number = 1): string {
  const totalXP = xp * multiplier;
  const bonus = multiplier > 1 ? ` (${multiplier}x)` : '';
  return `${EMOJIS.xp} +${totalXP} XP${bonus}`;
}

export function escapeMarkdown(text: string): string {
  return text
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>');
}
```

---

## 🎮 Обработчики основных фич (Handlers)

### `lib/modules/quests/service.ts` — Сервис квестов

```typescript
import { questsDB, usersDB } from '@/lib/db/supabase';
import { Quest, QuestReward } from '@/lib/types/quest';
import logger from '@/lib/utils/logger';

export class QuestService {
  async getDailyQuests(telegramId: number): Promise<Quest[]> {
    try {
      const quests = await questsDB.getDailyQuests(telegramId);
      return quests || [];
    } catch (error) {
      logger.error('Error fetching daily quests:', error);
      throw error;
    }
  }

  async acceptQuest(telegramId: number, questId: string): Promise<Quest> {
    try {
      const quest = await questsDB.getQuestById(questId);
      
      if (!quest) {
        throw new Error('Quest not found');
      }

      // Start quest
      const { data, error } = await supabase
        .from('user_quests')
        .insert([{
          telegram_id: telegramId,
          quest_id: questId,
          accepted_at: new Date(),
          progress: 0,
          target: quest.target,
          quest_date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error accepting quest:', error);
      throw error;
    }
  }

  async completeQuest(
    telegramId: number,
    questId: string,
    xpReward: number
  ): Promise<void> {
    try {
      const quest = await questsDB.completeQuest(telegramId, questId, xpReward);
      
      // Update user streak
      const user = await usersDB.getUser(telegramId);
      const today = new Date();
      const lastActivity = new Date(user.last_activity);
      const daysDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = user.current_streak;
      if (daysDiff === 1) {
        newStreak++;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }

      await usersDB.updateUser(telegramId, {
        current_streak: newStreak,
        last_activity: today,
        tasks_solved: user.tasks_solved + 1,
      });

      logger.info(`Quest ${questId} completed by user ${telegramId}`);
    } catch (error) {
      logger.error('Error completing quest:', error);
      throw error;
    }
  }

  async getQuestProgress(telegramId: number, questId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('telegram_id', telegramId)
        .eq('quest_id', questId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching quest progress:', error);
      throw error;
    }
  }
}

export default new QuestService();
```

### `lib/modules/mentor/gpt-lama.ts` — GPT Lama интеграция

```typescript
import env from '@/lib/config/env';
import logger from '@/lib/utils/logger';
import { cache } from '@/lib/utils/cache';

export interface GptLamaConfig {
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  system_prompt: string;
}

const DEFAULT_CONFIG: GptLamaConfig = {
  model: env.GPT_LAMA_MODEL,
  temperature: 0.7,
  top_p: 0.9,
  max_tokens: 500,
  repetition_penalty: 1.0,
  system_prompt: `You are an expert programming mentor for VibeStudy platform. Your role is to:
1. Explain code clearly and concisely
2. Help debug errors with constructive guidance
3. Answer conceptual questions with examples
4. Adapt explanations to the user's level
5. Encourage learning without giving direct answers to exercises
6. Use simple language, avoid jargon when possible
7. Provide code examples in the same language the user uses
8. Be encouraging and supportive

Important: Never help with cheating or homework completion. Focus on learning and understanding.`,
};

export class GptLamaClient {
  private config: GptLamaConfig;
  private apiKey: string;
  private apiUrl: string;

  constructor(config: Partial<GptLamaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.apiKey = env.GPT_LAMA_API_KEY;
    this.apiUrl = env.GPT_LAMA_API_URL;
  }

  async query(userMessage: string, cacheKey?: string): Promise<string> {
    try {
      // Check cache first
      if (cacheKey) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          logger.info(`Cache hit for key: ${cacheKey}`);
          return cached;
        }
      }

      // Call GPT Lama API
      const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: this.config.system_prompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: this.config.temperature,
          top_p: this.config.top_p,
          max_tokens: this.config.max_tokens,
          repetition_penalty: this.config.repetition_penalty,
        }),
        signal: AbortSignal.timeout(30000), // 30 sec timeout
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`GPT Lama API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const answer = data.choices[0]?.message?.content;

      if (!answer) {
        throw new Error('Empty response from GPT Lama');
      }

      // Cache the response (24 hours)
      if (cacheKey) {
        await cache.set(cacheKey, answer, 86400);
      }

      return answer;
    } catch (error) {
      logger.error('Error querying GPT Lama:', error);
      throw error;
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    const message = `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    const cacheKey = `mentor:explain:${Buffer.from(code).toString('base64').slice(0, 32)}`;
    return this.query(message, cacheKey);
  }

  async debugError(error: string, context?: string): Promise<string> {
    const message = `Help me debug this error: ${error}${context ? `\nContext: ${context}` : ''}`;
    const cacheKey = `mentor:debug:${Buffer.from(error).toString('base64').slice(0, 32)}`;
    return this.query(message, cacheKey);
  }

  async answerConcept(concept: string, language?: string): Promise<string> {
    const message = `Explain the concept of "${concept}"${language ? ` in ${language}` : ''} in simple terms with examples.`;
    const cacheKey = `mentor:concept:${Buffer.from(concept).toString('base64').slice(0, 32)}`;
    return this.query(message, cacheKey);
  }
}

export default new GptLamaClient();
```

### `lib/modules/leaderboard/cache.ts` — Кэширование лидербордов

```typescript
import { cache } from '@/lib/utils/cache';
import { leaderboardDB } from '@/lib/db/supabase';
import logger from '@/lib/utils/logger';

const CACHE_KEYS = {
  GLOBAL: 'leaderboard:global',
  WEEKLY: 'leaderboard:weekly',
  LANGUAGE: (lang: string) => `leaderboard:language:${lang}`,
  USER_RANK: (userId: number) => `leaderboard:rank:${userId}`,
};

export class LeaderboardCache {
  async getGlobalLeaderboard(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.GLOBAL;

    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info('Cache hit for global leaderboard');
        return JSON.parse(cached);
      }
    }

    const leaderboard = await leaderboardDB.getGlobalLeaderboard(50);
    await cache.set(cacheKey, JSON.stringify(leaderboard), 3600); // 1 hour
    return leaderboard;
  }

  async getWeeklyLeaderboard(forceRefresh = false) {
    const cacheKey = CACHE_KEYS.WEEKLY;

    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info('Cache hit for weekly leaderboard');
        return JSON.parse(cached);
      }
    }

    const leaderboard = await leaderboardDB.getWeeklyLeaderboard(25);
    await cache.set(cacheKey, JSON.stringify(leaderboard), 1800); // 30 min
    return leaderboard;
  }

  async getLanguageLeaderboard(language: string, forceRefresh = false) {
    const cacheKey = CACHE_KEYS.LANGUAGE(language);

    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for language leaderboard: ${language}`);
        return JSON.parse(cached);
      }
    }

    const leaderboard = await leaderboardDB.getLanguageLeaderboard(language, 15);
    await cache.set(cacheKey, JSON.stringify(leaderboard), 3600); // 1 hour
    return leaderboard;
  }

  async getUserRank(telegramId: number, forceRefresh = false) {
    const cacheKey = CACHE_KEYS.USER_RANK(telegramId);

    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for user rank: ${telegramId}`);
        return JSON.parse(cached);
      }
    }

    const rank = await leaderboardDB.getUserRank(telegramId);
    await cache.set(cacheKey, JSON.stringify(rank), 1800); // 30 min
    return rank;
  }

  async invalidateAll() {
    await cache.del(CACHE_KEYS.GLOBAL);
    await cache.del(CACHE_KEYS.WEEKLY);
    logger.info('All leaderboard caches invalidated');
  }
}

export default new LeaderboardCache();
```

---

## ⏰ Планировщик задач (Scheduler)

### `lib/modules/notifications/scheduler.ts` — Cron jobs

```typescript
import cron from 'node-cron';
import { getBot } from '@/lib/bot/client';
import { usersDB, questsDB } from '@/lib/db/supabase';
import leaderboardCache from '@/lib/modules/leaderboard/cache';
import recommendationsEngine from '@/lib/modules/recommendations/engine';
import logger from '@/lib/utils/logger';

export class NotificationScheduler {
  // Ежедневный сброс квестов (00:00 UTC)
  startDailyQuestReset() {
    cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('Starting daily quest reset...');
        
        // Get all users
        const { data: users, error } = await supabase
          .from('users')
          .select('telegram_id, timezone')
          .eq('is_active', true);

        if (error) throw error;

        // Reset quests for each user
        for (const user of users) {
          // Mark old quests as expired
          await supabase
            .from('user_quests')
            .update({ is_expired: true })
            .eq('telegram_id', user.telegram_id)
            .eq('completed_at', null);

          // Create new daily quests
          const newQuests = this.generateDailyQuests(user.telegram_id);
          
          await supabase
            .from('user_quests')
            .insert(newQuests);

          // Send notification
          const bot = getBot();
          await bot.sendMessage(
            user.telegram_id,
            '📚 Новые квесты готовы! Проверь свои задачи на сегодня.',
            { parse_mode: 'Markdown' }
          );
        }

        logger.info('Daily quest reset completed');
      } catch (error) {
        logger.error('Error in daily quest reset:', error);
      }
    });
  }

  // Еженедельный сброс лидерборда (каждый понедельник 00:00)
  startWeeklyLeaderboardReset() {
    cron.schedule('0 0 * * 1', async () => {
      try {
        logger.info('Starting weekly leaderboard reset...');
        
        // Archive current weekly leaderboard
        // Invalidate cache
        await leaderboardCache.invalidateAll();
        
        logger.info('Weekly leaderboard reset completed');
      } catch (error) {
        logger.error('Error in weekly leaderboard reset:', error);
      }
    });
  }

  // Рекомендации каждые 6 часов
  startRecommendationSchedule() {
    cron.schedule('0 */6 * * *', async () => {
      try {
        logger.info('Starting recommendation generation...');
        
        const { data: users, error } = await supabase
          .from('users')
          .select('telegram_id, last_recommendation_sent')
          .eq('is_active', true)
          .eq('recommendations_enabled', true);

        if (error) throw error;

        for (const user of users) {
          const recommendations = await recommendationsEngine.generate(
            user.telegram_id
          );

          if (recommendations.length > 0) {
            const bot = getBot();
            const message = this.formatRecommendations(recommendations);
            
            await bot.sendMessage(user.telegram_id, message, {
              parse_mode: 'Markdown',
            });

            // Update last sent time
            await usersDB.updateUser(user.telegram_id, {
              last_recommendation_sent: new Date(),
            });
          }
        }

        logger.info('Recommendation generation completed');
      } catch (error) {
        logger.error('Error in recommendation generation:', error);
      }
    });
  }

  // Напоминание о сезонных событиях (за 3 дня)
  startSeasonalEventReminder() {
    cron.schedule('0 10 * * *', async () => {
      try {
        logger.info('Checking for upcoming seasonal events...');
        
        const upcomingEvents = await this.getUpcomingEvents(3);
        
        for (const event of upcomingEvents) {
          const { data: users, error } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('is_active', true);

          if (error) throw error;

          const bot = getBot();
          for (const user of users) {
            await bot.sendMessage(
              user.telegram_id,
              `🎉 ${event.name} приближается! Подготовься к событию!`,
              { parse_mode: 'Markdown' }
            );
          }
        }

        logger.info('Seasonal event reminder completed');
      } catch (error) {
        logger.error('Error in seasonal event reminder:', error);
      }
    });
  }

  private generateDailyQuests(telegramId: number) {
    const baseQuests = [
      { quest_id: 'daily_solve_3', name: 'Решить 3 задачи', target: 3 },
      { quest_id: 'daily_use_mentor', name: 'Использовать AI', target: 1 },
      { quest_id: 'daily_streak_7', name: 'Серия 7 дней', target: 7 },
    ];

    return baseQuests.map(q => ({
      telegram_id: telegramId,
      quest_id: q.quest_id,
      type: 'daily',
      progress: 0,
      target: q.target,
      quest_date: new Date().toISOString().split('T')[0],
    }));
  }

  private async getUpcomingEvents(daysAhead: number) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('seasonal_events')
      .select('*')
      .gte('start_date', today.toISOString())
      .lte('start_date', futureDate.toISOString());

    if (error) throw error;
    return data || [];
  }

  private formatRecommendations(recommendations: any[]): string {
    const lines = recommendations.map(
      r => `• ${r.emoji} ${r.title}\n  ${r.description}`
    );
    return `📍 *Рекомендации*\n\n${lines.join('\n\n')}`;
  }
}

export const scheduler = new NotificationScheduler();

// Start all jobs on initialization
export function startScheduler() {
  scheduler.startDailyQuestReset();
  scheduler.startWeeklyLeaderboardReset();
  scheduler.startRecommendationSchedule();
  scheduler.startSeasonalEventReminder();
  logger.info('Scheduler started successfully');
}
```

---

## 📡 API маршруты (Routes)

### `app/api/webhook/route.ts` — Telegram webhook

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/bot/client';
import { handleUpdate } from '@/app/api/bot/handlers/route';
import logger from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    
    logger.info('Received update:', JSON.stringify(update));

    // Handle the update
    await handleUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 'Telegram bot webhook is running' });
}
```

### `app/api/webhooks/task-completed/route.ts` — Вебхук завершения задачи

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/bot/client';
import { usersDB, questsDB } from '@/lib/db/supabase';
import logger from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { user_id, task_id, xp_earned, time_spent } = await req.json();

    // Validate request
    if (!user_id || !task_id || !xp_earned) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update user data
    const user = await usersDB.getUser(user_id);
    const newXP = user.xp + xp_earned;
    const newLevel = Math.floor(newXP / 500) + 1;

    await usersDB.updateUser(user_id, {
      xp: newXP,
      level: newLevel,
      tasks_solved: user.tasks_solved + 1,
    });

    // Send notification
    const bot = getBot();
    const message = `
🎉 *Отлично сделано!* Задача решена!

${xp_earned > 0 ? `✨ +${xp_earned} XP` : ''}
Уровень: ${newLevel}
Всего XP: ${newXP}/${newLevel * 500}
⏱ Время: ${time_spent}

[🎯 Следующая] [📊 Статистика]
    `.trim();

    await bot.sendMessage(user_id, message, { parse_mode: 'Markdown' });

    // Notify friends (if enabled)
    // ... friend notification logic

    logger.info(`Task ${task_id} completed by user ${user_id}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Error processing task completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📦 Типы данных (Types)

### `lib/types/user.ts`

```typescript
export interface User {
  id: string;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name?: string;
  level: number;
  xp: number;
  tasks_solved: number;
  current_streak: number;
  main_language: string;
  badges: Badge[];
  created_at: Date;
  last_activity: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: Date;
}
```

### `lib/types/quest.ts`

```typescript
export interface Quest {
  id: string;
  quest_id: string;
  type: 'daily' | 'weekly' | 'special';
  name: string;
  description: string;
  target: number;
  progress: number;
  rewards: QuestReward;
  created_at: Date;
  completed_at?: Date;
}

export interface QuestReward {
  xp: number;
  badge?: string;
  booster?: string;
}
```

---

## 🗄️ Миграции БД (Migrations)

### `scripts/setup-db.ts` — Создание таблиц

```typescript
import supabase from '@/lib/db/supabase';
import logger from '@/lib/utils/logger';

const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    tasks_solved INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    main_language VARCHAR(50),
    badges JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
  )`,

  // Quests table
  `CREATE TABLE IF NOT EXISTS user_quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    quest_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    progress INT DEFAULT 0,
    target INT NOT NULL,
    quest_date DATE NOT NULL,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    xp_earned INT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
  )`,

  // Seasonal events table
  `CREATE TABLE IF NOT EXISTS seasonal_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    xp_multiplier FLOAT DEFAULT 1,
    is_active BOOLEAN DEFAULT false,
    special_quests JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Badges table
  `CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    badge_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  )`,
];

export async function setupDatabase() {
  try {
    logger.info('Setting up database...');

    for (const migration of migrations) {
      const { error } = await supabase.rpc('execute_sql', {
        sql: migration,
      });

      if (error) {
        logger.warn(`Migration warning: ${error.message}`);
      }
    }

    logger.info('Database setup completed');
  } catch (error) {
    logger.error('Error setting up database:', error);
    throw error;
  }
}
```

---

## 🚀 Запуск и развертывание

### `package.json`

```json
{
  "name": "vibestudy-bot",
  "version": "1.0.0",
  "description": "VibeStudy Telegram Bot",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "setup-db": "ts-node scripts/setup-db.ts",
    "seed-db": "ts-node scripts/seed-data.ts",
    "start-scheduler": "ts-node scripts/start-scheduler.ts",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^14.0.0",
    "node-telegram-bot-api": "^0.63.0",
    "@supabase/supabase-js": "^2.38.0",
    "node-cron": "^3.0.3",
    "redis": "^4.6.10",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/node": "^20.5.0",
    "@types/jest": "^29.5.3",
    "jest": "^29.7.0",
    "ts-node": "^10.9.1"
  }
}
```

### `.env.example`

```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_WEBHOOK_URL=https://yourdomain.com
TELEGRAM_WEBHOOK_PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_key_here

# AI/LLM
GPT_LAMA_API_KEY=your_gpt_lama_key
GPT_LAMA_API_URL=https://api.gpt-lama.com
GPT_LAMA_MODEL=llama-2-13b

# App
NODE_ENV=production
APP_URL=https://yourdomain.com

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vibestudy
      POSTGRES_USER: vibestudy_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  bot:
    build: .
    environment:
      NODE_ENV: production
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}
      GPT_LAMA_API_KEY: ${GPT_LAMA_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

---

## 📋 Модульная структура кода

### Принципы модульности:
1. **Каждый модуль в отдельной папке** (`/lib/modules/[feature]/`)
2. **Файлы по типам**: `service.ts` (бизнес-логика), `repository.ts` (БД), `types.ts` (типы)
3. **Переиспользуемость**: UI компоненты, утилиты, типы
4. **Слабая связанность**: Модули не зависят друг от друга напрямую
5. **Тестируемость**: Каждый модуль легко тестировать

### Пример модуля (Quests):
```
lib/modules/quests/
├── service.ts        # QuestService (business logic)
├── repository.ts     # Database operations
├── types.ts          # TypeScript interfaces
├── constants.ts      # Quest constants
└── index.ts          # Exports
```

---

## ✅ Чеклист реализации

### Phase 1: Foundation (Неделя 1)
- [ ] Настройка Next.js проекта
- [ ] Интеграция node-telegram-bot-api
- [ ] Подключение Supabase
- [ ] Создание БД схемы (migrations)
- [ ] Базовое меню и обработчики кнопок
- [ ] Тестирование webhook

### Phase 2: Core Features (Неделя 2-3)
- [ ] Система квестов
- [ ] Лидерборды (с кэшированием)
- [ ] AI Mentor (GPT Lama)
- [ ] Модуль рекомендаций
- [ ] Социальные фичи

### Phase 3: Advanced (Неделя 4-5)
- [ ] Сезонные события
- [ ] Scheduler (cron jobs)
- [ ] Синхронизация с веб-приложением
- [ ] Продвинутые рекомендации
- [ ] Аналитика и логирование

### Phase 4: Deployment & Optimization (Неделя 6+)
- [ ] Тестирование (unit + integration)
- [ ] Docker контейнеризация
- [ ] Deploy на Vercel / Docker
- [ ] Monitoring & Error tracking (Sentry)
- [ ] Performance optimization

---

## 📚 Дополнительные ресурсы

- **node-telegram-bot-api docs**: https://github.com/yagop/node-telegram-bot-api
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Supabase Docs**: https://supabase.com/docs
- **node-cron**: https://github.com/kelektiv/node-cron
- **GPT Lama API**: https://docs.gpt-lama.com

---

**Документ актуален на 24 ноября 2025 г.**
**Версия**: 2.0.0 (Node.js + Next.js)
**Последнее обновление**: 2025-11-24