/**
 * CSS Selector Extractor
 *
 * Extracts CSS selectors: #id, .class, [attr], <tag/>
 * This is hyperscript-specific syntax.
 */

import type {
  ValueExtractor,
  ExtractionResult,
} from '@lokascript/framework/interfaces/value-extractor';

/**
 * Extract a CSS selector from input at position.
 * Wraps the existing extractCssSelector logic from framework.
 */
export function extractCssSelector(input: string, position: number): string | null {
  const char = input[position];

  // ID selector: #identifier
  if (char === '#') {
    const match = input.slice(position).match(/^#[a-zA-Z_][\w-]*/);
    return match ? match[0] : null;
  }

  // Class selector: .identifier
  if (char === '.') {
    const match = input.slice(position).match(/^\.[a-zA-Z_][\w-]*/);
    return match ? match[0] : null;
  }

  // Attribute selector: [attr] or [attr=value]
  if (char === '[') {
    let depth = 0;
    let end = position;
    while (end < input.length) {
      if (input[end] === '[') depth++;
      if (input[end] === ']') {
        depth--;
        if (depth === 0) {
          return input.slice(position, end + 1);
        }
      }
      end++;
    }
    return null; // Unclosed bracket
  }

  // HTML tag selector: <tag/> or <tag#id.class/>
  if (char === '<') {
    const match = input.slice(position).match(/^<[\w-]+(?:[#.][\w-]+)*\s*\/>/);
    return match ? match[0] : null;
  }

  return null;
}

/**
 * CssSelectorExtractor - Extracts CSS selectors for hyperscript.
 */
export class CssSelectorExtractor implements ValueExtractor {
  readonly name = 'css-selector';

  canExtract(input: string, position: number): boolean {
    const char = input[position];
    return char === '#' || char === '.' || char === '[' || char === '<';
  }

  extract(input: string, position: number): ExtractionResult | null {
    const selector = extractCssSelector(input, position);
    if (selector) {
      return {
        value: selector,
        length: selector.length,
        metadata: { type: 'css-selector' },
      };
    }
    return null;
  }
}
