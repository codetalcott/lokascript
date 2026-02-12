/**
 * Japanese Keyword Extractor (Context-Aware)
 *
 * Handles Japanese word extraction for:
 * - Hiragana (ひらがな)
 * - Katakana (カタカナ)
 * - Kanji (漢字)
 * - Romaji (ASCII)
 * - Mixed script words
 *
 * Integrates with morphological normalizer for verb conjugations.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is hiragana.
 */
function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
}

/**
 * Check if character is katakana.
 */
function isKatakana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
}

/**
 * Check if character is kanji.
 */
function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0x4e00 && code <= 0x9faf) || (code >= 0x3400 && code <= 0x4dbf);
}

/**
 * Check if character is Japanese script.
 */
function isJapanese(char: string): boolean {
  return isHiragana(char) || isKatakana(char) || isKanji(char);
}

/**
 * JapaneseKeywordExtractor - Context-aware extractor for Japanese words.
 */
export class JapaneseKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'japanese-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isJapanese(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('JapaneseKeywordExtractor: context not set');
    }

    const startPos = position;

    // Try to match keywords from profile (longest first, greedy matching)
    // This handles known keywords like トグル, 切り替え, etc.
    if (this.context.isKeywordStart(input, position)) {
      // The keyword matching is handled by tryProfileKeyword in the tokenizer
      // For now, extract the word and let classifyToken determine if it's a keyword
    }

    // Extract Japanese word - read until non-Japanese boundary
    // Use greedy matching to handle compound keywords like "末尾追加"
    let word = '';
    let pos = position;

    while (pos < input.length && isJapanese(input[pos])) {
      word += input[pos];
      pos++;
    }

    // After extracting the full word, check if it's a keyword or needs boundary detection
    // For compound keywords (e.g., "末尾追加"), we want to match the longest first
    // Try to find the longest matching keyword from the current position
    let bestMatch = word;
    let bestLength = word.length;

    // Try progressively shorter substrings to find the longest matching keyword
    for (let len = word.length; len > 0; len--) {
      const candidate = word.substring(0, len);
      if (this.context.lookupKeyword(candidate)) {
        bestMatch = candidate;
        bestLength = len;
        break; // Found longest match
      }
    }

    // Use the best match
    word = bestMatch;
    pos = position + bestLength;

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
 * Create Japanese-specific extractors.
 * Includes both particle and keyword extractors.
 */
export function createJapaneseExtractors(): ContextAwareExtractor[] {
  return [
    // Note: JapaneseParticleExtractor is in japanese-particle.ts
    // and should be registered separately
    new JapaneseKeywordExtractor(),
  ];
}
