/**
 * HyperFixi - Hyperscript Expression Evaluation Engine
 * Main entry point for the public API
 */

// Export the main API
export { hyperscript, type HyperscriptAPI, type CompilationResult } from './api/hyperscript-api.js';

// Export core types for advanced usage
export type { 
  ASTNode, 
  ExecutionContext, 
  ParseResult, 
  ParseError,
  Token,
  CommandNode,
  ExpressionNode
} from './types/core.js';

// Export utilities for direct usage
export { parse } from './parser/parser.js';
export { Runtime, type RuntimeOptions } from './runtime/runtime.js';
export { createContext, createChildContext } from './core/context.js';
export { Lexer, Tokens, type Token } from './tokenizer.js';

// Export the main API as default
export { default } from './api/hyperscript-api.js';