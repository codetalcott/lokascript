/**
 * Generic Value Extractors for Semantic Package
 *
 * These are copies of the framework's generic extractors, maintained separately
 * to avoid circular dependencies between framework and semantic packages.
 *
 * Canonical versions: @lokascript/framework/src/core/tokenization/extractors/
 */

import type { ValueExtractor, ExtractionResult } from './value-extractor-types';

// =============================================================================
// String Literal Extractor
// =============================================================================

export class StringLiteralExtractor implements ValueExtractor {
  readonly name = 'string-literal';

  canExtract(input: string, position: number): boolean {
    const char = input[position];
    return char === '"' || char === "'" || char === '`';
  }

  extract(input: string, position: number): ExtractionResult | null {
    const quote = input[position];
    let length = 1;
    let escaped = false;

    while (position + length < input.length) {
      const char = input[position + length];

      if (escaped) {
        escaped = false;
        length++;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        length++;
        continue;
      }

      if (char === quote) {
        length++; // Include closing quote
        return {
          value: input.substring(position, position + length),
          length,
        };
      }

      length++;
    }

    // Unterminated string
    return null;
  }
}

// =============================================================================
// Number Extractor
// =============================================================================

export class NumberExtractor implements ValueExtractor {
  readonly name = 'number';

  canExtract(input: string, position: number): boolean {
    return /\d/.test(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    let length = 0;
    let hasDecimal = false;

    while (position + length < input.length) {
      const char = input[position + length];

      if (/\d/.test(char)) {
        length++;
      } else if (char === '.' && !hasDecimal) {
        hasDecimal = true;
        length++;
      } else {
        break;
      }
    }

    if (length === 0) return null;

    // Check for time unit suffixes: ms, s, m, h
    const numValue = input.substring(position, position + length);
    const afterNum = position + length;

    // Try to match time units
    if (afterNum < input.length) {
      const remaining = input.slice(afterNum);

      // Try 'ms' first (2 chars)
      if (remaining.startsWith('ms')) {
        return {
          value: numValue + 'ms',
          length: length + 2,
          metadata: { hasTimeUnit: true },
        };
      }

      // Try single-char units: s, m, h
      // Make sure it's followed by non-letter (word boundary)
      if (/^[smh](?![a-zA-Z])/.test(remaining)) {
        return {
          value: numValue + remaining[0],
          length: length + 1,
          metadata: { hasTimeUnit: true },
        };
      }
    }

    return {
      value: numValue,
      length,
    };
  }
}

// =============================================================================
// Identifier Extractor
// =============================================================================

export class IdentifierExtractor implements ValueExtractor {
  readonly name = 'identifier';

  canExtract(input: string, position: number): boolean {
    return /[a-zA-Z_]/.test(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    let length = 0;

    while (position + length < input.length) {
      const char = input[position + length];
      if (/[a-zA-Z0-9_]/.test(char)) {
        length++;
      } else {
        break;
      }
    }

    return length > 0
      ? {
          value: input.substring(position, position + length),
          length,
        }
      : null;
  }
}

// =============================================================================
// Operator Extractor
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
// Punctuation Extractor
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
