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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <Button
        variant="ghost"
        size="md"
        onClick={onClose}
        className="order-3 w-full min-h-touch text-xs sm:order-1 sm:w-auto sm:text-sm"
      >
        {t.taskModal.close}
      </Button>
      {!isViewMode && (
        <div className="order-1 flex gap-2 sm:order-2 sm:gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onGetHint}
            isLoading={isLoadingHint}
            disabled={isAnyLoading}
            className="flex-1 min-h-touch text-xs sm:flex-none sm:text-sm"
          >
            {isLoadingHint ? t.taskModal.thinking : `💡 ${t.taskModal.getHint}`}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onClear}
            disabled={isAnyLoading}
            className="flex-1 min-h-touch text-xs sm:flex-none sm:text-sm"
          >
            {t.taskModal.clear}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onRun}
            isLoading={isRunning}
            disabled={isAnyLoading || !hasCode}
            className="flex-1 min-h-touch text-xs sm:flex-none sm:text-sm bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30"
          >
            {isRunning ? '⏳ Запуск...' : '▶️ Запустить'}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onCheck}
            isLoading={isChecking}
            disabled={isAnyLoading || !hasCode}
            className="flex-1 min-h-touch text-xs sm:flex-none sm:text-sm"
          >
            {isChecking ? t.taskModal.checking : `✓ ${t.taskModal.checkSolution}`}
          </Button>
        </div>
      )}
    </div>
  );
}
