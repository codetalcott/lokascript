/**
 * Hindi Keyword Extractor (Context-Aware)
 *
 * Handles Hindi word extraction for:
 * - Devanagari script (U+0900-U+097F, U+A8E0-U+A8FF)
 * - Mixed script words (Devanagari + ASCII)
 *
 * Integrates with morphological normalizer for verb conjugations.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is in the Devanagari script range.
 */
function isDevanagari(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0x0900 && code <= 0x097f) || (code >= 0xa8e0 && code <= 0xa8ff);
}

/**
 * HindiKeywordExtractor - Context-aware extractor for Hindi words.
 */
export class HindiKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'hindi-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isDevanagari(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('HindiKeywordExtractor: context not set');
    }

    const startPos = position;

    // Extract Hindi word - read until non-Devanagari or space
    let word = '';
    let pos = position;

    while (pos < input.length && (isDevanagari(input[pos]) || input[pos] === ' ')) {
      // Allow spaces for compound words but stop at double spaces
      if (input[pos] === ' ') {
        // Check if next char is Hindi (compound postposition)
        if (pos + 1 < input.length && isDevanagari(input[pos + 1])) {
          // Check if it forms a known compound
          const rest = input.slice(pos);
          const compound = [
            ' के लिए',
            ' के साथ',
            ' के बाद',
            ' से पहले',
            ' नहीं तो',
            ' जब तक',
            ' के बारे में',
          ].find(c => rest.startsWith(c));
          if (compound) {
            word += compound;
            pos += compound.length;
            continue;
          }
        }
        break;
      }

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
 * Create Hindi-specific extractors.
 */
export function createHindiExtractors(): ContextAwareExtractor[] {
  return [new HindiKeywordExtractor()];
}
