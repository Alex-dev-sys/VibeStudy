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
    <div className="flex items-start justify-between gap-2 sm:gap-4">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs text-white/50 sm:text-sm">
            {t.taskModal.taskNumber} #{taskNumber}
          </span>
          <Badge
            tone="accent"
            className={`text-xs sm:text-sm ${difficultyColorMap[task.difficulty]}`}
          >
            {task.difficulty}
          </Badge>
          {isCompleted && (
            <Badge tone="accent" className="text-xs sm:text-sm">
              ✓ {t.tasks.completed}
            </Badge>
          )}
          {isViewMode && (
            <Badge tone="neutral" className="text-xs sm:text-sm">
              👁️ {t.taskModal.viewMode}
            </Badge>
          )}
        </div>
        <h2 className="mt-2 text-base font-semibold text-white sm:text-lg md:text-xl">
          {task.prompt}
        </h2>
        {task.solutionHint && (
          <p className="mt-2 text-xs text-white/60 sm:text-sm">
            💡 {t.taskModal.solutionHint}: {task.solutionHint}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:p-2"
        aria-label={t.taskModal.close}
      >
        ✕
      </button>
    </div>
  );
}
