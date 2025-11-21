'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityCalendar } from './ActivityCalendar';
import { ProgressChart } from './ProgressChart';
import { EmptyStatistics } from '@/components/profile/EmptyStatistics';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';

export function StatisticsPanel() {
  const router = useRouter();
  const { record, dayStates } = useProgressStore();
  const { stats } = useAchievementsStore();

  // Show empty state if no completed days
  if (record.completedDays.length === 0) {
    return <EmptyStatistics onStartLearning={() => router.push('/learn')} />;
  }

  const statistics = useMemo(() => {
    const totalTasks = Object.values(dayStates).reduce(
      (sum, state) => sum + (state.completedTasks?.length || 0),
      0
    );

    const avgTasksPerDay = record.completedDays.length > 0
      ? (totalTasks / record.completedDays.length).toFixed(1)
      : '0';

    const completionRate = ((record.completedDays.length / 90) * 100).toFixed(1);

    const hoursSpent = Math.floor(stats.totalTimeSpent / 60);
    const minutesSpent = stats.totalTimeSpent % 60;

    return {
      totalDays: record.completedDays.length,
      totalTasks,
      avgTasksPerDay,
      completionRate,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      perfectDays: stats.perfectDays,
      hoursSpent,
      minutesSpent,
      easyTasks: stats.easyTasksCompleted,
      mediumTasks: stats.mediumTasksCompleted,
      hardTasks: stats.hardTasksCompleted,
      challengeTasks: stats.challengeTasksCompleted
    };
  }, [record, dayStates, stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-2xl">📊 Статистика обучения</CardTitle>
          <CardDescription>
            Детальная аналитика вашего прогресса и активности
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-3xl">📚</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">
                  {statistics.totalDays}
                </div>
                <div className="text-xs text-white/60">Дней завершено</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-3xl">✅</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">
                  {statistics.totalTasks}
                </div>
                <div className="text-xs text-white/60">Задач решено</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-3xl">🔥</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">
                  {statistics.currentStreak}
                </div>
                <div className="text-xs text-white/60">Текущая серия</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-3xl">⭐</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">
                  {statistics.perfectDays}
                </div>
                <div className="text-xs text-white/60">Идеальных дней</div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time & Progress */}
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle className="text-lg">Время и прогресс</CardTitle>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Общее время обучения</span>
              <span className="font-semibold text-white">
                {statistics.hoursSpent}ч {statistics.minutesSpent}м
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Процент завершения</span>
              <span className="font-semibold text-accent">{statistics.completionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Средняя задач/день</span>
              <span className="font-semibold text-white">{statistics.avgTasksPerDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Лучшая серия</span>
              <span className="font-semibold text-white">{statistics.longestStreak} дней</span>
            </div>
          </div>
        </Card>

        {/* Tasks by Difficulty */}
        <Card className="border-white/10 bg-black/40">
          <CardHeader>
            <CardTitle className="text-lg">Задачи по сложности</CardTitle>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-emerald-400">Easy</span>
                <span className="font-semibold text-white">{statistics.easyTasks}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-emerald-400"
                  style={{
                    width: `${(statistics.easyTasks / statistics.totalTasks) * 100 || 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-yellow-400">Medium</span>
                <span className="font-semibold text-white">{statistics.mediumTasks}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-yellow-400"
                  style={{
                    width: `${(statistics.mediumTasks / statistics.totalTasks) * 100 || 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-orange-400">Hard</span>
                <span className="font-semibold text-white">{statistics.hardTasks}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-orange-400"
                  style={{
                    width: `${(statistics.hardTasks / statistics.totalTasks) * 100 || 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-red-400">Challenge</span>
                <span className="font-semibold text-white">{statistics.challengeTasks}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-red-400"
                  style={{
                    width: `${(statistics.challengeTasks / statistics.totalTasks) * 100 || 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Card className="border-white/10 bg-black/40">
        <CardHeader>
          <ProgressChart />
        </CardHeader>
      </Card>

      <Card className="border-white/10 bg-black/40">
        <CardHeader>
          <ActivityCalendar />
        </CardHeader>
      </Card>
    </div>
  );
}

