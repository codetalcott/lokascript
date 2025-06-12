/**
 * Main Hyperscript API
 * Provides a clean, type-safe public interface for hyperscript compilation and execution
 */

import { parse } from '../parser/parser.js';
import { Runtime, type RuntimeOptions } from '../runtime/runtime.js';
import { createContext, createChildContext } from '../core/context.js';
import type { ASTNode, ExecutionContext, ParseError } from '../types/core.js';

// ============================================================================
// API Types
// ============================================================================

export interface CompilationResult {
  success: boolean;
  ast?: ASTNode;
  errors: ParseError[];
  tokens: import('../types/core.js').Token[];
  compilationTime: number;
}

export interface HyperscriptAPI {
  // Core compilation and execution
  compile(code: string): CompilationResult;
  execute(ast: ASTNode, context?: ExecutionContext): Promise<any>;
  run(code: string, context?: ExecutionContext): Promise<any>;
  
  // Context management
  createContext(element?: HTMLElement | null): ExecutionContext;
  createChildContext(parent: ExecutionContext, element?: HTMLElement | null): ExecutionContext;
  
  // Utilities
  isValidHyperscript(code: string): boolean;
  version: string;
  
  // Advanced
  createRuntime(options?: RuntimeOptions): Runtime;
  parse: typeof parse;
}

// ============================================================================
// Internal Runtime Instance
// ============================================================================

const defaultRuntime = new Runtime();

// ============================================================================
// API Implementation
// ============================================================================

/**
 * Compile hyperscript code into an Abstract Syntax Tree (AST)
 */
function compile(code: string): CompilationResult {
  // Input validation
  if (typeof code !== 'string') {
    throw new TypeError('Code must be a string');
  }

  const startTime = performance.now();
  
  try {
    const parseResult = parse(code);
    const compilationTime = performance.now() - startTime;
    
    if (parseResult.success && parseResult.node) {
      return {
        success: true,
        ast: parseResult.node,
        errors: [],
        tokens: parseResult.tokens,
        compilationTime
      };
    } else {
      return {
        success: false,
        errors: parseResult.error ? [parseResult.error] : [],
        tokens: parseResult.tokens,
        compilationTime
      };
    }
  } catch (error) {
    const compilationTime = performance.now() - startTime;
    
    return {
      success: false,
      errors: [{
        message: error instanceof Error ? error.message : 'Unknown compilation error',
        position: 0,
        line: 1,
        column: 1
      }],
      tokens: [],
      compilationTime
    };
  }
}

/**
 * Execute a compiled AST with the given execution context
 */
async function execute(ast: ASTNode, context?: ExecutionContext): Promise<any> {
  if (!ast) {
    throw new Error('AST is required for execution');
  }

  const executionContext = context || createContext();
  return await defaultRuntime.execute(ast, executionContext);
}

/**
 * Compile and execute hyperscript code in one operation
 */
async function run(code: string, context?: ExecutionContext): Promise<any> {
  const compiled = compile(code);
  
  if (!compiled.success) {
    const errorMsg = compiled.errors.length > 0 
      ? compiled.errors[0].message 
      : 'Unknown compilation error';
    throw new Error(`Compilation failed: ${errorMsg}`);
  }

  return await execute(compiled.ast!, context);
}

/**
 * Check if the given code is valid hyperscript syntax
 */
function isValidHyperscript(code: string): boolean {
  try {
    const result = compile(code);
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Create a new runtime instance with custom options
 */
function createRuntimeInstance(options?: RuntimeOptions): Runtime {
  return new Runtime(options);
}

/**
 * Get the current version of hyperfixi
 */
function getVersion(): string {
  // In a real implementation, this would be injected during build
  return '0.1.0';
}

// ============================================================================
// Public API Object
// ============================================================================

export const hyperscript: HyperscriptAPI = {
  // Core compilation and execution
  compile,
  execute,
  run,
  
  // Context management
  createContext,
  createChildContext,
  
  // Utilities
  isValidHyperscript,
  version: getVersion(),
  
  // Advanced
  createRuntime: createRuntimeInstance,
  parse
};

// ============================================================================
// Default Export
// ============================================================================

export default hyperscript;