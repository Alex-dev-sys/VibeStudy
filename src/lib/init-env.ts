/**
 * Environment Initialization
 * Must be imported at app startup to validate environment
 */

import { validateEnv, isProductionReady } from './env-validator';

// Validate environment on module load
const validation = validateEnv();

if (!validation.valid) {
  console.error('\n❌ Environment Validation Failed!\n');
  console.error('Missing required environment variables:');
  validation.missing.forEach((varName) => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease check .env.example for required variables.\n');

  if (process.env.NODE_ENV === 'production') {
    // In production, fail fast
    throw new Error('Missing required environment variables');
  } else {
    // In development, warn but continue
    console.warn('\n⚠️  Continuing in development mode with missing variables\n');
  }
}

if (validation.warnings.length > 0 && process.env.NODE_ENV === 'development') {
  console.warn('\n⚠️  Optional environment variables not set:');
  validation.warnings.forEach((varName) => {
    console.warn(`  - ${varName}`);
  });
  console.warn('\nSome features may be disabled. Check .env.example for details.\n');
}

// Production readiness check
if (process.env.NODE_ENV === 'production') {
  if (!isProductionReady()) {
    throw new Error('Environment not ready for production deployment');
  }
}

export { validation };
