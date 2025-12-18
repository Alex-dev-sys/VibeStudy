import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@/lib/core/logger';
import { evaluateRateLimit, buildRateLimitHeaders, RATE_LIMITS } from '@/lib/core/rate-limit';

export const dynamic = 'force-dynamic';

// Request validation schema
const runCodeSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50000, 'Code is too large (max 50KB)'),
  languageId: z.enum(['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'], {
    errorMap: () => ({ message: 'Invalid language' })
  }),
  timeout: z.number().int().min(1000).max(30000).optional().default(10000),
});

// Маппинг языков проекта на языки Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' }
};

/**
 * Безопасное выполнение кода через Piston API
 * Piston - это открытый сервис для изолированного выполнения кода
 * @see https://github.com/engineer-man/piston
 */
async function executeCode(code: string, languageId: string, timeout: number = 10000) {
  try {
    const pistonConfig = LANGUAGE_MAP[languageId];

    if (!pistonConfig) {
      return {
        stdout: '',
        stderr: '',
        error: `Язык ${languageId} пока не поддерживается для запуска. Используйте проверку решения.`
      };
    }

    // Используем публичный Piston API или собственный инстанс
    const pistonUrl = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

    const response = await fetch(`${pistonUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonConfig.language,
        version: pistonConfig.version,
        files: [
          {
            name: 'main',
            content: code,
          },
        ],
        stdin: '',
        args: [],
        compile_timeout: timeout,
        run_timeout: timeout,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
      signal: AbortSignal.timeout(timeout + 2000), // Добавляем буфер к таймауту
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    return {
      stdout: result.run?.stdout || '',
      stderr: result.run?.stderr || result.compile?.stderr || '',
      error: result.run?.code !== 0 && result.run?.stderr
        ? 'Ошибка выполнения кода'
        : null
    };
  } catch (error) {
    // Если Piston недоступен, возвращаем информативную ошибку
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        stdout: '',
        stderr: '',
        error: 'Превышено время выполнения (10 секунд)'
      };
    }

    logError('Piston API error', error as Error, { languageId });

    return {
      stdout: '',
      stderr: '',
      error: 'Сервис выполнения кода временно недоступен. Используйте проверку решения.'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 code executions per minute
    const rateLimit = await evaluateRateLimit(request, { limit: 20, windowMs: 60 * 1000 }, { bucketId: 'code-execution' });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Превышен лимит запросов. Попробуйте через ${rateLimit.retryAfterSeconds} секунд.`,
          stdout: '',
          stderr: ''
        },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimit)
        }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = runCodeSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          error: firstError.message,
          stdout: '',
          stderr: ''
        },
        { status: 400 }
      );
    }

    const { code, languageId, timeout } = validationResult.data;

    const result = await executeCode(code, languageId, timeout);

    return NextResponse.json(result);
  } catch (error) {
    logError('Error running code', error as Error, {
      component: 'api/run-code'
    });

    return NextResponse.json(
      {
        stdout: '',
        stderr: '',
        error: 'Не удалось выполнить код'
      },
      { status: 500 }
    );
  }
}
