/**
 * Enhanced Core Types - Deep TypeScript Integration
 * Designed for LLM code agents with maximum type safety
 */

import { z } from 'zod';

// ============================================================================
// Enhanced Type System for LLM Agents
// ============================================================================

/**
 * Strict value types that LLMs can understand and predict
 */
export type HyperScriptValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | HTMLElement 
  | HTMLElement[]
  | NodeList
  | Record<string, HyperScriptValue>
  | HyperScriptValue[];

/**
 * Strongly typed evaluation results with error handling
 */
export type EvaluationResult<T extends HyperScriptValue = HyperScriptValue> = {
  success: true;
  value: T;
  type: HyperScriptValueType;
} | {
  success: false;
  error: HyperScriptError;
  type: 'error';
};

/**
 * Runtime type validation schema
 */
export const HyperScriptValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.undefined(),
  z.instanceof(HTMLElement),
  z.array(z.instanceof(HTMLElement)),
  z.record(z.unknown()), // Will be refined recursively
  z.array(z.unknown())
]);

/**
 * Type-safe context with generic constraints
 */
export interface TypedExecutionContext<
  TMe extends HTMLElement | null = HTMLElement | null,
  TYou extends HTMLElement | null = HTMLElement | null,
  TIt extends HyperScriptValue = HyperScriptValue,
  TLocals extends Record<string, HyperScriptValue> = Record<string, HyperScriptValue>
> {
  /** Current element - strongly typed */
  readonly me: TMe;
  
  /** Target element - strongly typed */
  readonly you: TYou;
  
  /** Previous result - strongly typed */
  readonly it: TIt;
  
  /** Local variables - strongly typed */
  readonly locals: Map<string, HyperScriptValue>;
  
  /** Global variables - strongly typed */
  readonly globals: Map<string, HyperScriptValue>;
  
  /** Current result - strongly typed */
  result: HyperScriptValue;
  
  /** Execution metadata */
  readonly meta: ExecutionMeta;
}

export interface ExecutionMeta {
  readonly startTime: number;
  readonly commandStack: string[];
  readonly sourceLocation?: SourceLocation;
  readonly debugMode: boolean;
}

export interface SourceLocation {
  readonly line: number;
  readonly column: number;
  readonly source: string;
}

// ============================================================================
// Enhanced Command Interface for LLM Type Safety
// ============================================================================

/**
 * Generic command interface with input/output type constraints
 */
export interface TypedCommandImplementation<
  TInput extends readonly HyperScriptValue[] = readonly HyperScriptValue[],
  TOutput extends HyperScriptValue = HyperScriptValue,
  TContext extends TypedExecutionContext = TypedExecutionContext
> {
  /** Command name - must be literal for LLM understanding */
  readonly name: string;
  
  /** Human-readable syntax - for LLM documentation */
  readonly syntax: string;
  
  /** Detailed description for LLMs */
  readonly description: string;
  
  /** Input parameter schema for validation */
  readonly inputSchema: z.ZodSchema<TInput>;
  
  /** Output type information for LLMs */
  readonly outputType: HyperScriptValueType;
  
  /** Type-safe execution with validated inputs */
  execute(context: TContext, ...args: TInput): Promise<EvaluationResult<TOutput>>;
  
  /** Compile-time validation for static analysis */
  validate(args: unknown[]): ValidationResult;
  
  /** Runtime metadata */
  readonly metadata: CommandMetadata;
}

/**
 * Command metadata for LLM understanding
 */
export interface CommandMetadata {
  readonly category: CommandCategory;
  readonly complexity: 'simple' | 'medium' | 'complex';
  readonly sideEffects: SideEffect[];
  readonly examples: CommandExample[];
  readonly relatedCommands: string[];
}

export type CommandCategory = 
  | 'dom-manipulation'
  | 'event-handling' 
  | 'data-processing'
  | 'control-flow'
  | 'animation'
  | 'network'
  | 'utility';

export type SideEffect = 
  | 'dom-mutation'
  | 'network-request'
  | 'local-storage'
  | 'global-state'
  | 'event-emission'
  | 'timer-creation';

export interface CommandExample {
  readonly code: string;
  readonly description: string;
  readonly expectedOutput: HyperScriptValue;
}

// ============================================================================
// Enhanced Expression Interface
// ============================================================================

/**
 * Type-safe expression evaluation with return type inference
 */
export interface TypedExpressionImplementation<
  TOutput extends HyperScriptValue = HyperScriptValue,
  TContext extends TypedExecutionContext = TypedExecutionContext
> {
  readonly name: string;
  readonly category: ExpressionCategory;
  readonly precedence: number;
  readonly associativity: 'left' | 'right' | 'none';
  
  /** Output type for LLM inference */
  readonly outputType: HyperScriptValueType;
  
  /** Type-safe evaluation */
  evaluate(context: TContext, ...args: HyperScriptValue[]): Promise<EvaluationResult<TOutput>>;
  
  /** Static analysis information */
  readonly analysisInfo: ExpressionAnalysisInfo;
}

export interface ExpressionAnalysisInfo {
  readonly isPure: boolean;
  readonly canThrow: boolean;
  readonly complexity: 'O(1)' | 'O(n)' | 'O(n²)' | 'O(log n)';
  readonly dependencies: string[];
}

// ============================================================================
// Type System Enums and Utilities
// ============================================================================

export type HyperScriptValueType = 
  | 'string'
  | 'number' 
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'element'
  | 'element-list'
  | 'object'
  | 'array'
  | 'function'
  | 'promise';

export type ExpressionCategory = 
  | 'reference'
  | 'logical'
  | 'comparison'
  | 'arithmetic'
  | 'string'
  | 'array'
  | 'object'
  | 'conversion'
  | 'special';

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly suggestions: string[];
}

export interface ValidationError {
  readonly type: 'type-mismatch' | 'missing-argument' | 'invalid-syntax' | 'runtime-error';
  readonly message: string;
  readonly position?: SourceLocation;
  readonly suggestion?: string;
}

export interface HyperScriptError {
  readonly name: string;
  readonly message: string;
  readonly code: string;
  readonly source?: SourceLocation;
  readonly cause?: Error;
  readonly suggestions: string[];
}

// ============================================================================
// Runtime Type Utilities for LLM Agents
// ============================================================================

/**
 * Runtime type checking with detailed feedback for LLMs
 */
export class TypeChecker {
  static getType(value: unknown): HyperScriptValueType {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'function') return 'function';
    if (value instanceof Promise) return 'promise';
    if (value instanceof HTMLElement) return 'element';
    if (value instanceof NodeList || (Array.isArray(value) && value.every(v => v instanceof HTMLElement))) {
      return 'element-list';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    
    throw new Error(`Unknown type for value: ${value}`);
  }

  static validateType(value: unknown, expectedType: HyperScriptValueType): ValidationResult {
    const actualType = this.getType(value);
    
    if (actualType === expectedType) {
      return { isValid: true, errors: [], suggestions: [] };
    }
    
    return {
      isValid: false,
      errors: [{
        type: 'type-mismatch',
        message: `Expected ${expectedType}, got ${actualType}`,
        suggestion: this.getTypeSuggestion(actualType, expectedType)
      }],
      suggestions: [this.getTypeSuggestion(actualType, expectedType)]
    };
  }
  
  private static getTypeSuggestion(actual: HyperScriptValueType, expected: HyperScriptValueType): string {
    const conversions: Record<string, Record<string, string>> = {
      string: {
        number: 'Use parseFloat() or parseInt() to convert string to number',
        boolean: 'Use Boolean() or check if string is "true"/"false"',
      },
      number: {
        string: 'Use toString() or String() to convert number to string',
        boolean: 'Use Boolean() - 0 is false, everything else is true',
      },
      // Add more conversion suggestions...
    };
    
    return conversions[actual]?.[expected] || `Convert ${actual} to ${expected}`;
  }
}

// ============================================================================
// LLM-Friendly Documentation Types  
// ============================================================================

/**
 * Rich documentation for LLM understanding
 */
export interface LLMDocumentation {
  readonly summary: string;
  readonly parameters: ParameterDoc[];
  readonly returns: ReturnDoc;
  readonly examples: DocumentationExample[];
  readonly seeAlso: string[];
  readonly tags: string[];
}

export interface ParameterDoc {
  readonly name: string;
  readonly type: HyperScriptValueType;
  readonly description: string;
  readonly optional: boolean;
  readonly defaultValue?: HyperScriptValue;
  readonly examples: string[];
}

export interface ReturnDoc {
  readonly type: HyperScriptValueType;
  readonly description: string;
  readonly examples: HyperScriptValue[];
}

export interface DocumentationExample {
  readonly title: string;
  readonly code: string;
  readonly explanation: string;
  readonly output: HyperScriptValue;
}

// ============================================================================
// Export Enhanced Types
// ============================================================================

export type {
  HyperScriptValue,
  EvaluationResult,
  TypedExecutionContext,
  TypedCommandImplementation,
  TypedExpressionImplementation,
  ValidationResult,
  HyperScriptError
};