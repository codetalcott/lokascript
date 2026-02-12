/**
 * Romance Language Keyword Extractors (Context-Aware)
 *
 * Shared extractors for Romance languages (Portuguese, French, German, Italian)
 * that have similar structure to Spanish but different character sets.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

function createLatinCharClassifiers(pattern: RegExp) {
  const isLetter = (char: string) => pattern.test(char);
  const isIdentifierChar = (char: string) => /[0-9]/.test(char) || pattern.test(char);
  return { isLetter, isIdentifierChar };
}

/**
 * Generic Romance language keyword extractor class.
 */
class RomanceKeywordExtractor implements ContextAwareExtractor {
  readonly name: string;
  private context?: TokenizerContext;
  private isLetter: (char: string) => boolean;
  private isIdentifierChar: (char: string) => boolean;
  private prepositions: Set<string>;

  constructor(name: string, charPattern: RegExp, prepositions: Set<string>) {
    this.name = name;
    const classifiers = createLatinCharClassifiers(charPattern);
    this.isLetter = classifiers.isLetter;
    this.isIdentifierChar = classifiers.isIdentifierChar;
    this.prepositions = prepositions;
  }

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return this.isLetter(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error(`${this.name}: context not set`);
    }

    let pos = position;
    let word = '';

    while (pos < input.length && this.isIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    const lower = word.toLowerCase();
    const isPreposition = this.prepositions.has(lower);

    // Look up keyword entry
    const keywordEntry = this.context.lookupKeyword(lower);
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
      length: pos - position,
      metadata: {
        normalized: normalized || morphNormalized,
        isPreposition,
      },
    };
  }
}

// =============================================================================
// Portuguese
// =============================================================================

const PORTUGUESE_PREPOSITIONS = new Set([
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

export function createPortugueseExtractors(): ContextAwareExtractor[] {
  return [
    new RomanceKeywordExtractor(
      'portuguese-keyword',
      /[a-zA-ZáâãéêíóôõúçÁÂÃÉÊÍÓÔÕÚÇ]/,
      PORTUGUESE_PREPOSITIONS
    ),
  ];
}

// =============================================================================
// French
// =============================================================================

const FRENCH_PREPOSITIONS = new Set([
  'dans',
  'à',
  'de',
  'pour',
  'avec',
  'sans',
  'sur',
  'sous',
  'entre',
  'avant',
  'après',
  'dedans',
  'dehors',
  'au',
  'du',
  'des',
]);

export function createFrenchExtractors(): ContextAwareExtractor[] {
  return [
    new RomanceKeywordExtractor(
      'french-keyword',
      /[a-zA-ZàâæçéèêëïîôùûüÿœÀÂÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/,
      FRENCH_PREPOSITIONS
    ),
  ];
}

// =============================================================================
// German
// =============================================================================

const GERMAN_PREPOSITIONS = new Set([
  'in',
  'an',
  'auf',
  'zu',
  'von',
  'mit',
  'ohne',
  'für',
  'über',
  'unter',
  'zwischen',
  'vor',
  'nach',
  'bei',
  'aus',
  'durch',
]);

export function createGermanExtractors(): ContextAwareExtractor[] {
  return [new RomanceKeywordExtractor('german-keyword', /[a-zA-ZäöüßÄÖÜẞ]/, GERMAN_PREPOSITIONS)];
}

// =============================================================================
// Italian
// =============================================================================

const ITALIAN_PREPOSITIONS = new Set([
  'in',
  'a',
  'di',
  'da',
  'con',
  'su',
  'per',
  'tra',
  'fra',
  'dopo',
  'prima',
  'dentro',
  'fuori',
  'sopra',
  'sotto',
  // Articulated prepositions (preposition + article)
  'al', // a + il
  'allo', // a + lo
  'alla', // a + la
  'ai', // a + i
  'agli', // a + gli
  'alle', // a + le
  'del', // di + il
  'dello', // di + lo
  'della', // di + la
  'dei', // di + i
  'degli', // di + gli
  'delle', // di + le
  'dal', // da + il
  'dallo', // da + lo
  'dalla', // da + la
  'dai', // da + i
  'dagli', // da + gli
  'dalle', // da + le
  'nel', // in + il
  'nello', // in + lo
  'nella', // in + la
  'nei', // in + i
  'negli', // in + gli
  'nelle', // in + le
  'sul', // su + il
  'sullo', // su + lo
  'sulla', // su + la
  'sui', // su + i
  'sugli', // su + gli
  'sulle', // su + le
]);

export function createItalianExtractors(): ContextAwareExtractor[] {
  return [
    new RomanceKeywordExtractor(
      'italian-keyword',
      /[a-zA-ZàèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/,
      ITALIAN_PREPOSITIONS
    ),
  ];
}
