/**
 * AI Prompts
 * Re-exports modularized prompt generation
 *
 * This file re-exports prompt functions from ./prompts/
 * Split into modules for better maintainability:
 *
 * - russian.ts: Russian language prompts (~565 lines)
 * - english.ts: English language prompts (~184 lines)
 * - helpers.ts: Constraint helpers
 * - types.ts: Shared interfaces
 */

export * from './prompts/index';
