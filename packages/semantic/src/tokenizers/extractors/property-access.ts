/**
 * Property Access Extractor
 *
 * Detects JavaScript-style property access: obj.prop, element.classList
 * This is hyperscript-specific syntax for accessing object properties.
 *
 * Note: This extractor only emits the '.' operator token. The identifier
 * on either side is handled by IdentifierExtractor.
 */

import type { ValueExtractor, ExtractionResult } from '../value-extractor-types';

/**
 * PropertyAccessExtractor - Detects property access pattern (obj.prop).
 *
 * Returns the '.' operator when it's part of a property access, not a CSS selector.
 * Property access has no whitespace before the dot and the previous token was an identifier.
 *
 * This extractor should be registered BEFORE CssSelectorExtractor to take priority.
 */
export class PropertyAccessExtractor implements ValueExtractor {
  readonly name = 'property-access';

  private lastTokenEnd = -1;
  private lastTokenWasIdentifier = false;

  canExtract(input: string, position: number): boolean {
    if (input[position] !== '.') return false;

    // Check for method call pattern: .identifier(
    const methodStart = position + 1;
    let methodEnd = methodStart;
    while (methodEnd < input.length && /[a-zA-Z0-9_]/.test(input[methodEnd])) {
      methodEnd++;
    }
    if (methodEnd < input.length && input[methodEnd] === '(') {
      return true; // Standalone method call
    }

    // Check if previous token was an identifier with no whitespace
    const hasWhitespaceBefore = this.lastTokenEnd >= 0 && this.lastTokenEnd < position;
    return this.lastTokenWasIdentifier && !hasWhitespaceBefore;
  }

  extract(_input: string, _position: number): ExtractionResult | null {
    // Just emit the '.' operator - the identifier on either side is handled by IdentifierExtractor
    return {
      value: '.',
      length: 1,
      metadata: { type: 'property-accessor' },
    };
  }

  /**
   * Update tracking state when a token is consumed.
   * This should be called by the tokenizer after each token.
   *
   * @param position - End position of the consumed token
   * @param wasIdentifier - Whether the consumed token was an identifier
   */
  updateState(position: number, wasIdentifier: boolean): void {
    this.lastTokenEnd = position;
    this.lastTokenWasIdentifier = wasIdentifier;
  }
}
