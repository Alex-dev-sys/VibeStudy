/**
 * useTaskModal Hook
 * Manages all business logic for TaskModal component
 */

import { useState, useEffect, useCallback } from 'react';
import { useKnowledgeProfileStore } from '@/store/knowledge-profile-store';
import { useTranslations, useLocaleStore } from '@/store/locale-store';
import { announceLiveRegion } from '@/lib/accessibility/focus-manager';
import type { GeneratedTask } from '@/types';

export interface CheckResult {
  success: boolean;
  message: string;
  feedback?: string;
  suggestions?: string[];
  score?: number;
}

export interface HintResult {
  hint: string;
  example?: string;
  nextSteps?: string[];
}

interface UseTaskModalProps {
  task: GeneratedTask;
  languageId: string;
  day: number;
  topic: string;
  onComplete: (taskId: string) => void;
  isOpen: boolean;
}

export function useTaskModal({
  task,
  languageId,
  day,
  topic,
  onComplete,
  isOpen,
}: UseTaskModalProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const t = useTranslations();
  const { locale } = useLocaleStore();
  const recordAttempt = useKnowledgeProfileStore((state) => state.recordAttempt);
  const updateTopicMastery = useKnowledgeProfileStore((state) => state.updateTopicMastery);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartTime(Date.now());
      setAttemptsCount(0);
      setHints([]);
      setCheckResult(null);
      setOutput('');
      setShowSuggestions(false);
      setShowConfetti(false);
    }
  }, [isOpen, task.id]);

  const handleCheck = useCallback(async () => {
    setIsChecking(true);
    setCheckResult(null);
    setOutput(`🤖 ${t.taskModal.aiChecking}`);
    setShowSuggestions(false);

    const newAttemptsCount = attemptsCount + 1;
    setAttemptsCount(newAttemptsCount);

    try {
      const response = await fetch('/api/check-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          task: {
            title: task.prompt,
            description: task.prompt,
            difficulty: task.difficulty,
            hints: task.solutionHint ? [task.solutionHint] : []
          },
          languageId,
          locale
        })
      });

      if (!response.ok) {
        throw new Error(t.errors.codeCheckFailed);
      }

      const result: CheckResult = await response.json();
      setCheckResult(result);

      const statusMessage = result.success ? t.taskModal.solutionCorrect : t.taskModal.solutionIncorrect;
      let outputText = result.success
        ? `✅ ${statusMessage}\n\n${result.feedback || ''}`
        : `❌ ${statusMessage}\n\n${result.feedback || ''}`;

      if (result.score !== undefined) {
        outputText += `\n\n📊 ${t.feedback.score}: ${result.score}/100`;
      }

      setOutput(outputText);
      setShowSuggestions((result.suggestions?.length || 0) > 0);

      const announcement = result.success
        ? `${t.notifications.taskCompleted} ${t.feedback.score}: ${result.score || 100}/100`
        : `${result.message}`;
      announceLiveRegion(announcement, 'assertive');

      // Record attempt
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const errors: string[] = [];
      if (!result.success && result.feedback) {
        errors.push(result.feedback);
      }

      recordAttempt({
        taskId: task.id,
        day,
        languageId,
        attempts: newAttemptsCount,
        hintsUsed: hints.length,
        timeSpent,
        completed: result.success,
        score: result.score || 0,
        errors,
        timestamp: Date.now()
      });

      if (result.success) {
        updateTopicMastery(topic, day, result.score || 100, newAttemptsCount);
        onComplete(task.id);
        setShowConfetti(true);
        announceLiveRegion(`${t.notifications.congratulations} ${t.notifications.taskCompleted}`, 'assertive');
      }
    } catch (error) {
      setCheckResult(null);
      setOutput(`❌ ${t.taskModal.checkError}`);
      console.error('Check error:', error);
      announceLiveRegion(t.taskModal.checkError, 'assertive');
    } finally {
      setIsChecking(false);
    }
  }, [code, task, languageId, locale, attemptsCount, hints.length, startTime, day, topic, onComplete, t, recordAttempt, updateTopicMastery]);

  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      setOutput('❌ Введите код для запуска');
      return;
    }

    setIsRunning(true);
    setCheckResult(null);
    setOutput('▶️ Запуск кода...');

    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          languageId,
          timeout: 10000
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось запустить код');
      }

      const result = await response.json();

      let outputText = '▶️ Результат выполнения:\n\n';

      if (result.stdout) {
        outputText += `📤 Вывод:\n${result.stdout}\n\n`;
      }

      if (result.stderr) {
        outputText += `⚠️ Ошибки:\n${result.stderr}\n\n`;
      }

      if (result.error) {
        outputText += `❌ Ошибка выполнения:\n${result.error}`;
      }

      if (!result.stdout && !result.stderr && !result.error) {
        outputText += '✅ Код выполнен успешно (нет вывода)';
      }

      setOutput(outputText);
    } catch (error) {
      setOutput(`❌ Ошибка запуска: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      console.error('Run error:', error);
    } finally {
      setIsRunning(false);
    }
  }, [code, languageId]);

  const handleGetHint = useCallback(async () => {
    setIsLoadingHint(true);

    try {
      const response = await fetch('/api/get-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          task: {
            title: task.prompt,
            description: task.prompt,
            difficulty: task.difficulty
          },
          languageId,
          errorMessage: checkResult && !checkResult.success ? checkResult.feedback : undefined,
          attemptNumber: attemptsCount + 1,
          locale
        })
      });

      if (!response.ok) {
        throw new Error(t.errors.hintFailed);
      }

      const result: HintResult = await response.json();
      setHints([...hints, result.hint]);

      let hintOutput = `💡 ${t.taskModal.hintOutput}:\n\n${result.hint}`;

      if (result.example) {
        hintOutput += `\n\n📝 ${t.taskModal.example}:\n${result.example}`;
      }

      if (result.nextSteps && result.nextSteps.length > 0) {
        hintOutput += `\n\n✨ ${t.taskModal.nextSteps}:\n`;
        result.nextSteps.forEach((step, i) => {
          hintOutput += `${i + 1}. ${step}\n`;
        });
      }

      setOutput(hintOutput);
    } catch (error) {
      setOutput(`❌ ${t.errors.hintFailed}`);
      console.error('Hint error:', error);
    } finally {
      setIsLoadingHint(false);
    }
  }, [code, task, languageId, checkResult, attemptsCount, locale, hints, t]);

  const clearCode = useCallback(() => {
    setCode('');
  }, []);

  return {
    // State
    code,
    setCode,
    output,
    isChecking,
    isRunning,
    checkResult,
    hints,
    isLoadingHint,
    showSuggestions,
    showConfetti,
    setShowConfetti,

    // Handlers
    handleCheck,
    handleRun,
    handleGetHint,
    clearCode,
  };
}
