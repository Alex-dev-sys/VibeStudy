// /run Command Handler
// Execute code directly from Telegram

import type { BotResponse } from '@/types/telegram';
import { upsertConversation } from '../database';

export async function handleRunCommand(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse> {
  if (!userId) {
    return {
      text: '⚠️ Сначала зарегистрируйся на сайте VibeStudy.',
      parseMode: 'Markdown'
    };
  }

  // Check if code provided in command
  if (args.length > 0) {
    const code = args.join(' ');
    return await executeCode(userId, telegramUserId, code, 'python'); // default to python
  }

  // Set conversation context to wait for code
  await upsertConversation({
    user_id: userId,
    telegram_user_id: telegramUserId,
    conversation_context: {
      waiting_for_input: true,
      expected_input_type: 'code_execution',
      temp_data: {
        language: 'python'
      }
    },
    last_interaction_at: new Date().toISOString()
  });

  const text = `💻 *Code Runner*

Отправь код для выполнения:

**Примеры:**

\`\`\`python
print("Hello, World!")
\`\`\`

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

\`\`\`typescript
const greeting: string = "Hello";
console.log(greeting);
\`\`\`

**Поддерживаемые языки:**
• Python
• JavaScript
• TypeScript
• Java
• C++
• Go
• C#

Просто отправь код, и я его запущу! ⚡`;

  return {
    text,
    parseMode: 'Markdown',
    replyMarkup: {
      inline_keyboard: [
        [
          { text: '🐍 Python', callback_data: 'run:lang:python' },
          { text: '📜 JavaScript', callback_data: 'run:lang:javascript' }
        ],
        [
          { text: '📘 TypeScript', callback_data: 'run:lang:typescript' },
          { text: '☕ Java', callback_data: 'run:lang:java' }
        ],
        [
          { text: '⚡ C++', callback_data: 'run:lang:cpp' },
          { text: '🐹 Go', callback_data: 'run:lang:go' }
        ],
        [
          { text: '🔙 Назад', callback_data: 'btn_menu' }
        ]
      ]
    }
  };
}

/**
 * Execute code and return results
 */
export async function executeCode(
  userId: string,
  telegramUserId: number,
  code: string,
  language: string
): Promise<BotResponse> {
  try {
    // Call the execute-code API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/execute-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();

    // Format execution result
    const success = result.success || result.status === 'success';
    const output = result.output || result.stdout || '';
    const error = result.error || result.stderr || '';
    const executionTime = result.executionTime || result.runtime || 0;

    if (success && output) {
      // Truncate long output
      const truncatedOutput = output.length > 2000
        ? output.substring(0, 2000) + '\n...\n(вывод обрезан)'
        : output;

      return {
        text: `✅ *Код выполнен успешно!*\n\n` +
          `⏱️ Время: ${executionTime}ms\n\n` +
          `📤 *Вывод:*\n\`\`\`\n${truncatedOutput}\n\`\`\``,
        parseMode: 'Markdown',
        replyMarkup: {
          inline_keyboard: [
            [
              { text: '🔄 Запустить снова', callback_data: 'run:again' },
              { text: '🔙 Меню', callback_data: 'btn_menu' }
            ]
          ]
        }
      };
    } else if (error) {
      // Truncate long errors
      const truncatedError = error.length > 1500
        ? error.substring(0, 1500) + '\n...'
        : error;

      return {
        text: `❌ *Ошибка выполнения*\n\n` +
          `⏱️ Время: ${executionTime}ms\n\n` +
          `🐛 *Ошибка:*\n\`\`\`\n${truncatedError}\n\`\`\`\n\n` +
          `💡 Проверь синтаксис и попробуй снова!`,
        parseMode: 'Markdown',
        replyMarkup: {
          inline_keyboard: [
            [
              { text: '🔄 Попробовать снова', callback_data: 'run:again' },
              { text: '❓ Спросить AI', callback_data: 'ask:error' }
            ],
            [
              { text: '🔙 Меню', callback_data: 'btn_menu' }
            ]
          ]
        }
      };
    } else {
      return {
        text: `✅ *Код выполнен*\n\n` +
          `⏱️ Время: ${executionTime}ms\n\n` +
          `ℹ️ Программа не вернула вывод.`,
        parseMode: 'Markdown'
      };
    }
  } catch (error) {
    console.error('Code execution error:', error);

    return {
      text: `❌ *Не удалось выполнить код*\n\n` +
        `Произошла ошибка на сервере. Попробуй позже или используй веб-версию.\n\n` +
        `Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`,
      parseMode: 'Markdown',
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🔙 Меню', callback_data: 'btn_menu' }
          ]
        ]
      }
    };
  }
}

/**
 * Detect language from code block
 */
export function detectLanguage(code: string): string {
  // Check for code block with language specification
  const codeBlockMatch = code.match(/^```(\w+)/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }

  // Heuristic detection
  if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
    return 'python';
  }
  if (code.includes('console.log') || code.includes('const ') || code.includes('let ')) {
    return 'javascript';
  }
  if (code.includes(': ') && (code.includes('interface ') || code.includes('type '))) {
    return 'typescript';
  }
  if (code.includes('public class') || code.includes('System.out.println')) {
    return 'java';
  }
  if (code.includes('#include') || code.includes('std::')) {
    return 'cpp';
  }
  if (code.includes('func ') || code.includes('package main')) {
    return 'go';
  }
  if (code.includes('Console.WriteLine') || code.includes('namespace ')) {
    return 'csharp';
  }

  // Default to python
  return 'python';
}

/**
 * Clean code block (remove markdown formatting)
 */
export function cleanCodeBlock(text: string): string {
  // Remove code block markers
  let cleaned = text.replace(/^```\w*\n?/, '').replace(/```$/, '');
  return cleaned.trim();
}
