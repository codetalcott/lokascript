/**
 * Arabic Keyword Extractor (Context-Aware)
 *
 * Handles Arabic word extraction for:
 * - RTL text handling
 * - Arabic script (U+0600-U+06FF + extensions)
 * - Diacritic normalization (U+064B-U+0652)
 * - Morphological normalization via context
 * - Preposition detection
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';
import { createUnicodeRangeClassifier } from '../base';

/** Check if character is Arabic (includes all Arabic Unicode blocks). */
const isArabic = createUnicodeRangeClassifier([
  [0x0600, 0x06ff], // Arabic
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
]);

/**
 * Arabic standalone prepositions.
 * Note: Temporal markers (عند, لدى, etc.) are handled separately
 * in ArabicTemporalExtractor with formality metadata.
 */
const PREPOSITIONS = new Set([
  'في', // fī (in)
  'على', // ʿalā (on)
  'من', // min (from)
  'إلى', // ilā (to)
  'الى', // ilā (alternative spelling)
  'مع', // maʿa (with)
  'عن', // ʿan (about, from)
  'قبل', // qabl (before)
  'بعد', // baʿd (after)
  'بين', // bayn (between)
]);

/**
 * ArabicKeywordExtractor - Context-aware extractor for Arabic words.
 *
 * Handles:
 * - RTL text direction
 * - Arabic script with diacritics
 * - Morphological normalization
 * - Preposition detection with metadata
 */
export class ArabicKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'arabic-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isArabic(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('ArabicKeywordExtractor: context not set');
    }

    const startPos = position;

    // Try to match keywords from profile (longest first, greedy matching)
    // This handles known keywords like بدل, زِد, أزل, etc.
    if (this.context.isKeywordStart(input, position)) {
      // The keyword matching is handled by tryProfileKeyword in the tokenizer
      // For now, extract the word and let classifyToken determine if it's a keyword
    }

    // Extract Arabic word - read until non-Arabic
    // Note: We don't break on keyword boundaries because Arabic words can contain
    // nested keywords (e.g., النقر contains both ال and نقر). We want to extract
    // the full word and then look it up for longest-match keyword detection.
    let word = '';
    let pos = position;

    while (pos < input.length && (isArabic(input[pos]) || input[pos] === 'ـ')) {
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

    // Check if it's a preposition (with metadata for disambiguation)
    if (PREPOSITIONS.has(word)) {
      return {
        value: word,
        length: pos - startPos,
        metadata: {
          prepositionValue: word,
          normalized,
        },
      };
    }

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
 * Create Arabic-specific extractors.
 * Includes keyword extractor (particle and temporal extractors are separate).
 */
export function createArabicExtractors(): ContextAwareExtractor[] {
  return [
    // Note: ArabicProcliticExtractor is in arabic-proclitic.ts
    // and ArabicTemporalExtractor is in arabic-temporal.ts
    // They should be registered separately
    new ArabicKeywordExtractor(),
  ];
}
