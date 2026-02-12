/**
 * Malay Keyword Extractor (Context-Aware)
 *
 * Handles Malay-specific identifier and keyword extraction with:
 * - Latin script (ASCII) character classification
 * - Space-separated words
 * - Simple structure (no morphology)
 * - Case-insensitive keyword matching
 *
 * This is the simplest extractor - Malay uses Latin script with spaces,
 * similar to English but without complex morphology or special features.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is ASCII letter or underscore (a-z, A-Z, _).
 */
function isAsciiLetter(char: string): boolean {
  return /[a-zA-Z_]/.test(char);
}

/**
 * Check if character is ASCII identifier character (a-z, A-Z, 0-9, _).
 */
function isAsciiIdentifierChar(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

/**
 * MalayKeywordExtractor - Context-aware extractor for Malay identifiers and keywords.
 */
export class MalayKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'malay-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isAsciiLetter(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('MalayKeywordExtractor: context not set');
    }

    let pos = position;
    let word = '';

    // Extract word (Latin characters only)
    while (pos < input.length && isAsciiIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    // Malay keywords are case-insensitive
    const lower = word.toLowerCase();

    // Look up keyword entry
    const keywordEntry = this.context.lookupKeyword(lower);
    const normalized =
      keywordEntry && keywordEntry.normalized !== keywordEntry.native
        ? keywordEntry.normalized
        : undefined;

    return {
      value: word,
      length: word.length,
      metadata: {
        normalized,
      },
    };
  }
}

/**
 * Create Malay-specific extractors.
 */
export function createMalayExtractors(): ContextAwareExtractor[] {
  return [new MalayKeywordExtractor()];
}
