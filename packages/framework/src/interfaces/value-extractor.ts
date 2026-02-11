/**
 * Value Extractor Interface - Pluggable Tokenization
 *
 * Extracts typed values from input strings.
 * DSLs can provide custom extractors for their domain-specific syntax.
 */

/**
 * Extraction result with value and consumed length.
 */
export interface ExtractionResult {
  /** The extracted value */
  readonly value: string;

  /** Number of characters consumed */
  readonly length: number;

  /** Optional metadata about the extraction */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Value extractor - identifies and extracts typed values from input.
 */
export interface ValueExtractor {
  /** Name of this extractor (for debugging) */
  readonly name: string;

  /**
   * Check if this extractor can handle input at position.
   *
   * @param input - Full input string
   * @param position - Current position
   * @returns True if this extractor should try
   *
   * @example
   * // CSS selector extractor
   * canExtract('#button', 0) // → true (starts with #)
   * canExtract('button', 0)  // → false
   */
  canExtract(input: string, position: number): boolean;

  /**
   * Extract value from input at position.
   *
   * @param input - Full input string
   * @param position - Start position
   * @returns Extraction result or null if extraction failed
   *
   * @example
   * extract('#button', 0) // → { value: '#button', length: 7 }
   * extract('button', 0)  // → null (can't extract CSS selector)
   */
  extract(input: string, position: number): ExtractionResult | null;
}

/**
 * String literal extractor - handles quoted strings.
 */
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

/**
 * Number extractor - handles integers and floats.
 */
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

    return length > 0
      ? {
          value: input.substring(position, position + length),
          length,
        }
      : null;
  }
}

/**
 * Identifier extractor - handles variable/property names.
 */
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

/**
 * Whitespace extractor - handles spaces, tabs, newlines.
 */
export class WhitespaceExtractor implements ValueExtractor {
  readonly name = 'whitespace';

  canExtract(input: string, position: number): boolean {
    return /\s/.test(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    let length = 0;

    while (position + length < input.length && /\s/.test(input[position + length])) {
      length++;
    }

    return length > 0
      ? {
          value: input.substring(position, position + length),
          length,
        }
      : null;
  }
}
