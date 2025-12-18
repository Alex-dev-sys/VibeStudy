/**
 * AI Prompts Index
 * Main entry point for prompt generation
 */

import type { PromptParams, ExtendedRequestBody } from './types';
import { buildRussianPrompt } from './russian';
import { buildEnglishPrompt } from './english';

export type { PromptParams, ExtendedRequestBody };

export const buildPrompt = ({
  day,
  languageId,
  dayTopic,
  dayDescription,
  previousDaySummary,
  locale = 'ru'
}: ExtendedRequestBody) => {
  const params: PromptParams = { day, languageId, dayTopic, dayDescription, previousDaySummary };
  if (locale === 'en') {
    return buildEnglishPrompt(params);
  }
  return buildRussianPrompt(params);
};
