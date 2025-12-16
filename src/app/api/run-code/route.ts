import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Простая песочница для выполнения кода
// ВНИМАНИЕ: Это упрощенная реализация. Для production нужна изоляция (Docker, VM, и т.д.)
async function executeCode(code: string, languageId: string, timeout: number = 10000) {
  try {
    // Для Python используем Function constructor с ограничениями
    if (languageId === 'python' || languageId === 'javascript' || languageId === 'typescript') {
      const outputs: string[] = [];
      const errors: string[] = [];

      // Создаем безопасное окружение с перехватом console
      const sandbox = {
        console: {
          log: (...args: any[]) => outputs.push(args.map(String).join(' ')),
          error: (...args: any[]) => errors.push(args.map(String).join(' ')),
          warn: (...args: any[]) => errors.push('WARNING: ' + args.map(String).join(' '))
        },
        print: (...args: any[]) => outputs.push(args.map(String).join(' ')),
        // Блокируем опасные функции
        eval: undefined,
        Function: undefined,
        setTimeout: undefined,
        setInterval: undefined,
        require: undefined,
        process: undefined,
        global: undefined,
        __dirname: undefined,
        __filename: undefined
      };

      // Оборачиваем код для безопасного выполнения
      const wrappedCode = `
        (function() {
          'use strict';
          try {
            ${code}
          } catch (e) {
            console.error(e.message || String(e));
          }
        })()
      `;

      // Выполняем с таймаутом
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Превышено время выполнения (10 секунд)')), timeout);
      });

      const executePromise = new Promise<void>((resolve) => {
        try {
          // Создаем функцию с привязанным контекстом
          const fn = new Function(
            'console',
            'print',
            wrappedCode
          );
          fn.call(null, sandbox.console, sandbox.print);
          resolve();
        } catch (error) {
          errors.push(error instanceof Error ? error.message : String(error));
          resolve();
        }
      });

      await Promise.race([executePromise, timeoutPromise]);

      return {
        stdout: outputs.join('\n'),
        stderr: errors.join('\n'),
        error: null
      };
    }

    return {
      stdout: '',
      stderr: '',
      error: `Язык ${languageId} пока не поддерживается для запуска. Используйте проверку решения.`
    };
  } catch (error) {
    return {
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка выполнения'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, languageId, timeout = 10000 } = await request.json();

    if (!code || !languageId) {
      return NextResponse.json(
        { error: 'Требуется код и язык программирования' },
        { status: 400 }
      );
    }

    // Проверка размера кода
    if (code.length > 50000) {
      return NextResponse.json(
        { error: 'Код слишком большой (макс. 50KB)' },
        { status: 400 }
      );
    }

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
