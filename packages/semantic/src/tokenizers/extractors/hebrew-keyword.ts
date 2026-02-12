/**
 * Hebrew Keyword Extractor (Context-Aware)
 *
 * Handles Hebrew word extraction for:
 * - RTL text handling
 * - Hebrew script (U+0590-U+05FF + presentation forms)
 * - Prefix prepositions (proclitics: ב, ל, מ, כ, ה, ו, ש)
 * - Morphological normalization via context
 * - Preposition detection
 *
 * Note: Hebrew prefix prepositions (proclitics) are handled separately
 * by HebrewProcliticExtractor for better separation of concerns.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';
import { createUnicodeRangeClassifier } from '../base';

/** Check if character is Hebrew (includes all Hebrew Unicode blocks). */
const isHebrew = createUnicodeRangeClassifier([
  [0x0590, 0x05ff], // Hebrew
  [0xfb1d, 0xfb4f], // Hebrew Presentation Forms
]);

/**
 * Hebrew standalone prepositions.
 * Note: Prefix prepositions (ב, ל, מ, etc.) are handled separately
 * by HebrewProcliticExtractor.
 */
const PREPOSITIONS = new Set([
  'על', // al (on, upon)
  'את', // et (direct object marker)
  'אל', // el (to, toward)
  'מן', // min (from)
  'עם', // im (with)
  'בתוך', // betoch (inside)
  'מתוך', // mitoch (from inside)
  'ליד', // leyad (next to)
  'אחרי', // acharey (after)
  'לפני', // lifney (before)
  'בין', // beyn (between)
  'עד', // ad (until)
  'של', // shel (of - possessive)
]);

/**
 * Hebrew conjunctions.
 */
const CONJUNCTIONS = new Set([
  'ו', // v' - conjunction "and" (can also be prefix)
]);

/**
 * HebrewKeywordExtractor - Context-aware extractor for Hebrew words.
 *
 * Handles:
 * - RTL text direction
 * - Hebrew script with optional vowel points
 * - Morphological normalization
 * - Preposition detection with metadata
 *
 * Note: Prefix prepositions are handled by HebrewProcliticExtractor.
 */
export class HebrewKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'hebrew-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isHebrew(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('HebrewKeywordExtractor: context not set');
    }

    const startPos = position;

    // Try to match keywords from profile (longest first, greedy matching)
    // This handles known keywords
    if (this.context.isKeywordStart(input, position)) {
      // The keyword matching is handled by tryProfileKeyword in the tokenizer
      // For now, extract the word and let classifyToken determine if it's a keyword
    }

    // Extract Hebrew word - read until non-Hebrew
    // Note: We don't break on keyword boundaries because Hebrew words can contain
    // nested keywords. We want to extract the full word and then look it up
    // for longest-match keyword detection.
    let word = '';
    let pos = position;

    while (pos < input.length && isHebrew(input[pos])) {
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

    // Check if it's a conjunction (with metadata for disambiguation)
    if (CONJUNCTIONS.has(word)) {
      return {
        value: word,
        length: pos - startPos,
        metadata: {
          conjunctionValue: word,
          normalized,
        },
      };
    }

    // Try morphological normalization if available
    // Hebrew doesn't have a morphological normalizer yet, but we prepare for it
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
 * Create Hebrew-specific extractors.
 * Includes keyword extractor (proclitic extractor is separate).
 */
export function createHebrewExtractors(): ContextAwareExtractor[] {
  return [
    // Note: HebrewProcliticExtractor should be registered separately
    // and should come BEFORE this extractor in the priority order
    new HebrewKeywordExtractor(),
  ];
}
