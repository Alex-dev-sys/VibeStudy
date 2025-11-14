'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { difficultyColorMap } from '@/lib/utils';
import type { GeneratedTask } from '@/types';
import { useKnowledgeProfileStore } from '@/store/knowledge-profile-store';
import { useScrollLock } from '@/hooks/useScrollLock';

interface TaskModalProps {
  task: GeneratedTask;
  taskNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  isCompleted: boolean;
  languageId: string;
  monacoLanguage: string;
  day: number;
  topic: string;
  isViewMode?: boolean;
}

interface CheckResult {
  success: boolean;
  message: string;
  feedback?: string;
  suggestions?: string[];
  score?: number;
}

interface HintResult {
  hint: string;
  example?: string;
  nextSteps?: string[];
}

export function TaskModal({
  task,
  taskNumber,
  isOpen,
  onClose,
  onComplete,
  isCompleted,
  languageId,
  monacoLanguage,
  day,
  topic,
  isViewMode = false
}: TaskModalProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true);
  const [editorError, setEditorError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  const recordAttempt = useKnowledgeProfileStore((state) => state.recordAttempt);
  const updateTopicMastery = useKnowledgeProfileStore((state) => state.updateTopicMastery);

  useScrollLock(isOpen);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStartTime(Date.now());
      setAttemptsCount(0);
      setHints([]);
      setCheckResult(null);
      setOutput('');
      setShowSuggestions(false);
      setEditorLoading(true);
      setEditorError(false);
      setShowConfetti(false);
    }
  }, [isOpen, task.id]);

  const handleCheck = async () => {
    setIsChecking(true);
    setCheckResult(null);
    setOutput('🤖 ИИ проверяет ваше решение...');
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
          languageId
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось проверить код');
      }

      const result: CheckResult = await response.json();
      setCheckResult(result);
      
      // Формируем вывод
      let outputText = result.success 
        ? `✅ ${result.message}\n\n${result.feedback || ''}`
        : `❌ ${result.message}\n\n${result.feedback || ''}`;
      
      if (result.score !== undefined) {
        outputText += `\n\n📊 Оценка: ${result.score}/100`;
      }
      
      setOutput(outputText);
      setShowSuggestions((result.suggestions?.length || 0) > 0);

      // Сохраняем попытку в профиль знаний
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

      // Обновляем мастерство по теме
      if (result.success) {
        updateTopicMastery(topic, day, result.score || 100, newAttemptsCount);
        onComplete(task.id);
        setShowConfetti(true);
      }
    } catch (error) {
      setCheckResult(null);
      setOutput('❌ Ошибка при проверке кода. Попробуйте позже.');
      console.error('Ошибка проверки:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleGetHint = async () => {
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
          attemptNumber: attemptsCount + 1
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось получить подсказку');
      }

      const result: HintResult = await response.json();
      setHints([...hints, result.hint]);
      
      let hintOutput = `💡 Подсказка:\n\n${result.hint}`;
      
      if (result.example) {
        hintOutput += `\n\n📝 Пример:\n${result.example}`;
      }
      
      if (result.nextSteps && result.nextSteps.length > 0) {
        hintOutput += '\n\n✨ Следующие шаги:\n';
        result.nextSteps.forEach((step, i) => {
          hintOutput += `${i + 1}. ${step}\n`;
        });
      }
      
      setOutput(hintOutput);
    } catch (error) {
      setOutput('❌ Не удалось получить подсказку. Попробуйте позже.');
      console.error('Ошибка получения подсказки:', error);
    } finally {
      setIsLoadingHint(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 md:p-6 overscroll-contain">
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            colors={['#ff0094', '#ff5bc8', '#ffd200', '#ff84ff']}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel-foreground relative flex max-h-[95vh] w-full max-w-5xl flex-col gap-3 overflow-y-auto rounded-2xl p-4 sm:max-h-[90vh] sm:gap-4 sm:rounded-3xl sm:p-6 md:p-8"
        >
          {/* Заголовок */}
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xs text-white/50 sm:text-sm">Задача #{taskNumber}</span>
                <Badge tone="accent" className={`text-xs sm:text-sm ${difficultyColorMap[task.difficulty]}`}>
                  {task.difficulty}
                </Badge>
                {isCompleted && <Badge tone="accent" className="text-xs sm:text-sm">✓ Выполнено</Badge>}
                {isViewMode && <Badge tone="neutral" className="text-xs sm:text-sm">👁️ Просмотр</Badge>}
              </div>
              <h2 className="mt-2 text-base font-semibold text-white sm:text-lg md:text-xl">{task.prompt}</h2>
              {task.solutionHint && <p className="mt-2 text-xs text-white/60 sm:text-sm">💡 Подсказка: {task.solutionHint}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:p-2"
            >
              ✕
            </button>
          </div>

          {/* Редактор кода */}
          <div className="flex-1 overflow-hidden rounded-xl border border-white/10 sm:rounded-2xl">
            {editorError ? (
              <div className="flex h-[300px] flex-col items-center justify-center gap-4 bg-black/60 p-6">
                <span className="text-4xl">⚠️</span>
                <p className="text-center text-sm text-white/70">
                  Не удалось загрузить редактор кода.
                  <br />
                  Используйте текстовое поле ниже:
                </p>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Напишите код на ${languageId}...`}
                  className="h-40 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm text-white placeholder-white/40 focus:border-accent/50 focus:outline-none"
                />
              </div>
            ) : (
              <Editor
                height="250px"
                language={monacoLanguage}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val ?? '')}
                onMount={() => {
                  setEditorLoading(false);
                }}
                loading={
                  <div className="flex h-[250px] items-center justify-center bg-black/60">
                    <div className="text-center">
                      <div className="mb-3 text-2xl">⏳</div>
                      <p className="text-sm text-white/60">Загрузка редактора...</p>
                    </div>
                  </div>
                }
                options={{
                  fontSize: 12,
                  fontLigatures: true,
                  automaticLayout: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  readOnly: isViewMode
                }}
              />
            )}
          </div>

          {/* Результат проверки */}
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
            </div>
          )}

          {/* Рекомендации по улучшению */}
          {showSuggestions && checkResult && checkResult.suggestions && checkResult.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 sm:rounded-2xl sm:p-4"
            >
              <h4 className="mb-2 text-sm font-semibold text-blue-200">💡 Рекомендации по улучшению:</h4>
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

          {/* История подсказок */}
          {hints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 sm:rounded-2xl sm:p-4"
            >
              <h4 className="mb-2 text-sm font-semibold text-purple-200">
                💡 Использовано подсказок: {hints.length}
              </h4>
              <div className="space-y-2 text-xs text-purple-200/80 sm:text-sm">
                {hints.map((hint, i) => (
                  <div key={i} className="border-l-2 border-purple-500/40 pl-3">
                    <span className="font-semibold">Подсказка {i + 1}:</span> {hint}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Кнопки */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <Button variant="ghost" size="md" onClick={onClose} className="order-3 w-full min-h-touch text-xs sm:order-1 sm:w-auto sm:text-sm">
              Закрыть
            </Button>
            {!isViewMode && (
              <div className="order-1 flex gap-2 sm:order-2 sm:gap-3">
                <Button 
                  variant="ghost" 
                  size="md" 
                  onClick={handleGetHint} 
                  isLoading={isLoadingHint}
                  disabled={isLoadingHint || isChecking}
                  className="flex-1 min-h-touch text-xs sm:flex-none sm:text-sm"
                >
                  {isLoadingHint ? 'Думаю...' : '💡 Подсказка'}
                </Button>
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={() => setCode('')} 
                  className="flex-1 min-h-touch text-xs sm:flex-none sm:text-sm"
                >
                  Очистить
                </Button>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={handleCheck}
                  isLoading={isChecking}
                  disabled={isChecking || !code.trim()} 
                  className="flex-1 min-h-touch text-xs sm:flex-none sm:text-sm"
                >
                  {isChecking ? 'Проверка...' : '✓ Проверить'}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

