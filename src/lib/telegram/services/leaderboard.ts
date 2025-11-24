export class LeaderboardService {
    async getGlobalLeaderboard(limit: number = 10): Promise<any[]> {
        // Mock data
        return [
            { username: 'Alex_Dev', level: 25, xp: 12450, tasks_solved: 342 },
            { username: 'Maria_Code', level: 22, xp: 10200, tasks_solved: 280 },
            { username: 'Pavel_Pro', level: 20, xp: 9500, tasks_solved: 250 },
        ];
    }

    async getWeeklyLeaderboard(limit: number = 10): Promise<any[]> {
        return [
            { username: 'New_Star', level: 5, xp: 1200, tasks_solved: 30 },
            { username: 'Fast_Coder', level: 8, xp: 1100, tasks_solved: 28 },
        ];
    }

    async getUserRank(telegramId: number): Promise<{ rank: number; total: number }> {
        return { rank: 127, total: 50000 };
    }
}

export const leaderboardService = new LeaderboardService();
