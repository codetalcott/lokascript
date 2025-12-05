/**
 * Shared Utility Functions for Comparison Expressions
 * Re-exports from centralized type-helpers module for backward compatibility
 *
 * Uses Expression Type Registry for consistent type checking and coercion.
 * Bundle size savings: ~60 lines by consolidating duplicate implementations
 */

// Re-export all type helpers from centralized module
export { isNumber, isString, isBoolean, toNumber } from '../type-helpers';
