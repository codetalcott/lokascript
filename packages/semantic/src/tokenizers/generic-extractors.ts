/**
 * Generic Value Extractors for Semantic Package
 *
 * Shared extractors (StringLiteralExtractor, NumberExtractor, IdentifierExtractor)
 * are re-exported from @lokascript/framework. Domain-specific extractors
 * (OperatorExtractor, PunctuationExtractor) remain here.
 */

import type { ValueExtractor, ExtractionResult } from './value-extractor-types';

// =============================================================================
// Re-exported from framework (canonical implementations)
// Import + re-export pattern: creates local bindings AND exports
// =============================================================================

import {
  StringLiteralExtractor,
  NumberExtractor,
  IdentifierExtractor,
} from '@lokascript/framework';

export { StringLiteralExtractor, NumberExtractor, IdentifierExtractor };

// =============================================================================
// Operator Extractor (semantic-specific)
// =============================================================================

const DEFAULT_OPERATORS = [
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

export class OperatorExtractor implements ValueExtractor {
  readonly name = 'operator';

  private operators: string[];

  constructor(operators: string[] = DEFAULT_OPERATORS) {
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

// =============================================================================
// Punctuation Extractor (semantic-specific)
// =============================================================================

const DEFAULT_PUNCTUATION = '()[]{},:;';

export class PunctuationExtractor implements ValueExtractor {
  readonly name = 'punctuation';

  constructor(private punctuation: string = DEFAULT_PUNCTUATION) {}

  canExtract(input: string, position: number): boolean {
    return this.punctuation.includes(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    const char = input[position];

    if (this.punctuation.includes(char)) {
      return {
        value: char,
        length: 1,
      };
    }

    return null;
  }
}

// =============================================================================
// Helper Function
// =============================================================================

/**
 * Get default extractors for generic programming-language-style DSLs.
 */
export function getDefaultExtractors(): ValueExtractor[] {
  return [
    new StringLiteralExtractor(),
    new NumberExtractor(),
    new OperatorExtractor(),
    new PunctuationExtractor(),
    new IdentifierExtractor(),
  ];
}
