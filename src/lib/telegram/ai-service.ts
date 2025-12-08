// AI Service for intelligent bot responses using GPT Llama API

import type { UserContext, HintLevel, WeakTopic } from '@/types/telegram';
import gptLamaClient from '@/lib/modules/mentor/gpt-lama';
import {
  AI_CACHE_TTL_RECOMMENDATIONS_MINUTES,
  AI_CACHE_TTL_QUESTIONS_MINUTES
} from './constants';

/**
 * LRU Cache with size limits to prevent memory leaks
 */
const MAX_CACHE_SIZE = 500;
const cache = new Map<string, { data: string; expiresAt: number }>();

function getCached(key: string): string | null {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  // Move to end for LRU behavior
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

function setCache(key: string, data: string, ttlMinutes: number = 60) {
  // Enforce max cache size (LRU eviction)
  if (cache.size >= MAX_CACHE_SIZE) {
    // Delete oldest entry (first in Map)
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }

  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000
  });
}

/**
 * Clean expired entries periodically
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) {
      cache.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, 5 * 60 * 1000);
}

export async function generateRecommendation(context: UserContext): Promise<string> {
  const cacheKey = `rec_${context.userId}_${context.currentDay}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Ты - AI помощник для обучения программированию на платформе VibeStudy.
Пользователь на дне ${context.currentDay} из 90, завершил ${context.completedDays} дней.
Текущая серия: ${context.streak} дней.
Слабые темы: ${context.weakTopics.join(', ') || 'нет данных'}.

Дай краткую персональную рекомендацию (2-3 предложения) что делать дальше. Используй emoji для наглядности.`;

    const result = await gptLamaClient.query(prompt);
    setCache(cacheKey, result, AI_CACHE_TTL_RECOMMENDATIONS_MINUTES);
    return result;
  } catch (error) {
    console.error('AI recommendation error:', error);
    return getFallbackRecommendation(context);
  }
}

export async function generateMotivation(context: UserContext): Promise<string> {
  try {
    const prompt = `Ты - мотивационный AI тренер для платформы VibeStudy.
Пользователь завершил ${context.completedDays} дней из 90.
Серия: ${context.streak} дней.

Напиши короткое мотивационное сообщение (2-3 предложения). Используй emoji для позитива.`;

    return await gptLamaClient.query(prompt);
  } catch (error) {
    console.error('AI motivation error:', error);
    return getFallbackMotivation(context);
  }
}

export async function answerQuestion(
  question: string,
  lessonContext: { day: number; topic: string }
): Promise<string> {
  const cacheKey = `q_${question.slice(0, 50)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Ты - преподаватель программирования на платформе VibeStudy.
Тема урока: ${lessonContext.topic} (день ${lessonContext.day}).
Вопрос студента: ${question}

Дай краткий, понятный ответ с примером кода если нужно. Используй emoji для наглядности.`;

    const result = await gptLamaClient.query(prompt);
    setCache(cacheKey, result, AI_CACHE_TTL_QUESTIONS_MINUTES);
    return result;
  } catch (error) {
    console.error('AI answer error:', error);
    return '❌ Извини, не могу ответить прямо сейчас. Попробуй переформулировать вопрос или спроси позже.';
  }
}

export async function generateHint(
  taskId: string,
  userCode: string,
  level: HintLevel
): Promise<string> {
  try {
    const hintLevels = {
      subtle: 'очень тонкую подсказку, не раскрывая решение',
      moderate: 'подсказку средней детальности',
      detailed: 'детальную подсказку с примером'
    };

    const prompt = `Ты - AI ментор на платформе VibeStudy.
Задача: ${taskId}
Код пользователя: ${userCode || 'пусто'}

Дай ${hintLevels[level]} для решения задачи. Не давай готовое решение, помогай понять подход.`;

    return await gptLamaClient.query(prompt);
  } catch (error) {
    console.error('AI hint error:', error);
    return getFallbackHint(level);
  }
}

export async function analyzeWeakTopics(userHistory: any[]): Promise<WeakTopic[]> {
  // Simplified analysis without AI
  const topics = new Map<string, { total: number; success: number }>();

  userHistory.forEach(attempt => {
    const topic = attempt.topic || 'unknown';
    const current = topics.get(topic) || { total: 0, success: 0 };
    current.total++;
    if (attempt.is_correct) current.success++;
    topics.set(topic, current);
  });

  const weakTopics: WeakTopic[] = [];
  topics.forEach((stats, topic) => {
    const mastery = stats.success / stats.total;
    if (mastery < 0.7) {
      weakTopics.push({
        topic,
        masteryLevel: mastery,
        attemptsCount: stats.total,
        lastPractice: new Date()
      });
    }
  });

  return weakTopics.sort((a, b) => a.masteryLevel - b.masteryLevel);
}

// Fallback responses when AI is unavailable
function getFallbackRecommendation(context: UserContext): string {
  if (context.weakTopics.length > 0) {
    return `💡 Рекомендую повторить темы: ${context.weakTopics.slice(0, 2).join(', ')}. Практика поможет закрепить материал!`;
  }

  if (context.streak === 0) {
    return `🔥 Начни новую серию! Даже 15 минут практики сегодня помогут войти в ритм.`;
  }

  return `🎯 Продолжай в том же духе! Ты на дне ${context.currentDay} из 90. Осталось ${90 - context.currentDay} дней до цели!`;
}

function getFallbackMotivation(context: UserContext): string {
  const messages = [
    `🌟 Отличная работа! ${context.completedDays} дней позади, продолжай двигаться вперед!`,
    `💪 Серия ${context.streak} дней - это круто! Не останавливайся!`,
    `🚀 Каждый день приближает тебя к цели. Ты молодец!`,
    `⭐ ${context.completedDays} дней завершено - это уже результат! Продолжай!`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function getFallbackHint(level: HintLevel): string {
  const hints = {
    subtle: '💡 Подумай о структуре данных, которая подходит для этой задачи.',
    moderate: '💡 Попробуй разбить задачу на более мелкие шаги. Начни с простого случая.',
    detailed: '💡 Используй цикл для перебора элементов и условие для проверки. Не забудь про граничные случаи.'
  };

  return hints[level];
}
