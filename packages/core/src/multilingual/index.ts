/**
 * Multilingual Module
 *
 * Provides unified multilingual support by bridging the semantic
 * parsing package with the grammar transformation package.
 *
 * Key exports:
 * - SemanticGrammarBridge: Main class for parsing and transformation
 * - translate: Convenience function for simple translations
 * - semanticNodeToParsedStatement: Convert between representations
 */

export {
  // Bridge class
  SemanticGrammarBridge,
  // Utilities
  semanticNodeToParsedStatement,
  // Convenience functions
  getDefaultBridge,
  translate,
  // Types
  type BridgeConfig,
  type BridgeResult,
} from './bridge';
