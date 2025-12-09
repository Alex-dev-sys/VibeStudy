/**
 * Environment Variables Validator
 * Validates required environment variables at startup
 */

import { logError, logWarn, logInfo } from './logger';

interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

const ENV_VARIABLES: EnvVariable[] = [
  // Supabase
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: false,
    description: 'Supabase service role key (for admin operations)',
  },

  // AI Services
  {
    name: 'AI_API_TOKEN',
    required: false,
    description: 'AI API token (GPT Lama or alternative)',
  },
  {
    name: 'HF_TOKEN',
    required: false,
    description: 'Hugging Face API token',
  },
  {
    name: 'AI_API_BASE_URL',
    required: false,
    description: 'AI API base URL',
    defaultValue: 'https://api.gptlama.ru/v1',
  },
  {
    name: 'HF_API_BASE_URL',
    required: false,
    description: 'Hugging Face API base URL',
  },
  {
    name: 'HF_MODEL',
    required: false,
    description: 'AI model name',
    defaultValue: 'gemini-1.5-flash',
  },

  // Telegram Bot
  {
    name: 'TELEGRAM_BOT_TOKEN',
    required: false,
    description: 'Telegram bot token',
  },
  {
    name: 'TELEGRAM_WEBHOOK_SECRET',
    required: false,
    description: 'Telegram webhook secret for verification',
  },
  {
    name: 'TELEGRAM_WEBHOOK_URL',
    required: false,
    description: 'Telegram webhook URL',
  },

  // TON Blockchain
  {
    name: 'TON_WALLET_ADDRESS',
    required: false,
    description: 'TON wallet address for payments',
  },
  {
    name: 'TONCENTER_API_KEY',
    required: false,
    description: 'TON Center API key',
  },
  {
    name: 'TON_API_KEY',
    required: false,
    description: 'TON API key',
  },

  // CRON Jobs
  {
    name: 'CRON_SECRET',
    required: true,
    description: 'Secret for securing CRON endpoints',
  },

  // App Configuration
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    description: 'Public site URL',
    defaultValue: 'https://vibestudy.ru',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Public app URL',
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Node environment',
    defaultValue: 'development',
  },

  // Logging
  {
    name: 'LOG_LEVEL',
    required: false,
    description: 'Logging level',
    defaultValue: 'info',
  },
];

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate environment variables
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARIABLES) {
    const value = process.env[envVar.name];

    if (!value) {
      if (envVar.required) {
        missing.push(envVar.name);
        logError(
          `Missing required environment variable: ${envVar.name}`,
          new Error(`${envVar.description}`),
          { component: 'env-validator' }
        );
      } else {
        warnings.push(envVar.name);
        logWarn(
          `Optional environment variable not set: ${envVar.name} - ${envVar.description}`,
          { component: 'env-validator' }
        );
      }
    }
  }

  // Additional validations
  validateAIConfiguration(missing, warnings);
  validateTelegramConfiguration(warnings);
  validateTONConfiguration(warnings);

  const valid = missing.length === 0;

  if (valid) {
    logInfo('Environment validation passed', {
      component: 'env-validator',
      metadata: {
        warnings: warnings.length,
        optional: warnings,
      },
    });
  } else {
    logError(
      'Environment validation failed',
      new Error(`Missing required variables: ${missing.join(', ')}`),
      {
        component: 'env-validator',
        metadata: { missing },
      }
    );
  }

  return {
    valid,
    missing,
    warnings,
  };
}

/**
 * Validate AI configuration
 */
function validateAIConfiguration(missing: string[], warnings: string[]): void {
  const hasAIToken = process.env.AI_API_TOKEN || process.env.HF_TOKEN;

  if (!hasAIToken) {
    warnings.push('AI_SERVICES');
    logWarn(
      'No AI API token configured (AI_API_TOKEN or HF_TOKEN). AI features will be disabled.',
      { component: 'env-validator' }
    );
  }
}

/**
 * Validate Telegram configuration
 */
function validateTelegramConfiguration(warnings: string[]): void {
  const hasTelegramToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const hasTelegramWebhookSecret = !!process.env.TELEGRAM_WEBHOOK_SECRET;

  if (hasTelegramToken && !hasTelegramWebhookSecret && process.env.NODE_ENV === 'production') {
    warnings.push('TELEGRAM_WEBHOOK_SECRET');
    logWarn(
      'Telegram bot configured without webhook secret. Webhooks will be insecure in production.',
      { component: 'env-validator' }
    );
  }
}

/**
 * Validate TON configuration
 */
function validateTONConfiguration(warnings: string[]): void {
  const hasTONWallet = !!process.env.TON_WALLET_ADDRESS;
  const hasTONAPI = !!process.env.TON_API_KEY || !!process.env.TONCENTER_API_KEY;

  if (hasTONWallet && !hasTONAPI) {
    warnings.push('TON_API');
    logWarn(
      'TON wallet configured without API key. Payment verification may not work.',
      { component: 'env-validator' }
    );
  }
}

/**
 * Check if environment is properly configured for production
 */
export function isProductionReady(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const result = validateEnv();

  // Additional production checks
  const productionIssues: string[] = [];

  if (!process.env.CRON_SECRET) {
    productionIssues.push('CRON_SECRET is required for production');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    productionIssues.push('SUPABASE_SERVICE_ROLE_KEY recommended for production');
  }

  if (productionIssues.length > 0) {
    logError(
      'Production environment issues detected',
      new Error(productionIssues.join(', ')),
      {
        component: 'env-validator',
        metadata: { issues: productionIssues },
      }
    );
    return false;
  }

  return result.valid;
}

/**
 * Get environment variable with validation
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Get environment variable with default
 */
export function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}
