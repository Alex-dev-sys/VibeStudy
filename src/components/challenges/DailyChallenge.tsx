'use client';

import { useState, useEffect } from 'react';
import { LazyMonacoEditor } from '@/lib/performance/lazy-components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { difficultyColorMap } from '@/lib/utils';
import { useTranslations } from '@/store/locale-store';
import { getCurrentUser } from '@/lib/supabase/auth';
import { logError, logInfo } from '@/lib/logger';
import { ArrowLeft, Play, RotateCcw, CheckCircle, AlertCircle, Clock, Code2, FileText, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors ring-1 ring-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {t.challenges.todayChallenge}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge tone="accent" className={difficultyColorMap[challenge.difficulty]}>
                {challenge.difficulty}
              </Badge>
              <span className="text-sm text-white/50 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {challenge.metadata.estimated_time_minutes} {t.challenges.minutes}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
           <Button
            variant="secondary"
            onClick={() => setCode('')}
            disabled={isChecking || isSubmitting}
            className="h-10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t.taskModal.clear}
          </Button>
          <Button
            variant="primary"
            onClick={handleRunTests}
            isLoading={isChecking}
            disabled={isChecking || isSubmitting || !code.trim()}
            className="h-10 min-w-[140px]"
          >
            {!isChecking && <Play className="mr-2 h-4 w-4 fill-current" />}
            {isChecking ? t.challenges.runningTests : t.challenges.runTests}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Column: Task Description */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-200px)]">
          <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {t.challenges.description}
              </h3>
            </div>
            
            <div className="prose prose-invert max-w-none text-white/80">
              <p className="whitespace-pre-wrap leading-relaxed">
                {challenge.problem.description}
              </p>
            </div>

            {/* Topics */}
            {challenge.metadata.topics.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-semibold">{t.challenges.topics}</p>
                <div className="flex flex-wrap gap-2">
                  {challenge.metadata.topics.map((topic, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-white/60 border border-white/5">
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input/Output & Constraints */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#1e1e1e] p-5 shadow-lg ring-1 ring-white/5">
              <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-white/40" />
                {t.challenges.inputFormat}
              </h4>
              <p className="text-sm text-white/60 leading-relaxed">{challenge.problem.input_format}</p>
            </div>
            <div className="rounded-xl bg-[#1e1e1e] p-5 shadow-lg ring-1 ring-white/5">
              <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-white/40" />
                {t.challenges.outputFormat}
              </h4>
              <p className="text-sm text-white/60 leading-relaxed">{challenge.problem.output_format}</p>
            </div>
          </div>

          {/* Examples */}
          {challenge.problem.examples.length > 0 && (
            <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-purple-400" />
                {t.challenges.examples}
              </h4>
              <div className="space-y-4">
                {challenge.problem.examples.map((example, idx) => (
                  <div key={idx} className="rounded-lg bg-black/30 overflow-hidden ring-1 ring-white/5">
                    <div className="grid grid-cols-2 border-b border-white/5">
                      <div className="p-3 border-r border-white/5">
                        <span className="text-xs text-white/40 block mb-1">{t.challenges.input}</span>
                        <code className="text-sm text-white/80 font-mono">{example.input}</code>
                      </div>
                      <div className="p-3">
                        <span className="text-xs text-white/40 block mb-1">{t.challenges.output}</span>
                        <code className="text-sm text-white/80 font-mono">{example.output}</code>
                      </div>
                    </div>
                    {example.explanation && (
                      <div className="p-3 bg-white/[0.02]">
                        <p className="text-xs text-white/50">
                          <span className="font-semibold text-white/60">{t.challenges.explanation}:</span> {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {challenge.problem.constraints.length > 0 && (
            <div className="rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
               <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                {t.challenges.constraints}
              </h4>
              <ul className="space-y-2">
                {challenge.problem.constraints.map((constraint, idx) => (
                  <li key={idx} className="text-sm text-white/60 flex items-start gap-2">
                    <span className="block w-1 h-1 mt-2 rounded-full bg-white/40 flex-shrink-0" />
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Editor & Results */}
        <div className="flex flex-col h-full min-h-[600px]">
          {/* Editor Container */}
          <div className="flex-1 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-lg ring-1 ring-white/5 flex flex-col">
            <div className="flex items-center justify-between bg-white/5 px-4 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <span className="ml-2 text-xs font-medium text-white/50 font-mono">{t.challenges.yourSolution}</span>
              </div>
              <div className="text-xs text-white/30 font-mono">{monacoLanguage}</div>
            </div>
            
            <div className="flex-1 relative">
              <LazyMonacoEditor
                height="100%"
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
                  wordWrap: 'on',
                  padding: { top: 16, bottom: 16 }
                }}
              />
            </div>
          </div>

          {/* Test Results */}
          {checkResult && (
            <div className="mt-4">
              <div
                className={cn(
                  "rounded-xl p-5 ring-1 shadow-lg transition-all duration-300",
                  checkResult.success
                    ? 'bg-green-500/10 ring-green-500/30'
                    : 'bg-red-500/10 ring-red-500/30'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className={cn("text-base font-semibold flex items-center gap-2", checkResult.success ? 'text-green-400' : 'text-red-400')}>
                    {checkResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    {checkResult.message}
                  </h4>
                  <span className="text-sm font-mono bg-black/20 px-2 py-1 rounded">
                    {checkResult.passedTests}/{checkResult.totalTests} tests passed
                  </span>
                </div>

                {checkResult.failedTests && checkResult.failedTests.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {checkResult.failedTests.map((test, idx) => (
                      <div key={idx} className="rounded-lg bg-black/30 overflow-hidden text-sm ring-1 ring-white/5">
                         <div className="p-2 bg-white/5 text-white/40 text-xs font-mono border-b border-white/5">
                           Input: {test.input}
                         </div>
                         <div className="grid grid-cols-2">
                           <div className="p-2 border-r border-white/5 bg-green-500/5">
                             <div className="text-[10px] text-green-500/50 mb-1 uppercase font-bold">Expected</div>
                             <div className="font-mono text-green-400">{test.expected}</div>
                           </div>
                           <div className="p-2 bg-red-500/5">
                             <div className="text-[10px] text-red-500/50 mb-1 uppercase font-bold">Actual</div>
                             <div className="font-mono text-red-400">{test.actual}</div>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20 text-center">
              <p className="text-sm text-blue-300">
                {t.challenges.authRequired}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
