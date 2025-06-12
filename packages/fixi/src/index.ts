/**
 * @hyperfixi/fixi - Utility functions for hyperscript expressions
 * 
 * This package provides utility functions that extend hyperscript expressions
 * with common operations for strings, arrays, dates, DOM manipulation, and more.
 */

export * from './string/index.js';
export * from './date/index.js';
export * from './array/index.js';
export * from './dom/index.js';
export * from './performance/index.js';
export * from './integration/index.js';

// Re-export the original fixi.js for compatibility
export { default as originalFixi } from './fixi.js';

// Version information
export const version = '1.0.0';