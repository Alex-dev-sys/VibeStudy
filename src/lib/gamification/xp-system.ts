/**
 * XP система для gamification
 */

export interface XPReward {
  amount: number;
  reason: string;
  timestamp: number;
}

export interface XPConfig {
  easyTask: number;
  mediumTask: number;
  hardTask: number;
  challengeTask: number;
  dayCompletion: number;
  streakBonus: (days: number) => number;
  perfectDay: number; // все задачи без подсказок
  firstTry: number; // решил с первой попытки
}

export const XP_CONFIG: XPConfig = {
  easyTask: 10,
  mediumTask: 25,
  hardTask: 50,
  challengeTask: 100,
  dayCompletion: 100,
  streakBonus: (days: number) => days * 5, // растет с каждым днем стрика
  perfectDay: 150,
  firstTry: 20,
};

export interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

/**
 * Вычислить XP необходимый для следующего уровня
 */
export function getXPForLevel(level: number): number {
  // Экспоненциальная прогрессия
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Получить уровень по XP
 */
export function getLevelFromXP(totalXP: number): UserLevel {
  let level = 1;
  let xpForCurrentLevel = 0;

  while (xpForCurrentLevel <= totalXP) {
    level++;
    xpForCurrentLevel += getXPForLevel(level - 1);
  }

  level--; // вернуться на предыдущий уровень

  // XP для текущего уровня
  const xpForPrevLevels = Array.from({ length: level - 1 }, (_, i) => getXPForLevel(i + 1))
    .reduce((sum, xp) => sum + xp, 0);

  const currentXP = totalXP - xpForPrevLevels;
  const xpToNextLevel = getXPForLevel(level);

  return {
    level,
    currentXP,
    xpToNextLevel,
    totalXP,
  };
}

/**
 * Вычислить XP за задачу
 */
export function calculateTaskXP(
  difficulty: 'easy' | 'medium' | 'hard' | 'challenge',
  isFirstTry: boolean = false
): number {
  let baseXP = 0;

  switch (difficulty) {
    case 'easy':
      baseXP = XP_CONFIG.easyTask;
      break;
    case 'medium':
      baseXP = XP_CONFIG.mediumTask;
      break;
    case 'hard':
      baseXP = XP_CONFIG.hardTask;
      break;
    case 'challenge':
      baseXP = XP_CONFIG.challengeTask;
      break;
  }

  // Бонус за решение с первой попытки
  if (isFirstTry) {
    baseXP += XP_CONFIG.firstTry;
  }

  return baseXP;
}

/**
 * XP Manager
 */
class XPManager {
  private rewards: XPReward[] = [];

  addXP(amount: number, reason: string): XPReward {
    const reward: XPReward = {
      amount,
      reason,
      timestamp: Date.now(),
    };

    this.rewards.push(reward);
    this.saveToStorage();

    return reward;
  }

  getTotalXP(): number {
    return this.rewards.reduce((sum, r) => sum + r.amount, 0);
  }

  getUserLevel(): UserLevel {
    return getLevelFromXP(this.getTotalXP());
  }

  getRecentRewards(limit: number = 10): XPReward[] {
    return this.rewards.slice(-limit).reverse();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xp-rewards', JSON.stringify(this.rewards));
    }
  }

  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('xp-rewards');
      if (saved) {
        this.rewards = JSON.parse(saved);
      }
    }
  }

  clear() {
    this.rewards = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xp-rewards');
    }
  }
}

export const xpManager = new XPManager();

// Загрузить при инициализации
if (typeof window !== 'undefined') {
  xpManager.loadFromStorage();
}
