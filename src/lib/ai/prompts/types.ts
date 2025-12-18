/**
 * Prompt Type Definitions
 * Shared types for AI prompt generation
 */

export interface PromptParams {
  day: number;
  languageId: string;
  dayTopic?: string;
  dayDescription?: string;
  previousDaySummary?: string;
}

export interface ExtendedRequestBody extends PromptParams {
  theorySummary: string;
  locale?: 'ru' | 'en';
}
