'use client';

import { useState, useEffect } from 'react';
import { LazyMonacoEditor } from '@/lib/performance/lazy-components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { difficultyColorMap } from '@/lib/utils';
import type { GeneratedTask } from '@/types';
import { useTranslations } from '@/store/locale-store';

interface MiniCodeChallengeProps {
  task: GeneratedTask;
  taskNumber: number;
  totalTasks: number;
  isCompleted: boolean;
  languageId: string;
  monacoLanguage: string;
  day: number;
  onComplete: (taskId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  themeColors: Record<string, string>;
}

interface CheckResult {
  success: boolean;
  message: string;
  feedback?: string;
  score?: number;
}

export function MiniCodeChallenge({
  task,
  taskNumber,
  totalTasks,
  isCompleted,
  languageId,
  monacoLanguage,
  day,
  onComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  themeColors
}: MiniCodeChallengeProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [editorLoading, setEditorLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(true);

  const t = useTranslations();

  useEffect(() => {
    // Reset state when task changes
    setCode('');
    setOutput('');
    setCheckResult(null);
    setEditorLoading(true);
  }, [task.id]);

  useEffect(() => {
    // Update Telegram MainButton
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      if (checkResult?.success) {
        tg.MainButton.setText(hasNext ? t.common.next : t.onboarding.complete);
        tg.MainButton.show();
        tg.MainButton.onClick(hasNext ? onNext : () => tg.close());
      } else {
        tg.MainButton.hide();
      }
    }
  }, [checkResult, hasNext, t, onNext]);

  const handleCheck = async () => {
    setIsChecking(true);
    setCheckResult(null);
    setOutput(`🤖 ${t.taskModal.aiChecking}`);

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

      if (result.success) {
        onComplete(task.id);

        // Haptic feedback
        if (window.Telegram?.WebApp) {
          // Telegram WebApp doesn't have haptic feedback in the type, but it exists
          (window.Telegram.WebApp as any).HapticFeedback?.notificationOccurred('success');
        }
      }
    } catch (error) {
      setCheckResult(null);
      setOutput(`❌ ${t.taskModal.checkError}`);
      console.error('Check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const toggleEditor = () => {
    setShowEditor(!showEditor);
  };

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p style={{ color: themeColors['--tg-hint'] || '#ffffff80' }}>
          {t.errors.loadingFailed}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: themeColors['--tg-hint'] || '#ffffff80' }}
          >
            {taskNumber}/{totalTasks}
          </span>
          <Badge
            tone="accent"
            className={`text-xs ${difficultyColorMap[task.difficulty]}`}
          >
            {task.difficulty}
          </Badge>
          {isCompleted && (
            <Badge tone="accent" className="text-xs">
              ✓
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="rounded-lg px-3 py-1.5 text-xs transition-colors"
              style={{
                backgroundColor: themeColors['--tg-secondary-bg'] || '#ffffff10',
                color: themeColors['--tg-text'] || '#ffffff'
              }}
            >
              ← {t.common.previous}
            </button>
          )}
          {hasNext && !checkResult?.success && (
            <button
              onClick={onNext}
              className="rounded-lg px-3 py-1.5 text-xs transition-colors"
              style={{
                backgroundColor: themeColors['--tg-secondary-bg'] || '#ffffff10',
                color: themeColors['--tg-text'] || '#ffffff'
              }}
            >
              {t.onboarding.skip} →
            </button>
          )}
        </div>
      </div>

      {/* Task Prompt */}
      <div
        className="mb-3 rounded-xl p-3"
        style={{
          backgroundColor: themeColors['--tg-secondary-bg'] || '#ffffff10'
        }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: themeColors['--tg-text'] || '#ffffff' }}
        >
          {task.prompt}
        </h2>
        {task.solutionHint && (
          <p
            className="mt-2 text-xs"
            style={{ color: themeColors['--tg-hint'] || '#ffffff80' }}
          >
            💡 {task.solutionHint}
          </p>
        )}
      </div>

      {/* Editor Toggle Button */}
      <button
        onClick={toggleEditor}
        className="mb-2 w-full rounded-lg py-2 text-xs font-medium transition-colors"
        style={{
          backgroundColor: themeColors['--tg-button'] || '#ff0094',
          color: themeColors['--tg-button-text'] || '#ffffff'
        }}
      >
        {showEditor ? '📝 Hide Editor' : '📝 Show Editor'}
      </button>

      {/* Code Editor */}
      {showEditor && (
        <div className="mb-3 flex-1 overflow-hidden rounded-xl border" style={{ borderColor: '#ffffff20' }}>
          <LazyMonacoEditor
            height="250px"
            language={monacoLanguage}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val ?? '')}
            onMount={() => setEditorLoading(false)}
            loading={
              <div className="flex h-[250px] items-center justify-center" style={{ backgroundColor: '#00000060' }}>
                <div className="text-center">
                  <div className="mb-2 text-xl">⏳</div>
                  <p className="text-xs" style={{ color: themeColors['--tg-hint'] || '#ffffff80' }}>
                    {t.editor.loading}
                  </p>
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
              wordWrap: 'on'
            }}
          />
        </div>
      )}

      {/* Output */}
      {output && (
        <div
          className="mb-3 rounded-xl border p-3"
          style={{
            borderColor: checkResult?.success
              ? '#10b98180'
              : checkResult?.success === false
                ? '#f4343480'
                : '#ffffff20',
            backgroundColor: checkResult?.success
              ? '#10b98120'
              : checkResult?.success === false
                ? '#f4343420'
                : '#00000040',
            color: checkResult?.success
              ? '#6ee7b7'
              : checkResult?.success === false
                ? '#fca5a5'
                : themeColors['--tg-text'] || '#ffffff'
          }}
        >
          <pre className="whitespace-pre-wrap text-xs">{output}</pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCode('')}
          className="flex-1 text-xs"
        >
          {t.taskModal.clear}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCheck}
          isLoading={isChecking}
          disabled={isChecking || !code.trim()}
          className="flex-1 text-xs"
          style={{
            backgroundColor: themeColors['--tg-button'] || undefined,
            color: themeColors['--tg-button-text'] || undefined
          }}
        >
          {isChecking ? t.taskModal.checking : `✓ ${t.taskModal.checkSolution}`}
        </Button>
      </div>
    </div>
  );
}
