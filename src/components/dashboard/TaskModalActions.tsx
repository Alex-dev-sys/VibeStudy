/**
 * TaskModalActions Component
 * Action buttons for task modal (hint, clear, run, check)
 */

import { Button } from '@/components/ui/button';
import { useTranslations } from '@/store/locale-store';

interface TaskModalActionsProps {
  isViewMode: boolean;
  onClose: () => void;
  onGetHint: () => void;
  onClear: () => void;
  onRun: () => void;
  onCheck: () => void;
  isLoadingHint: boolean;
  isRunning: boolean;
  isChecking: boolean;
  hasCode: boolean;
}

export function TaskModalActions({
  isViewMode,
  onClose,
  onGetHint,
  onClear,
  onRun,
  onCheck,
  isLoadingHint,
  isRunning,
  isChecking,
  hasCode
}: TaskModalActionsProps) {
  const t = useTranslations();

  const isAnyLoading = isLoadingHint || isRunning || isChecking;

  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-white/10 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Button
        variant="ghost"
        size="lg"
        onClick={onClose}
        className="order-3 w-full text-sm font-medium sm:order-1 sm:w-auto sm:text-base"
      >
        {t.taskModal.close}
      </Button>
      {!isViewMode && (
        <div className="order-1 flex gap-2 sm:order-2 sm:gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={onGetHint}
            isLoading={isLoadingHint}
            disabled={isAnyLoading}
            className="flex-1 text-sm font-medium sm:flex-none sm:text-base"
          >
            {isLoadingHint ? t.taskModal.thinking : `💡 ${t.taskModal.getHint}`}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onClear}
            disabled={isAnyLoading}
            className="flex-1 text-sm font-medium sm:flex-none sm:text-base"
          >
            🗑️ {t.taskModal.clear}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onRun}
            isLoading={isRunning}
            disabled={isAnyLoading || !hasCode}
            className="flex-1 text-sm font-medium bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-200 hover:text-blue-100 sm:flex-none sm:text-base"
          >
            {isRunning ? '⏳ Запуск...' : '▶️ Запустить'}
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onCheck}
            isLoading={isChecking}
            disabled={isAnyLoading || !hasCode}
            className="flex-1 text-sm font-bold sm:flex-none sm:text-base shadow-lg shadow-accent/20"
          >
            {isChecking ? t.taskModal.checking : `✓ ${t.taskModal.checkSolution}`}
          </Button>
        </div>
      )}
    </div>
  );
}
