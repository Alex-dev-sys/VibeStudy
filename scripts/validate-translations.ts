#!/usr/bin/env ts-node
/**
 * Translation Coverage Validation Script
 * 
 * This script validates that all translation keys exist in both locales
 * and that the structure is consistent between ru.ts and en.ts
 */

import { ru } from '../src/lib/i18n/locales/ru';
import { en } from '../src/lib/i18n/locales/en';

type TranslationValue = string | Record<string, any>;

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalKeys: number;
    missingInEn: number;
    missingInRu: number;
    typeMismatches: number;
  };
}

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

function getValueAtPath(obj: Record<string, any>, path: string): any {
  const keys = path.split('.');
  let result: any = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined;
    }
  }
  
  return result;
}

function getTypeOf(value: any): string {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function validateTranslations(): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    stats: {
      totalKeys: 0,
      missingInEn: 0,
      missingInRu: 0,
      typeMismatches: 0
    }
  };

  // Get all keys from both locales
  const ruKeys = getAllKeys(ru);
  const enKeys = getAllKeys(en);
  
  const allKeys = new Set([...ruKeys, ...enKeys]);
  result.stats.totalKeys = allKeys.size;

  console.log('🔍 Validating translations...\n');
  console.log(`Total unique keys: ${result.stats.totalKeys}`);
  console.log(`Russian keys: ${ruKeys.length}`);
  console.log(`English keys: ${enKeys.length}\n`);

  // Check for missing keys
  for (const key of allKeys) {
    const ruValue = getValueAtPath(ru, key);
    const enValue = getValueAtPath(en, key);

    if (ruValue === undefined) {
      result.errors.push(`❌ Missing in Russian: ${key}`);
      result.stats.missingInRu++;
      result.success = false;
    }

    if (enValue === undefined) {
      result.errors.push(`❌ Missing in English: ${key}`);
      result.stats.missingInEn++;
      result.success = false;
    }

    // Check type consistency
    if (ruValue !== undefined && enValue !== undefined) {
      const ruType = getTypeOf(ruValue);
      const enType = getTypeOf(enValue);

      if (ruType !== enType) {
        result.errors.push(
          `❌ Type mismatch for "${key}": Russian is ${ruType}, English is ${enType}`
        );
        result.stats.typeMismatches++;
        result.success = false;
      }

      // Warn about empty strings
      if (typeof ruValue === 'string' && ruValue.trim() === '') {
        result.warnings.push(`⚠️  Empty string in Russian: ${key}`);
      }
      if (typeof enValue === 'string' && enValue.trim() === '') {
        result.warnings.push(`⚠️  Empty string in English: ${key}`);
      }
    }
  }

  return result;
}

// Run validation
const result = validateTranslations();

// Print results
console.log('═══════════════════════════════════════');
console.log('VALIDATION RESULTS');
console.log('═══════════════════════════════════════\n');

if (result.errors.length > 0) {
  console.log('ERRORS:\n');
  result.errors.forEach(error => console.log(error));
  console.log('');
}

if (result.warnings.length > 0) {
  console.log('WARNINGS:\n');
  result.warnings.forEach(warning => console.log(warning));
  console.log('');
}

console.log('STATISTICS:');
console.log(`  Total keys: ${result.stats.totalKeys}`);
console.log(`  Missing in English: ${result.stats.missingInEn}`);
console.log(`  Missing in Russian: ${result.stats.missingInRu}`);
console.log(`  Type mismatches: ${result.stats.typeMismatches}`);
console.log('');

if (result.success) {
  console.log('✅ All translations are valid!');
  process.exit(0);
} else {
  console.log('❌ Translation validation failed!');
  console.log(`   Found ${result.errors.length} error(s)`);
  process.exit(1);
}
