/**
 * Variable Reference Extractor
 *
 * Extracts variable references: :varname, :count, :x
 * This is hyperscript-specific syntax for local variables.
 */

import type { ValueExtractor, ExtractionResult } from '../value-extractor-types';

/**
 * VariableRefExtractor - Extracts variable references (e.g., :count, :x).
 */
export class VariableRefExtractor implements ValueExtractor {
  readonly name = 'variable-ref';

  canExtract(input: string, position: number): boolean {
    return (
      input[position] === ':' &&
      position + 1 < input.length &&
      /[a-zA-Z_]/.test(input[position + 1])
    );
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.canExtract(input, position)) return null;

    // Start after ':'
    let length = 1;

    // Continue while we have identifier characters
    while (position + length < input.length && /[a-zA-Z0-9_]/.test(input[position + length])) {
      length++;
    }

    return {
      value: input.substring(position, position + length),
      length,
      metadata: {
        type: 'variable-reference',
      },
    };
  }
}
