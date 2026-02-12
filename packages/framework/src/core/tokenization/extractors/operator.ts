/**
 * Operator Extractor - Handles programming language operators
 *
 * Extracts operators like +, -, *, /, =, >, <, >=, <=, !=, ===, etc.
 * Supports multi-character operators with longest-match priority.
 */

import type { ValueExtractor, ExtractionResult } from '../../../interfaces/value-extractor';

/**
 * Default operators for most programming languages.
 * Sorted longest-first for greedy matching.
 */
export const DEFAULT_OPERATORS = [
  // Three-character operators
  '===',
  '!==',
  '->',
  // Two-character operators
  '==',
  '!=',
  '<=',
  '>=',
  '&&',
  '||',
  '**',
  '+=',
  '-=',
  '*=',
  '/=',
  // Single-character operators
  '+',
  '-',
  '*',
  '/',
  '=',
  '>',
  '<',
  '!',
  '&',
  '|',
  '%',
  '^',
  '~',
];

/**
 * OperatorExtractor - Extracts programming language operators.
 */
export class OperatorExtractor implements ValueExtractor {
  readonly name = 'operator';

  constructor(private operators: string[] = DEFAULT_OPERATORS) {
    // Sort operators longest-first for greedy matching
    this.operators = [...operators].sort((a, b) => b.length - a.length);
  }

  canExtract(input: string, position: number): boolean {
    return this.operators.some(op => input.startsWith(op, position));
  }

  extract(input: string, position: number): ExtractionResult | null {
    // Find longest matching operator
    for (const op of this.operators) {
      if (input.startsWith(op, position)) {
        return {
          value: op,
          length: op.length,
        };
      }
    }

    return null;
  }
}
