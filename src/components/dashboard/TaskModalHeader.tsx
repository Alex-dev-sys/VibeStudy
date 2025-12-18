/**
 * TaskModalHeader Component
 * Header section of task modal with badges and close button
 */

import { Badge } from '@/components/ui/badge';
import { difficultyColorMap } from '@/lib/utils';
import { useTranslations } from '@/store/locale-store';
import type { GeneratedTask } from '@/types';

interface TaskModalHeaderProps {
  task: GeneratedTask;
  taskNumber: number;
  isCompleted: boolean;
  isViewMode: boolean;
  onClose: () => void;
}

export function TaskModalHeader({
  task,
  taskNumber,
  isCompleted,
  isViewMode,
  onClose
}: TaskModalHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-white/10">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
          <span className="text-sm font-medium text-white/50 sm:text-base">
            {t.taskModal.taskNumber} #{taskNumber}
          </span>
          <Badge
            tone="accent"
            className={`text-sm sm:text-base font-semibold ${difficultyColorMap[task.difficulty]}`}
          >
            {task.difficulty}
          </Badge>
          {isCompleted && (
            <Badge tone="accent" className="text-sm sm:text-base bg-green-500/20 text-green-300 border-green-500/30">
              ✓ {t.tasks.completed}
            </Badge>
          )}
          {isViewMode && (
            <Badge tone="neutral" className="text-sm sm:text-base">
              👁️ {t.taskModal.viewMode}
            </Badge>
          )}
        </div>
        <h2 className="text-lg font-bold text-white leading-relaxed sm:text-xl md:text-2xl">
          {task.prompt}
        </h2>
        {task.solutionHint && (
          <p className="mt-3 text-sm text-white/70 bg-white/5 rounded-lg p-3 border border-white/10 sm:text-base">
            💡 <span className="font-medium">{t.taskModal.solutionHint}:</span> {task.solutionHint}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="rounded-xl p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white hover:scale-110 sm:p-2.5"
        aria-label={t.taskModal.close}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 5L5 15M5 5l10 10"/>
        </svg>
      </button>
    </div>
  );
}
