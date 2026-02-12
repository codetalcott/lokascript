/**
 * Portuguese Keyword Extractor (Context-Aware)
 *
 * Handles Portuguese-specific identifier and keyword extraction with:
 * - Morphological normalization (alternando → alternar, mostrar-se → mostrar)
 * - Accent mark handling (á, â, ã, é, ê, í, ó, ô, õ, ú, ç)
 * - Preposition detection
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

function createLatinCharClassifiers(pattern: RegExp) {
  const isLetter = (char: string) => pattern.test(char);
  const isIdentifierChar = (char: string) => /[0-9]/.test(char) || pattern.test(char);
  return { isLetter, isIdentifierChar };
}

const { isLetter: isPortugueseLetter, isIdentifierChar: isPortugueseIdentifierChar } =
  createLatinCharClassifiers(/[a-zA-ZáâãéêíóôõúçÁÂÃÉÊÍÓÔÕÚÇ]/);

/**
 * Portuguese prepositions that mark grammatical roles.
 */
const PREPOSITIONS = new Set([
  'em',
  'a',
  'de',
  'para',
  'com',
  'sem',
  'por',
  'sobre',
  'entre',
  'antes',
  'depois',
  'dentro',
  'fora',
  'ao',
  'do',
  'da',
  'no',
  'na',
]);

/**
 * PortugueseKeywordExtractor - Context-aware extractor for Portuguese identifiers and keywords.
 */
export class PortugueseKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'portuguese-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isPortugueseLetter(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('PortugueseKeywordExtractor: context not set');
    }

    let pos = position;
    let word = '';

    while (pos < input.length && isPortugueseIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    const lower = word.toLowerCase();

    // Check if it's a preposition
    const isPreposition = PREPOSITIONS.has(lower);

    // Look up keyword entry
    const keywordEntry = this.context.lookupKeyword(lower);
    const normalized =
      keywordEntry && keywordEntry.normalized !== keywordEntry.native
        ? keywordEntry.normalized
        : undefined;

    // Try morphological normalization if available and not already a keyword
    let morphNormalized: string | undefined;
    if (!keywordEntry && this.context.normalizer) {
      const morphResult = this.context.normalizer.normalize(word);
      if (morphResult.stem !== word && morphResult.confidence >= 0.7) {
        // Check if the stem is a known keyword
        const stemEntry = this.context.lookupKeyword(morphResult.stem);
        if (stemEntry) {
          morphNormalized = stemEntry.normalized;
        }
      }
    }

    return {
      value: word,
      length: pos - position,
      metadata: {
        normalized: normalized || morphNormalized,
        isPreposition,
      },
    };
  }
}

/**
 * Create Portuguese-specific extractors.
 */
export function createPortugueseExtractors(): ContextAwareExtractor[] {
  return [new PortugueseKeywordExtractor()];
}
