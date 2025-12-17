/**
 * Test Arbitraries Helpers
 * Fixes fast-check compatibility with TypeScript strict mode
 */

import fc from 'fast-check';

/**
 * Creates an optional arbitrary that returns T | undefined instead of T | null
 * This matches TypeScript's optional properties behavior
 */
export function optional<T>(arb: fc.Arbitrary<T>): fc.Arbitrary<T | undefined> {
  return fc.option(arb, { nil: undefined });
}

/**
 * Creates a maybe arbitrary (alias for optional)
 */
export const maybe = optional;
