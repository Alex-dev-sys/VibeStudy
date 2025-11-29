# Telegram Bot Commands

Unified command handlers for the VibeStudy Telegram Bot.

## Architecture

Each command is a separate module that exports a handler function:

```typescript
export async function handleCommandName(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse>
```

## Available Commands

### Basic Commands
- **/start** - Welcome message and bot initialization
- **/help** - List all available commands
- **/menu** - Show main menu with quick actions

### Progress & Stats
- **/stats** - Current statistics summary
- **/progress** - Detailed progress overview
- **/topics** - Topic mastery levels
- **/predict** - Predict completion date based on current pace

### Learning
- **/challenge** - Get today's coding challenge
- **/plan** - Get personalized learning plan
- **/schedule** - View/update study schedule

### AI Assistance
- **/ask [question]** - Ask AI Mentor a question
- **/hint [task_id]** - Get a hint for current task
- **/advice** - Get personalized learning advice

### Settings
- **/settings** - Bot preferences
- **/language** - Change language (ru/en)
- **/remind** - Configure reminders
- **/privacy** - Privacy settings and data export

### Data Management
- **/export** - Export your data (GDPR compliance)

## Adding New Commands

1. Create a new file in `src/lib/telegram/commands/your-command.ts`
2. Export a handler function matching the signature above
3. Register the command in `index.ts`:

```typescript
import { handleYourCommand } from './your-command';

export const commandHandlers: Record<string, CommandHandler> = {
  // ...
  '/your-command': handleYourCommand,
};
```

4. Add help text to `help.ts`

## Command Guidelines

- Keep handlers focused and single-responsibility
- Use async/await for all async operations
- Return structured BotResponse objects
- Include inline keyboards for interactive commands
- Handle errors gracefully - never throw
- Log important events for debugging
- Support both Russian and English (via locale)

## Example Command

```typescript
// src/lib/telegram/commands/example.ts
import type { BotResponse } from '@/types/telegram';

export async function handleExampleCommand(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse> {
  return {
    text: '✅ Example command executed!',
    parseMode: 'Markdown',
    replyMarkup: {
      inline_keyboard: [
        [{ text: '🔙 Back', callback_data: 'btn_menu' }]
      ]
    }
  };
}
```
