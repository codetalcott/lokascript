/**
 * English Keyword Extractor (Context-Aware)
 *
 * Handles English-specific identifier and keyword extraction with:
 * - Keyword normalization (flip → toggle, colour → color)
 * - Namespaced events (draggable:start, htmx:afterSwap)
 * - Class syntax conversion (active class → .active)
 * - Possessive markers (element's property)
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

function isAsciiIdentifierChar(char: string): boolean {
  return /[a-zA-Z0-9_]/.test(char);
}

/**
 * EnglishKeywordExtractor - Context-aware extractor for English identifiers and keywords.
 */
export class EnglishKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'english-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return /[a-zA-Z_]/.test(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('EnglishKeywordExtractor: context not set');
    }

    let pos = position;
    let word = '';

    // Extract base word
    while (pos < input.length && isAsciiIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    // Check for namespaced event pattern: word:word (e.g., draggable:start)
    // This is different from variable references (:varname) which start with colon
    if (pos < input.length && input[pos] === ':') {
      const colonPos = pos;
      pos++; // consume colon
      let namespace = '';
      while (pos < input.length && isAsciiIdentifierChar(input[pos])) {
        namespace += input[pos++];
      }
      // Only treat as namespaced event if there's text after the colon
      if (namespace) {
        word = word + ':' + namespace;
      } else {
        // No text after colon, revert to just the word
        pos = colonPos;
      }
    }

    // Get normalized form if this is a keyword synonym
    const keywordEntry = this.context.lookupKeyword(word);
    const normalized =
      keywordEntry && keywordEntry.normalized !== keywordEntry.native
        ? keywordEntry.normalized
        : undefined;

    // Check for class syntax conversion: "active class" → ".active"
    // Only for identifiers (not keywords)
    let classConversion: string | null = null;
    if (!this.context.isKeyword(word)) {
      classConversion = this.tryClassSyntaxConversion(input, pos, word);
    }

    return {
      value: classConversion || word,
      length: pos - position,
      metadata: {
        normalized,
        classConversion: classConversion ? true : undefined,
      },
    };
  }

  /**
   * Try to convert "identifier class" to ".identifier".
   * E.g., "active class" → ".active"
   */
  private tryClassSyntaxConversion(input: string, endPos: number, word: string): string | null {
    let checkPos = endPos;

    // Skip whitespace after the word
    while (checkPos < input.length && /\s/.test(input[checkPos])) {
      checkPos++;
    }

    // Check if next word is "class"
    if (input.slice(checkPos, checkPos + 5).toLowerCase() === 'class') {
      // Make sure "class" is a complete word (not "className" etc.)
      const afterClass = checkPos + 5;
      if (afterClass >= input.length || !isAsciiIdentifierChar(input[afterClass])) {
        // Convert to class selector
        // Note: we DON'T consume "class" here - let the noise word handling in
        // pattern-matcher skip it. This keeps the token stream cleaner.
        return '.' + word;
      }
    }

    return null;
  }
}

/**
 * Create English keyword extractor with possessive marker handling.
 */
export function createEnglishExtractors(): ContextAwareExtractor[] {
  return [new EnglishKeywordExtractor()];
}
