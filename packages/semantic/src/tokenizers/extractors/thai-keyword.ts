/**
 * Thai Keyword Extractor (Context-Aware)
 *
 * Handles Thai-specific identifier and keyword extraction with:
 * - Thai script (U+0E00-U+0E7F) character classification
 * - No space separation between words
 * - Longest-match greedy keyword matching
 * - Embedded ASCII identifier support
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is in the Thai script range (U+0E00-U+0E7F).
 */
function isThai(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x0e00 && code <= 0x0e7f;
}

/**
 * Check if character is ASCII identifier character (a-z, A-Z, 0-9, _).
 */
function isAsciiIdentifierChar(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

/**
 * ThaiKeywordExtractor - Context-aware extractor for Thai identifiers and keywords.
 */
export class ThaiKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'thai-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isThai(input[position]) || isAsciiIdentifierChar(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('ThaiKeywordExtractor: context not set');
    }

    const char = input[position];

    // Handle Thai script
    if (isThai(char)) {
      return this.extractThaiWord(input, position);
    }

    // Handle ASCII identifiers
    if (isAsciiIdentifierChar(char)) {
      return this.extractAsciiWord(input, position);
    }

    return null;
  }

  /**
   * Extract Thai word with longest-match greedy keyword matching.
   * Thai has no spaces between words, so we need to match the longest keyword first.
   */
  private extractThaiWord(input: string, position: number): ExtractionResult | null {
    if (!this.context) return null;

    // Try to match keywords from profile (longest first, greedy matching)
    let longestMatch: { word: string; entry: any } | null = null;
    let testPos = position;
    let testWord = '';

    // Build up potential matches character by character
    while (testPos < input.length && isThai(input[testPos])) {
      testWord += input[testPos];
      testPos++;

      // Check if this is a keyword
      const entry = this.context.lookupKeyword(testWord);
      if (entry) {
        longestMatch = { word: testWord, entry };
      }
    }

    // If we found a keyword match, return it
    if (longestMatch) {
      const normalized =
        longestMatch.entry.normalized !== longestMatch.entry.native
          ? longestMatch.entry.normalized
          : undefined;

      return {
        value: longestMatch.word,
        length: longestMatch.word.length,
        metadata: {
          normalized,
        },
      };
    }

    // No keyword match - read until we hit a known keyword start or end of Thai text
    let pos = position;
    let word = '';

    while (pos < input.length && isThai(input[pos])) {
      // Check if we're at the start of a known keyword (don't split keywords)
      if (word.length > 0 && this.isKeywordStart(input, pos)) {
        break;
      }
      word += input[pos];
      pos++;
    }

    if (!word) return null;

    return {
      value: word,
      length: word.length,
      metadata: {},
    };
  }

  /**
   * Extract ASCII word (for embedded English identifiers).
   */
  private extractAsciiWord(input: string, position: number): ExtractionResult | null {
    if (!this.context) return null;

    let pos = position;
    let word = '';

    while (pos < input.length && isAsciiIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    const lower = word.toLowerCase();
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

  /**
   * Check if we're at the start of a known keyword.
   * Used to avoid splitting keywords when parsing unknown Thai text.
   */
  private isKeywordStart(input: string, position: number): boolean {
    if (!this.context) return false;

    // Try matching keywords from this position
    let testPos = position;
    let testWord = '';

    while (testPos < input.length && isThai(input[testPos])) {
      testWord += input[testPos];
      testPos++;

      if (this.context.lookupKeyword(testWord)) {
        return true;
      }

      // Don't check too far ahead (optimization)
      if (testWord.length > 10) break;
    }

    return false;
  }
}

/**
 * Create Thai-specific extractors.
 */
export function createThaiExtractors(): ContextAwareExtractor[] {
  return [new ThaiKeywordExtractor()];
}
