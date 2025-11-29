// Command Handlers Registry

import type { BotResponse } from '@/types/telegram';
import { handleStartCommand } from './start';
import { handleHelpCommand } from './help';
import { handleStatsCommand } from './stats';
import { handleProgressCommand } from './progress';
import { handleTopicsCommand } from './topics';
import { handleSettingsCommand } from './settings';
import { handleAdviceCommand } from './advice';
import { handleAskCommand } from './ask';
import { handleHintCommand } from './hint';
import { handlePredictCommand } from './predict';
import { handlePlanCommand } from './plan';
import { handleRemindCommand } from './remind';
import { handleLanguageCommand } from './language';
import { handlePrivacyCommand } from './privacy';
import { handleChallengeCommand } from './challenge';
import { handleScheduleCommand } from './schedule';
import { handleExportCommand } from './export';
import { handleMenuCommand } from './menu';
import { handleRunCommand } from './run';

export type CommandHandler = (
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
) => Promise<BotResponse>;

export const commandHandlers: Record<string, CommandHandler> = {
  '/start': handleStartCommand,
  '/help': handleHelpCommand,
  '/stats': handleStatsCommand,
  '/progress': handleProgressCommand,
  '/topics': handleTopicsCommand,
  '/settings': handleSettingsCommand,
  '/advice': handleAdviceCommand,
  '/ask': handleAskCommand,
  '/hint': handleHintCommand,
  '/predict': handlePredictCommand,
  '/plan': handlePlanCommand,
  '/remind': handleRemindCommand,
  '/language': handleLanguageCommand,
  '/privacy': handlePrivacyCommand,
  '/challenge': handleChallengeCommand,
  '/schedule': handleScheduleCommand,
  '/export': handleExportCommand,
  '/menu': handleMenuCommand,
  '/run': handleRunCommand,
};

