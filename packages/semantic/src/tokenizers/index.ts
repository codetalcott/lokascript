/**
 * Tokenizer Registry
 *
 * Exports all language-specific tokenizers and provides
 * a unified interface for tokenization.
 */

import type { LanguageTokenizer, TokenStream } from '../types';
import { englishTokenizer } from './english';
import { japaneseTokenizer } from './japanese';
import { koreanTokenizer } from './korean';
import { arabicTokenizer } from './arabic';
import { spanishTokenizer } from './spanish';
import { turkishTokenizer } from './turkish';
import { chineseTokenizer } from './chinese';
import { portugueseTokenizer } from './portuguese';
import { frenchTokenizer } from './french';
import { germanTokenizer } from './german';
import { indonesianTokenizer } from './indonesian';
import { quechuaTokenizer } from './quechua';
import { swahiliTokenizer } from './swahili';

// =============================================================================
// Tokenizer Registry
// =============================================================================

/**
 * All registered tokenizers by language code.
 */
const tokenizers = new Map<string, LanguageTokenizer>();
tokenizers.set('en', englishTokenizer);
tokenizers.set('ja', japaneseTokenizer);
tokenizers.set('ko', koreanTokenizer);
tokenizers.set('ar', arabicTokenizer);
tokenizers.set('es', spanishTokenizer);
tokenizers.set('tr', turkishTokenizer);
tokenizers.set('zh', chineseTokenizer);
tokenizers.set('pt', portugueseTokenizer);
tokenizers.set('fr', frenchTokenizer);
tokenizers.set('de', germanTokenizer);
tokenizers.set('id', indonesianTokenizer);
tokenizers.set('qu', quechuaTokenizer);
tokenizers.set('sw', swahiliTokenizer);

/**
 * Get a tokenizer for the specified language.
 */
export function getTokenizer(language: string): LanguageTokenizer | undefined {
  return tokenizers.get(language);
}

/**
 * Tokenize input in the specified language.
 */
export function tokenize(input: string, language: string): TokenStream {
  const tokenizer = tokenizers.get(language);
  if (!tokenizer) {
    throw new Error(`No tokenizer available for language: ${language}`);
  }
  return tokenizer.tokenize(input);
}

/**
 * Get all supported languages.
 */
export function getSupportedLanguages(): string[] {
  return Array.from(tokenizers.keys());
}

/**
 * Check if a language is supported.
 */
export function isLanguageSupported(language: string): boolean {
  return tokenizers.has(language);
}

/**
 * Register a custom tokenizer.
 */
export function registerTokenizer(tokenizer: LanguageTokenizer): void {
  tokenizers.set(tokenizer.language, tokenizer);
}

// =============================================================================
// Re-exports
// =============================================================================

export { englishTokenizer } from './english';
export { japaneseTokenizer } from './japanese';
export { koreanTokenizer } from './korean';
export { arabicTokenizer } from './arabic';
export { spanishTokenizer } from './spanish';
export { turkishTokenizer } from './turkish';
export { chineseTokenizer } from './chinese';
export { portugueseTokenizer } from './portuguese';
export { frenchTokenizer } from './french';
export { germanTokenizer } from './german';
export { indonesianTokenizer } from './indonesian';
export { quechuaTokenizer } from './quechua';
export { swahiliTokenizer } from './swahili';

export {
  BaseTokenizer,
  TokenStreamImpl,
  createToken,
  createPosition,
  extractCssSelector,
  extractStringLiteral,
  extractNumber,
  isUrlStart,
  extractUrl,
} from './base';
