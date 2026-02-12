/**
 * Bengali Keyword Extractor (Context-Aware)
 *
 * Handles Bengali word extraction for:
 * - Bengali script (U+0980-U+09FF)
 * - Mixed script words (Bengali + ASCII)
 *
 * Integrates with morphological normalizer for verb conjugations.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is in the Bengali script range.
 */
function isBengali(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x0980 && code <= 0x09ff;
}

/**
 * BengaliKeywordExtractor - Context-aware extractor for Bengali words.
 */
export class BengaliKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'bengali-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isBengali(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('BengaliKeywordExtractor: context not set');
    }

    const startPos = position;

    // Extract Bengali word - read until non-Bengali
    let word = '';
    let pos = position;

    while (pos < input.length && isBengali(input[pos])) {
      word += input[pos];
      pos++;
    }

    if (!word) return null;

    // Look up keyword entry
    const keywordEntry = this.context.lookupKeyword(word);
    const normalized =
      keywordEntry && keywordEntry.normalized !== keywordEntry.native
        ? keywordEntry.normalized
        : undefined;

    // Try morphological normalization if available
    let morphNormalized: string | undefined;
    if (!keywordEntry && this.context.normalizer) {
      const morphResult = this.context.normalizer.normalize(word);
      if (morphResult.stem !== word && morphResult.confidence >= 0.7) {
        const stemEntry = this.context.lookupKeyword(morphResult.stem);
        if (stemEntry) {
          morphNormalized = stemEntry.normalized;
        }
      }
    }

    return {
      value: word,
      length: pos - startPos,
      metadata: {
        normalized: normalized || morphNormalized,
      },
    };
  }
}

/**
 * Create Bengali-specific extractors.
 */
export function createBengaliExtractors(): ContextAwareExtractor[] {
  return [new BengaliKeywordExtractor()];
}
