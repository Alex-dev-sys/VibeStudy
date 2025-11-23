'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityCalendar } from './ActivityCalendar';
import { ProgressChart } from './ProgressChart';
import { EmptyStatistics } from '@/components/profile/EmptyStatistics';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { BookOpen, CheckCircle2, Flame, Star, Clock, BarChart3, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatisticsPanel() {
  const router = useRouter();
  const { record, dayStates } = useProgressStore();
  const { stats } = useAchievementsStore();

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

  // Show empty state if no completed days
  if (record.completedDays.length === 0) {
    return <EmptyStatistics onStartLearning={() => router.push('/learn')} />;
  }

  const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <div className="relative overflow-hidden rounded-xl bg-[#1e1e1e] p-4 shadow-lg ring-1 ring-white/5 transition-all hover:ring-white/10">
      <div className={cn("absolute right-2 top-2 opacity-10", color)}>
        <Icon className="h-16 w-16" />
      </div>
      <div className="relative z-10">
        <div className={cn("mb-3 inline-flex rounded-lg bg-white/5 p-2", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs font-medium text-white/50">{label}</div>
        {subtext && <div className="mt-1 text-[10px] text-white/30">{subtext}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Дней завершено"
          value={statistics.totalDays}
          color="text-blue-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Задач решено"
          value={statistics.totalTasks}
          color="text-green-400"
        />
        <StatCard
          icon={Flame}
          label="Текущая серия"
          value={statistics.currentStreak}
          color="text-orange-400"
        />
        <StatCard
          icon={Star}
          label="Идеальных дней"
          value={statistics.perfectDays}
          color="text-yellow-400"
        />
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time & Progress */}
        <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
          <div className="mb-6 flex items-center gap-2 text-white/80">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold">Время и прогресс</h3>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm text-white/60">Общее время</span>
              <span className="font-mono font-semibold text-white">
                {statistics.hoursSpent}ч {statistics.minutesSpent}м
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm text-white/60">Процент курса</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-white/10">
                  <div 
                    className="h-full rounded-full bg-accent" 
                    style={{ width: `${Math.min(parseFloat(statistics.completionRate), 100)}%` }} 
                  />
                </div>
                <span className="font-mono font-semibold text-accent">{statistics.completionRate}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm text-white/60">Средняя задач/день</span>
              <span className="font-mono font-semibold text-white">{statistics.avgTasksPerDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Лучшая серия</span>
              <span className="font-mono font-semibold text-white">{statistics.longestStreak} дней</span>
            </div>
          </div>
        </div>

        {/* Tasks Distribution */}
        <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
          <div className="mb-6 flex items-center gap-2 text-white/80">
            <BarChart3 className="h-5 w-5" />
            <h3 className="font-semibold">Задачи по сложности</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Easy', value: statistics.easyTasks, color: 'bg-emerald-400', text: 'text-emerald-400' },
              { label: 'Medium', value: statistics.mediumTasks, color: 'bg-yellow-400', text: 'text-yellow-400' },
              { label: 'Hard', value: statistics.hardTasks, color: 'bg-orange-400', text: 'text-orange-400' },
              { label: 'Challenge', value: statistics.challengeTasks, color: 'bg-red-400', text: 'text-red-400' }
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={item.text}>{item.label}</span>
                  <span className="font-mono text-white/60">{item.value}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", item.color)}
                    style={{
                      width: `${(item.value / Math.max(statistics.totalTasks, 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity & Progress Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
          <h3 className="mb-4 font-semibold text-white/80">Динамика обучения</h3>
          <ProgressChart />
        </div>
        <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
          <h3 className="mb-4 font-semibold text-white/80">Активность</h3>
          <ActivityCalendar />
        </div>
      </div>
    </div>
  );
}
