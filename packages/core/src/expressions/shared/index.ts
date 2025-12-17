/**
 * Shared Expression Primitives
 *
 * Phase 2 Consolidation: Central export point for shared utilities
 *
 * These primitives break the coupling between expression classes and enable:
 * - Expressions to be thin wrappers (~20-30 lines each)
 * - No inter-expression dependencies
 * - Consistent behavior across all expression categories
 *
 * Usage:
 *   import { toNumber, compareValues, validateBinaryInput } from '../shared';
 */

// Number utilities
export {
  toNumber,
  toNumberOrNull,
  ensureFinite,
  isNumeric,
  safeDivide,
  safeModulo,
} from './number-utils';

// Comparison utilities
export {
  compareValues,
  coerceToComparable,
  areStrictlyEqual,
  areLooselyEqual,
  isGreaterThan,
  isLessThan,
  isGreaterThanOrEqual,
  isLessThanOrEqual,
  type ComparisonOperator,
} from './comparison-utils';

// Validation utilities
export {
  validResult,
  invalidResult,
  createError,
  validateBinaryInput,
  validateUnaryInput,
  validateNotNull,
  validateNumber,
  validateString,
  validateBoolean,
  combineValidations,
} from './validation-utils';
