/**
 * TaskModalOutput Component
 * Displays check results, suggestions, and hints
 */

import { motion } from 'framer-motion';
import { FeedbackButtons } from '@/components/ai/FeedbackButtons';
import { useTranslations } from '@/store/locale-store';
import type { CheckResult } from '@/hooks/useTaskModal';

interface TaskModalOutputProps {
  output: string;
  checkResult: CheckResult | null;
  showSuggestions: boolean;
  hints: string[];
  languageId: string;
  day: number;
  taskId: string;
  taskDifficulty: string;
}

export function TaskModalOutput({
  output,
  checkResult,
  showSuggestions,
  hints,
  languageId,
  day,
  taskId,
  taskDifficulty
}: TaskModalOutputProps) {
  const t = useTranslations();

  if (!output && hints.length === 0) {
    return null;
  }

  return (
    <>
      {/* Output */}
      {output && (
        <div
          className={`rounded-xl border p-3 sm:rounded-2xl sm:p-4 ${
            checkResult?.success
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : checkResult?.success === false
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
              : 'border-white/10 bg-black/40 text-white/80'
          }`}
        >
          <pre className="whitespace-pre-wrap text-xs sm:text-sm">{output}</pre>
          {checkResult && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <FeedbackButtons
                contentType="explanation"
                contentKey={`${languageId}-day-${day}-task-${taskId}-explanation`}
                metadata={{
                  language: languageId,
                  day,
                  taskId,
                  success: checkResult.success,
                  difficulty: taskDifficulty
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && checkResult && checkResult.suggestions && checkResult.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 sm:rounded-2xl sm:p-4"
        >
          <h4 className="mb-2 text-sm font-semibold text-blue-200">
            💡 {t.taskModal.recommendations}:
          </h4>
          <ul className="space-y-1 text-xs text-blue-200/80 sm:text-sm">
            {checkResult.suggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-blue-400">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Hints History */}
      {hints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 sm:rounded-2xl sm:p-4"
        >
          <h4 className="mb-2 text-sm font-semibold text-purple-200">
            💡 {t.taskModal.hintsUsed}: {hints.length}
          </h4>
          <div className="space-y-3 text-xs text-purple-200/80 sm:text-sm">
            {hints.map((hint, i) => (
              <div key={i} className="space-y-2">
                <div className="border-l-2 border-purple-500/40 pl-3">
                  <span className="font-semibold">{t.taskModal.hintNumber} {i + 1}:</span> {hint}
                </div>
                <FeedbackButtons
                  contentType="hint"
                  contentKey={`${languageId}-day-${day}-task-${taskId}-hint-${i}`}
                  metadata={{
                    language: languageId,
                    day,
                    taskId,
                    hintNumber: i + 1,
                    difficulty: taskDifficulty
                  }}
                  className="ml-3"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}
