/**
 * ASCII Identifier Extractor
 *
 * Generic extractor for ASCII identifiers used in non-Latin script tokenizers.
 * Handles basic ASCII word extraction (a-z, A-Z, 0-9, _, $).
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is valid ASCII identifier start (letter, underscore, dollar).
 */
function isAsciiIdentifierStart(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 95 || // _
    code === 36 // $
  );
}

/**
 * Check if character is valid ASCII identifier char (letter, digit, underscore, dollar).
 */
function isAsciiIdentifierChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 95 || // _
    code === 36 // $
  );
}

/**
 * AsciiIdentifierExtractor - Extracts ASCII identifiers in non-Latin script contexts.
 */
export class AsciiIdentifierExtractor implements ContextAwareExtractor {
  readonly name = 'ascii-identifier';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isAsciiIdentifierStart(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('AsciiIdentifierExtractor: context not set');
    }

    const startPos = position;
    let word = '';
    let pos = position;

    // Extract ASCII identifier
    while (pos < input.length && isAsciiIdentifierChar(input[pos])) {
      word += input[pos];
      pos++;
    }

    if (!word) return null;

    // Check if it's a keyword
    const keywordEntry = this.context.lookupKeyword(word);
    const normalized =
      keywordEntry && keywordEntry.normalized !== keywordEntry.native
        ? keywordEntry.normalized
        : undefined;

    return {
      value: word,
      length: pos - startPos,
      metadata: {
        normalized,
      },
    };
  }
}

/**
 * Create ASCII identifier extractor for mixed-script tokenizers.
 */
export function createAsciiIdentifierExtractor(): ContextAwareExtractor {
  return new AsciiIdentifierExtractor();
}
