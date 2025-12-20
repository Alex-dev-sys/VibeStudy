/**
 * Leaderboard Service with Caching
 * 
 * Business logic for leaderboards with in-memory caching
 */

import { leaderboardDB } from '@/lib/db/bot-repository';

interface LeaderboardEntry {
    telegram_id: number;
    telegram_username?: string;
    first_name: string;
    level: number;
    xp: number;
    tasks_solved: number;
    current_streak?: number;
    rank?: number;
}

interface CacheEntry {
    data: LeaderboardEntry[];
    timestamp: number;
}

// Cache storage
const cache = new Map<string, CacheEntry>();

// Cache TTL
const CACHE_TTL = {
    GLOBAL: 60 * 60 * 1000, // 1 hour
    WEEKLY: 30 * 60 * 1000, // 30 minutes
    LANGUAGE: 60 * 60 * 1000, // 1 hour
};

export class LeaderboardService {
    /**
     * Get global leaderboard with caching
     */
    async getGlobalLeaderboard(limit: number = 50, forceRefresh: boolean = false): Promise<LeaderboardEntry[]> {
        const cacheKey = `global:${limit}`;

        if (!forceRefresh) {
            const cached = this.getFromCache(cacheKey, CACHE_TTL.GLOBAL);
            if (cached) {
                console.log('📦 Cache hit: global leaderboard');
                return cached;
            }
        }

        const data = await leaderboardDB.getGlobalLeaderboard(limit);
        const ranked = this.addRanks(data);

        this.setCache(cacheKey, ranked);
        return ranked;
    }

    /**
     * Get weekly leaderboard
     */
    async getWeeklyLeaderboard(limit: number = 25, forceRefresh: boolean = false): Promise<LeaderboardEntry[]> {
        const cacheKey = `weekly:${limit}`;

        if (!forceRefresh) {
            const cached = this.getFromCache(cacheKey, CACHE_TTL.WEEKLY);
            if (cached) {
                console.log('📦 Cache hit: weekly leaderboard');
                return cached;
            }
        }

        const data = await leaderboardDB.getWeeklyLeaderboard(limit);
        const ranked = this.addRanks(data);

        this.setCache(cacheKey, ranked);
        return ranked;
    }

    /**
     * Get language-specific leaderboard
     */
    async getLanguageLeaderboard(language: string, limit: number = 15, forceRefresh: boolean = false): Promise<LeaderboardEntry[]> {
        const cacheKey = `language:${language}:${limit}`;

        if (!forceRefresh) {
            const cached = this.getFromCache(cacheKey, CACHE_TTL.LANGUAGE);
            if (cached) {
                console.log(`📦 Cache hit: ${language} leaderboard`);
                return cached;
            }
        }

        const { data, error } = await getSupabase()
            .from('bot_users')
            .select('telegram_id, telegram_username, first_name, level, xp, tasks_solved')
            .eq('is_active', true)
            .eq('main_language', language)
            .order('xp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        const ranked = this.addRanks(data || []);
        this.setCache(cacheKey, ranked);
        return ranked;
    }

    /**
     * Get user rank
     */
    async getUserRank(telegramId: number): Promise<{ rank: number; totalUsers: number }> {
        const cacheKey = `rank:${telegramId}`;

        // Try cache first (shorter TTL for ranks)
        const cached = this.getFromCache(cacheKey, 10 * 60 * 1000); // 10 min
        if (cached) {
            return cached as any;
        }

        const result = await leaderboardDB.getUserRank(telegramId);
        this.setCache(cacheKey, result as any);

        return result;
    }

    /**
     * Invalidate all caches
     */
    invalidateAll() {
        cache.clear();
        console.log('🗑️ All leaderboard caches cleared');
    }

    /**
     * Invalidate specific cache
     */
    invalidate(pattern: string) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
        console.log(`🗑️ Caches matching '${pattern}' cleared`);
    }

    // Private helper methods

    private getFromCache(key: string, ttl: number): LeaderboardEntry[] | null {
        const entry = cache.get(key);

        if (!entry) return null;

        const age = Date.now() - entry.timestamp;
        if (age > ttl) {
            cache.delete(key);
            return null;
        }

        return entry.data;
    }

    private setCache(key: string, data: LeaderboardEntry[]) {
        cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    private addRanks(data: LeaderboardEntry[]): LeaderboardEntry[] {
        return data.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
    }
}

// Import getSupabase for language leaderboard
import { getSupabase } from '@/lib/db/bot-repository';

const leaderboardService = new LeaderboardService();

export default leaderboardService;
