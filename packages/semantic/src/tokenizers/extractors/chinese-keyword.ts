/**
 * Chinese Keyword Extractor (Context-Aware)
 *
 * Handles Chinese word extraction for:
 * - Simplified Chinese (简体中文)
 * - CJK Unified Ideographs (U+4E00-U+9FFF)
 * - CJK Extension A-F
 * - No spaces between words (like Japanese)
 * - Analytic language (no morphology/conjugation)
 *
 * Chinese characteristics:
 * - No spaces between words (word boundaries detected via keyword matching)
 * - No verb conjugation (analytic language, no morphological normalization needed)
 * - Uses particles (把, 在, 从, etc.) for grammatical roles
 * - SVO word order (like English)
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Check if character is a CJK character (Chinese).
 * Covers all major CJK Unicode ranges.
 */
function isChinese(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
    (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
    (code >= 0x2b820 && code <= 0x2ceaf) || // CJK Extension E
    (code >= 0x2ceb0 && code <= 0x2ebef) || // CJK Extension F
    (code >= 0x2f800 && code <= 0x2fa1f) // CJK Compatibility Ideographs Supplement
  );
}

/**
 * ChineseKeywordExtractor - Context-aware extractor for Chinese words.
 *
 * Chinese is an analytic language with no spaces between words.
 * Word boundaries are detected via:
 * 1. Known keywords from profile (longest-first greedy matching)
 * 2. Particle boundaries (把, 在, 从, etc.)
 * 3. ASCII/selector boundaries
 */
export class ChineseKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'chinese-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isChinese(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('ChineseKeywordExtractor: context not set');
    }

    const startPos = position;

    // Try greedy keyword matching first (longest match)
    // This is critical for multi-character keywords like 添加, 切换, etc.
    let longestMatch: { word: string; entry: { native: string; normalized: string } } | null = null;

    // Try all profile keywords at this position (context provides them sorted longest-first)
    if (this.context.isKeywordStart(input, position)) {
      // Get all keywords and try to find the longest match
      for (let len = 10; len >= 1; len--) {
        // Max Chinese keyword length ~10 chars
        const candidate = input.slice(position, position + len);
        // All chars must be Chinese
        if ([...candidate].every(c => isChinese(c))) {
          const entry = this.context.lookupKeyword(candidate);
          if (entry) {
            longestMatch = { word: candidate, entry };
            break; // Found longest match
          }
        }
      }
    }

    if (longestMatch) {
      return {
        value: longestMatch.word,
        length: longestMatch.word.length,
        metadata: {
          normalized: longestMatch.entry.normalized,
        },
      };
    }

    // No keyword match - extract as regular word until boundary
    let word = '';
    let pos = position;

    while (pos < input.length && isChinese(input[pos])) {
      word += input[pos];
      pos++;

      // Stop at next potential keyword start (avoid consuming other keywords)
      if (pos < input.length && this.context.isKeywordStart(input, pos)) {
        break;
      }
    }

    if (!word) return null;

    // Chinese is analytic (no conjugation), so no morphological normalization needed

    return {
      value: word,
      length: pos - startPos,
      metadata: {},
    };
  }
}

/**
 * Create Chinese-specific extractors.
 * Includes both particle and keyword extractors.
 */
export function createChineseExtractors(): ContextAwareExtractor[] {
  return [
    // Note: ChineseParticleExtractor is in chinese-particle.ts
    // and should be registered separately
    new ChineseKeywordExtractor(),
  ];
}
