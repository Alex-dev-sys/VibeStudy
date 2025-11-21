'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { difficultyColorMap } from '@/lib/utils';
import { useTranslations } from '@/store/locale-store';
import { getCurrentUser } from '@/lib/supabase/auth';
import { logError, logInfo } from '@/lib/logger';

interface ChallengeTask {
  description: string;
  input_format: string;
  output_format: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

interface TestCase {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

interface Challenge {
  id: string;
  date: string;
  language: string;
  problem: ChallengeTask;
  test_cases: TestCase[];
  difficulty: 'easy' | 'medium' | 'hard';
  metadata: {
    topics: string[];
    estimated_time_minutes: number;
  };
}

interface DailyChallengeProps {
  challenge: Challenge;
  languageId: string;
  monacoLanguage: string;
  onBack?: () => void;
}

interface CheckResult {
  success: boolean;
  message: string;
  passedTests: number;
  totalTests: number;
  failedTests?: Array<{
    input: string;
    expected: string;
    actual: string;
  }>;
}

export function DailyChallenge({
  challenge,
  languageId,
  monacoLanguage,
  onBack
}: DailyChallengeProps) {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const t = useTranslations();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    setIsAuthenticated(!!user);
  };

  const handleRunTests = async () => {
    if (!code.trim()) {
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    try {
      // Run code against test cases
      const visibleTests = challenge.test_cases.filter(tc => !tc.is_hidden);
      let passedCount = 0;
      const failedTests: Array<{ input: string; expected: string; actual: string }> = [];

      for (const testCase of visibleTests) {
        try {
          // Execute code with test input
          const response = await fetch('/api/execute-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              languageId,
              input: testCase.input
            })
          });

          if (!response.ok) {
            throw new Error('Execution failed');
          }

          const result = await response.json();
          const output = result.output?.trim() || '';
          const expected = testCase.expected_output.trim();

          if (output === expected) {
            passedCount++;
          } else {
            failedTests.push({
              input: testCase.input,
              expected: testCase.expected_output,
              actual: output
            });
          }
        } catch (error) {
          failedTests.push({
            input: testCase.input,
            expected: testCase.expected_output,
            actual: 'Error executing code'
          });
        }
      }

      const allPassed = passedCount === visibleTests.length;
      setCheckResult({
        success: allPassed,
        message: allPassed ? t.challenges.allTestsPassed : t.challenges.someTestsFailed,
        passedTests: passedCount,
        totalTests: visibleTests.length,
        failedTests: failedTests.length > 0 ? failedTests : undefined
      });

      // Auto-submit if all tests passed and user is authenticated
      if (allPassed && isAuthenticated) {
        await handleSubmit('passed');
      }

    } catch (error) {
      logError('Error running tests', error as Error, {
        component: 'DailyChallenge',
        action: 'runTests'
      });
      setCheckResult({
        success: false,
        message: t.errors.codeCheckFailed,
        passedTests: 0,
        totalTests: challenge.test_cases.filter(tc => !tc.is_hidden).length
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (status: 'passed' | 'failed') => {
    if (!isAuthenticated) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          code,
          language: languageId,
          status,
          testResults: checkResult
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      logInfo('Challenge submitted', {
        component: 'DailyChallenge',
        action: 'submit',
        metadata: { challengeId: challenge.id, status }
      });

    } catch (error) {
      logError('Error submitting challenge', error as Error, {
        component: 'DailyChallenge',
        action: 'submit'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-white/60 hover:text-white transition-colors"
            >
              ← {t.common.back}
            </button>
          )}
          <h2 className="text-2xl font-bold text-white">
            {t.challenges.todayChallenge}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent" className={difficultyColorMap[challenge.difficulty]}>
            {challenge.difficulty}
          </Badge>
          <span className="text-sm text-white/60">
            {challenge.metadata.estimated_time_minutes} {t.challenges.minutes}
          </span>
        </div>
      </div>

      {/* Problem Description */}
      <div className="rounded-xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">
          {t.challenges.description}
        </h3>
        <p className="text-white/80 mb-4 whitespace-pre-wrap">
          {challenge.problem.description}
        </p>

        {/* Topics */}
        {challenge.metadata.topics.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-white/60 mb-2">{t.challenges.topics}:</p>
            <div className="flex flex-wrap gap-2">
              {challenge.metadata.topics.map((topic, idx) => (
                <Badge key={idx} tone="soft" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input/Output Format */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">
              {t.challenges.inputFormat}
            </h4>
            <p className="text-sm text-white/70">{challenge.problem.input_format}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">
              {t.challenges.outputFormat}
            </h4>
            <p className="text-sm text-white/70">{challenge.problem.output_format}</p>
          </div>
        </div>

        {/* Examples */}
        {challenge.problem.examples.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">
              {t.challenges.examples}
            </h4>
            {challenge.problem.examples.map((example, idx) => (
              <div key={idx} className="mb-3 p-3 rounded-lg bg-black/20">
                <div className="grid md:grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs text-white/50 mb-1">{t.challenges.input}:</p>
                    <pre className="text-sm text-white/90 font-mono">{example.input}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">{t.challenges.output}:</p>
                    <pre className="text-sm text-white/90 font-mono">{example.output}</pre>
                  </div>
                </div>
                {example.explanation && (
                  <p className="text-xs text-white/60 mt-2">
                    {t.challenges.explanation}: {example.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {challenge.problem.constraints.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">
              {t.challenges.constraints}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {challenge.problem.constraints.map((constraint, idx) => (
                <li key={idx} className="text-sm text-white/70">
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="rounded-xl overflow-hidden border border-white/10">
        <div className="bg-white/5 px-4 py-2 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">
            {t.challenges.yourSolution}
          </h3>
        </div>
        <Editor
          height="400px"
          language={monacoLanguage}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val ?? '')}
          options={{
            fontSize: 14,
            fontLigatures: true,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            wordWrap: 'on'
          }}
        />
      </div>

      {/* Test Results */}
      {checkResult && (
        <div
          className={`rounded-xl p-4 border ${
            checkResult.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">
              {checkResult.success ? '✅' : '❌'} {checkResult.message}
            </h4>
            <span className="text-sm text-white/70">
              {checkResult.passedTests}/{checkResult.totalTests} {t.challenges.passed}
            </span>
          </div>

          {checkResult.failedTests && checkResult.failedTests.length > 0 && (
            <div className="mt-3 space-y-2">
              {checkResult.failedTests.map((test, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-black/20">
                  <p className="text-xs text-white/50 mb-1">{t.challenges.input}:</p>
                  <pre className="text-sm text-white/90 font-mono mb-2">{test.input}</pre>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-white/50 mb-1">{t.challenges.expected}:</p>
                      <pre className="text-sm text-green-400 font-mono">{test.expected}</pre>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">{t.challenges.actual}:</p>
                      <pre className="text-sm text-red-400 font-mono">{test.actual}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => setCode('')}
          disabled={isChecking || isSubmitting}
        >
          {t.taskModal.clear}
        </Button>
        <Button
          variant="primary"
          onClick={handleRunTests}
          isLoading={isChecking}
          disabled={isChecking || isSubmitting || !code.trim()}
          className="flex-1"
        >
          {isChecking ? t.challenges.runningTests : t.challenges.runTests}
        </Button>
      </div>

      {!isAuthenticated && (
        <p className="text-sm text-white/50 text-center">
          {t.challenges.authRequired}
        </p>
      )}
    </div>
  );
}
