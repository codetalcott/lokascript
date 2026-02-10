/**
 * Enhanced Type Definitions for Multi-Tenant Package
 * Local definitions to avoid cross-package import issues
 */

/**
 * Evaluation type for context output classification
 */
export type EvaluationType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Element'
  | 'ElementList'
  | 'Array'
  | 'Object'
  | 'Promise'
  | 'Context'
  | 'Null'
  | 'Undefined'
  | 'Any';

/**
 * Validation error with suggestions
 */
export interface ValidationError {
  readonly type: string;
  readonly message: string;
  readonly suggestions: readonly string[] | string[];
  readonly path?: string;
}

/**
 * Result of validation operations
 */
export interface ValidationResult<T = unknown> {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly suggestions: readonly string[] | string[];
}

/**
 * Result of evaluation operations
 */
export interface EvaluationResult<T = unknown> {
  readonly value?: T;
  readonly type?: EvaluationType | string;
  readonly success: boolean;
  readonly errors?: ValidationError[];
  readonly suggestions?: string[];
}

/**
 * Metadata for enhanced context implementations
 */
export interface ContextMetadata {
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  sideEffects?: string[];
  dependencies?: string[];
  returnTypes?: EvaluationType[];
  examples?: Array<{
    input: string;
    description: string;
    expectedOutput: string;
  }>;
  relatedContexts?: string[];
  relatedExpressions?: string[];
  frameworkDependencies?: string[];
  environmentRequirements?: {
    browser?: boolean;
    server?: boolean;
    nodejs?: boolean;
  };
  performance?: {
    averageTime: number;
    complexity: string;
  };
}

/**
 * LLM-compatible documentation structure
 */
export interface LLMDocumentation {
  summary: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    optional: boolean;
    examples: string[];
  }>;
  returns: {
    type: string;
    description: string;
    examples: unknown[];
  };
  examples: Array<{
    title: string;
    code: string;
    explanation: string;
    output: unknown;
  }>;
  seeAlso: string[];
  tags: string[];
}
