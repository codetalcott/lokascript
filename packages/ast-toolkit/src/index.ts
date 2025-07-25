/**
 * HyperFixi AST Toolkit
 * Advanced AST analysis and manipulation tools for hyperscript
 */

// Re-export all types
export type * from './types.js';

// Core visitor pattern functionality - WORKING
export {
  ASTVisitor,
  visit,
  findNodes,
  findFirst,
  getAncestors,
  createTypeCollector,
  measureDepth,
  countNodeTypes
} from './visitor/index.js';

// Query engine functionality - BASIC FUNCTIONALITY
export {
  query,
  queryAll,
  parseSelector,
  queryXPath
} from './query/index.js';

// Pattern matching functionality - IN DEVELOPMENT
export {
  matchPattern,
  parsePattern,
  extractPatterns,
  matchWildcard,
  createPatternMatcher,
  applyPatternTemplate,
  createPatternTemplate
} from './pattern-matching/index.js';

// Placeholder exports for future modules
export const analyzer = {
  // Will be implemented
};

export const transformer = {
  // Will be implemented  
};

export const generator = {
  // Will be implemented
};

export const ai = {
  // Will be implemented
};