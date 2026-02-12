/**
 * Punctuation Extractor - Handles punctuation characters
 *
 * Extracts punctuation like parentheses, brackets, braces, commas, colons, semicolons.
 * Each character is extracted individually (no multi-character punctuation).
 */

import type { ValueExtractor, ExtractionResult } from '../../../interfaces/value-extractor';

/**
 * Default punctuation characters for most programming languages.
 */
export const DEFAULT_PUNCTUATION = '()[]{},:;';

/**
 * PunctuationExtractor - Extracts punctuation characters.
 */
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
