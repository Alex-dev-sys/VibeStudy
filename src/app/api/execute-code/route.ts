import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Код и язык программирования обязательны' },
        { status: 400 }
      );
    }

    const languageConfig = LANGUAGE_MAP[language];
    if (!languageConfig) {
      return NextResponse.json(
        { error: `Язык ${language} не поддерживается` },
        { status: 400 }
      );
    }

    // Execute code using Piston API
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

    const executionTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error('Ошибка при выполнении кода');
    }

    const result = await response.json();

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
    console.error('Error executing code:', error);
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
