import { NextRequest, NextResponse } from 'next/server';
import { codeExecutionSchema } from '@/lib/validation/schemas';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/rate-limit';
import { errorHandler } from '@/lib/error-handler';
import { retryWithBackoff, isRetryableError } from '@/lib/sync/retry-logic';
import { logWarn, logError } from '@/lib/logger';
import type { PistonExecutionResult } from '@/types/database';

/**
 * API endpoint for executing code in a secure sandbox
 * Supports multiple programming languages
 */

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mapping for Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
};

interface ExecutionResult {
  result: PistonExecutionResult;
  executionTime: number;
}

export async function POST(request: NextRequest) {
  try {
    const rateState = evaluateRateLimit(request, RATE_LIMITS.API_GENERAL, {
      bucketId: 'execute-code'
    });

    if (!rateState.allowed) {
      return NextResponse.json(
        {
          error: 'Too many code executions',
          message: 'Please wait a few seconds and try again.'
        },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateState)
        }
      );
    }

    const rawBody = await request.json();
    let parsedBody: { code: string; language: string };
    try {
      parsedBody = codeExecutionSchema.parse(rawBody);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { code, language } = parsedBody;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Код и язык программирования обязательны' },
        { status: 400 }
      );
    }

    const languageConfig = LANGUAGE_MAP[language];
    if (!languageConfig) {
      logWarn('Unsupported language execution attempt', {
        component: 'api/execute-code',
        metadata: { language }
      });
      return NextResponse.json(
        { error: `Язык ${language} не поддерживается` },
        { status: 400 }
      );
    }

    const execution = await retryWithBackoff<ExecutionResult>(
      async () => {
        const startTime = Date.now();
        const response = await fetch(`${PISTON_API}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: languageConfig.language,
            version: languageConfig.version,
            files: [
              {
                name: getFileName(language),
                content: code,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка при выполнении кода: ${response.status}`);
        }

        const result = await response.json();
        return {
          result,
          executionTime: Date.now() - startTime,
        };
      },
      undefined,
      isRetryableError
    );

    if (!execution.success || !execution.result) {
      throw execution.error ?? new Error('Не удалось выполнить код');
    }

    const { result, executionTime } = execution.result;

    // Format output
    let output = '';
    if (result.run) {
      output = result.run.stdout || '';
      if (result.run.stderr) {
        output += '\n' + result.run.stderr;
      }
      if (result.run.code !== 0) {
        output += `\n❌ Программа завершена с ошибкой (код выхода: ${result.run.code})`;
      } else {
        output += `\n✅ Программа завершена успешно (код выхода: 0)`;
      }
    } else if (result.compile && result.compile.code !== 0) {
      output = `❌ Ошибка компиляции:\n${result.compile.stderr || result.compile.output}`;
    }

    output += `\n⏱️ Время выполнения: ${executionTime}ms`;

    return NextResponse.json({
      success: true,
      output: output.trim(),
      executionTime,
    });
  } catch (error) {
    logError('Error executing code', error as Error, {
      component: 'api/execute-code'
    });
    errorHandler.report(error as Error, {
      component: 'api/execute-code',
      action: 'POST'
    });
    return NextResponse.json(
      {
        error: 'Не удалось выполнить код. Попробуйте позже.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getFileName(language: string): string {
  const fileNames: Record<string, string> = {
    python: 'main.py',
    javascript: 'main.js',
    typescript: 'main.ts',
    java: 'Main.java',
    cpp: 'main.cpp',
    csharp: 'Main.cs',
    go: 'main.go',
  };
  return fileNames[language] || 'main.txt';
}
