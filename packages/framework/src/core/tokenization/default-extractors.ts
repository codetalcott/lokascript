/**
 * Default Extractor Sets
 *
 * Provides pre-configured sets of extractors for common use cases.
 * DSLs can use these as a starting point and add domain-specific extractors.
 */

import type { ValueExtractor } from '../../interfaces/value-extractor';
import {
  StringLiteralExtractor,
  NumberExtractor,
  IdentifierExtractor,
  UnicodeIdentifierExtractor,
} from '../../interfaces/value-extractor';
import { OperatorExtractor, PunctuationExtractor } from './extractors/index';

/**
 * Get default extractors for generic programming-language-style DSLs.
 * These work for most DSLs (SQL, config files, scripts, etc.).
 *
 * Included extractors:
 * - String literals: "double", 'single', `backtick`
 * - Numbers: 123, 45.67
 * - Operators: +, -, *, /, =, ==, !=, >=, <=, etc.
 * - Punctuation: ( ) [ ] { } , : ;
 * - Identifiers: variable_names, functionNames
 * - Unicode identifiers: CJK, Arabic, Cyrillic, etc.
 *
 * @returns Array of default extractors
 *
 * @example
 * ```typescript
 * class MyDSLTokenizer extends BaseTokenizer {
 *   constructor() {
 *     super();
 *     this.registerExtractors(getDefaultExtractors());
 *   }
 * }
 * ```
 */
export function getDefaultExtractors(): ValueExtractor[] {
  return [
    new StringLiteralExtractor(), // "strings", 'strings', `strings`
    new NumberExtractor(), // 123, 45.67
    new OperatorExtractor(), // +, -, *, /, =, >, <, etc.
    new PunctuationExtractor(), // ( ) [ ] { } , : ;
    new IdentifierExtractor(), // variable_names, functionNames (ASCII)
    new UnicodeIdentifierExtractor(), // CJK, Arabic, Cyrillic, etc.
  ];
}

/**
 * Auto-register default extractors in a tokenizer.
 * Convenience helper for chaining.
 *
 * @param tokenizer - Tokenizer to configure
 * @returns The same tokenizer (for chaining)
 *
 * @example
 * ```typescript
 * const tokenizer = withDefaultExtractors(new MyTokenizer());
 * ```
 */
export function withDefaultExtractors<
  T extends { registerExtractors(extractors: ValueExtractor[]): void },
>(tokenizer: T): T {
  tokenizer.registerExtractors(getDefaultExtractors());
  return tokenizer;
}
