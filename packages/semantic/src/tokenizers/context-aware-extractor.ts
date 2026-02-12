/**
 * Context-Aware Extractor System
 *
 * Extends the basic ValueExtractor pattern to support extractors that need
 * access to tokenizer state (keyword maps, morphological normalizers, etc.).
 *
 * This enables language-specific extractors to perform:
 * - Keyword normalization (flip → toggle)
 * - Morphological analysis (incrementando → increment)
 * - Custom syntax transformations (active class → .active)
 */

import type { ValueExtractor } from './value-extractor-types';
import type { KeywordEntry } from './base-tokenizer';
import type { MorphologicalNormalizer } from './morphology/types';

// =============================================================================
// Context Types
// =============================================================================

/**
 * Tokenizer context provided to context-aware extractors.
 * Gives extractors access to tokenizer state without tight coupling.
 */
export interface TokenizerContext {
  /** ISO 639-1 language code */
  readonly language: string;

  /** Text direction */
  readonly direction: 'ltr' | 'rtl';

  /**
   * Look up a keyword by its native form.
   * Returns keyword entry with normalized form, or undefined if not found.
   */
  lookupKeyword(native: string): KeywordEntry | undefined;

  /**
   * Check if a word is a known keyword.
   */
  isKeyword(native: string): boolean;

  /**
   * Optional morphological normalizer for this language.
   */
  readonly normalizer?: MorphologicalNormalizer;

  /**
   * Check if a known keyword starts at the given position.
   * Useful for word boundary detection in non-space languages.
   */
  isKeywordStart(input: string, position: number): boolean;
}

// =============================================================================
// Context-Aware Extractor Interface
// =============================================================================

/**
 * Context-aware extractor - has access to tokenizer state.
 *
 * Use this for extractors that need:
 * - Keyword lookup (for normalization)
 * - Morphological analysis (for conjugation handling)
 * - Language-specific rules
 *
 * For stateless extractors (strings, numbers, operators), use ValueExtractor.
 */
export interface ContextAwareExtractor extends ValueExtractor {
  /**
   * Set the tokenizer context.
   * Called once by the tokenizer before first use.
   *
   * @param context - Tokenizer context with keyword maps, normalizer, etc.
   */
  setContext(context: TokenizerContext): void;
}

/**
 * Type guard to check if an extractor is context-aware.
 */
export function isContextAwareExtractor(
  extractor: ValueExtractor | ContextAwareExtractor
): extractor is ContextAwareExtractor {
  return 'setContext' in extractor && typeof extractor.setContext === 'function';
}

// =============================================================================
// Helper Function
// =============================================================================

/**
 * Create a tokenizer context from a BaseTokenizer instance.
 * This allows extractors to access tokenizer state without direct coupling.
 *
 * Uses type assertion to work with protected methods.
 */
export function createTokenizerContext(tokenizer: any): TokenizerContext {
  const ctx: TokenizerContext = {
    language: tokenizer.language,
    direction: tokenizer.direction,
    lookupKeyword: tokenizer.lookupKeyword.bind(tokenizer),
    isKeyword: tokenizer.isKeyword.bind(tokenizer),
    isKeywordStart: tokenizer.isKeywordStart.bind(tokenizer),
  };

  // Only add normalizer if it exists (avoids exactOptionalPropertyTypes issue)
  if (tokenizer.normalizer) {
    return { ...ctx, normalizer: tokenizer.normalizer };
  }

  return ctx;
}
