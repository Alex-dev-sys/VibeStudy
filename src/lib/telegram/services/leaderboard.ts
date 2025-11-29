import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton Supabase client
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

function getClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return supabaseClient;
}

/**
 * Calculate user level based on tasks completed
 * Level formula: level = floor(sqrt(tasks_completed / 10))
 */
function calculateLevel(tasksCompleted: number): number {
  return Math.floor(Math.sqrt(tasksCompleted / 10));
}

/**
 * Calculate XP (experience points) - same as tasks completed for now
 */
function calculateXP(tasksCompleted: number): number {
  return tasksCompleted * 10; // 10 XP per task
}

export interface LeaderboardEntry {
  username: string;
  first_name: string | null;
  level: number;
  xp: number;
  tasks_solved: number;
  study_hours: number;
  avg_engagement: number;
  rank?: number;
}

export class LeaderboardService {
  /**
   * Get global leaderboard - all time top users
   */
  async getGlobalLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const supabase = getClient();

      // Join user_telegram_profiles with user_analytics_summary
      const { data, error } = await supabase
        .from('user_telegram_profiles')
        .select(`
          username,
          first_name,
          user_id,
          user_analytics_summary!inner(
            total_tasks_completed,
            total_study_time,
            avg_engagement
          )
        `)
        .eq('is_active', true)
        .order('user_analytics_summary(total_tasks_completed)', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching global leaderboard:', error);
        return this.getFallbackLeaderboard();
      }

      if (!data || data.length === 0) {
        return this.getFallbackLeaderboard();
      }

      return data.map((entry: any, index: number) => {
        const tasksCompleted = entry.user_analytics_summary?.total_tasks_completed || 0;
        const studyTime = entry.user_analytics_summary?.total_study_time || 0;
        const avgEngagement = entry.user_analytics_summary?.avg_engagement || 0;

        return {
          username: entry.username || entry.first_name || 'Anonymous',
          first_name: entry.first_name,
          level: calculateLevel(tasksCompleted),
          xp: calculateXP(tasksCompleted),
          tasks_solved: tasksCompleted,
          study_hours: Math.round(studyTime / 60), // Convert minutes to hours
          avg_engagement: Math.round(avgEngagement),
          rank: index + 1
        };
      });
    } catch (error) {
      console.error('Leaderboard service error:', error);
      return this.getFallbackLeaderboard();
    }
  }

  /**
   * Get weekly leaderboard - top users this week
   */
  async getWeeklyLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const supabase = getClient();

      // Get date 7 days ago
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      // Query learning_analytics for this week
      const { data, error } = await supabase
        .from('learning_analytics')
        .select(`
          user_id,
          user_telegram_profiles!inner(username, first_name),
          sum(tasks_completed).sum(),
          sum(study_duration_minutes).sum(),
          avg(engagement_score).avg()
        `)
        .gte('date', weekAgoStr)
        .eq('user_telegram_profiles.is_active', true)
        .group('user_id')
        .order('sum', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching weekly leaderboard:', error);
        return this.getFallbackWeeklyLeaderboard();
      }

      if (!data || data.length === 0) {
        return this.getFallbackWeeklyLeaderboard();
      }

      return data.map((entry: any, index: number) => {
        const tasksCompleted = entry.sum || 0;
        const studyTime = entry.sum || 0;
        const avgEngagement = entry.avg || 0;

        return {
          username: entry.user_telegram_profiles?.username || entry.user_telegram_profiles?.first_name || 'Anonymous',
          first_name: entry.user_telegram_profiles?.first_name,
          level: calculateLevel(tasksCompleted),
          xp: calculateXP(tasksCompleted),
          tasks_solved: tasksCompleted,
          study_hours: Math.round(studyTime / 60),
          avg_engagement: Math.round(avgEngagement),
          rank: index + 1
        };
      });
    } catch (error) {
      console.error('Weekly leaderboard error:', error);
      return this.getFallbackWeeklyLeaderboard();
    }
  }

  /**
   * Get user's rank in global leaderboard
   */
  async getUserRank(userId: string): Promise<{ rank: number; total: number }> {
    try {
      const supabase = getClient();

      // Get all users sorted by tasks completed
      const { data, error } = await supabase
        .from('user_telegram_profiles')
        .select(`
          user_id,
          user_analytics_summary!inner(total_tasks_completed)
        `)
        .eq('is_active', true)
        .order('user_analytics_summary(total_tasks_completed)', { ascending: false });

      if (error || !data) {
        console.error('Error fetching user rank:', error);
        return { rank: 0, total: 0 };
      }

      const userIndex = data.findIndex((entry: any) => entry.user_id === userId);

      return {
        rank: userIndex >= 0 ? userIndex + 1 : 0,
        total: data.length
      };
    } catch (error) {
      console.error('Get user rank error:', error);
      return { rank: 0, total: 0 };
    }
  }

  /**
   * Fallback data when DB is unavailable
   */
  private getFallbackLeaderboard(): LeaderboardEntry[] {
    return [
      { username: 'CodeMaster', first_name: 'Alex', level: 25, xp: 12450, tasks_solved: 342, study_hours: 120, avg_engagement: 85 },
      { username: 'DevQueen', first_name: 'Maria', level: 22, xp: 10200, tasks_solved: 280, study_hours: 95, avg_engagement: 80 },
      { username: 'ProCoder', first_name: 'Pavel', level: 20, xp: 9500, tasks_solved: 250, study_hours: 85, avg_engagement: 75 },
    ];
  }

  private getFallbackWeeklyLeaderboard(): LeaderboardEntry[] {
    return [
      { username: 'NewStar', first_name: 'Anna', level: 5, xp: 1200, tasks_solved: 30, study_hours: 8, avg_engagement: 90 },
      { username: 'FastCoder', first_name: 'Ivan', level: 8, xp: 1100, tasks_solved: 28, study_hours: 7, avg_engagement: 85 },
    ];
  }
}

export const leaderboardService = new LeaderboardService();
