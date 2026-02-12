/**
 * URL Extractor
 *
 * Extracts URLs and paths: /path, ./relative, ../parent, http://, https://, //domain.com
 * This is hyperscript-specific syntax (used in fetch commands).
 */

import type {
  ValueExtractor,
  ExtractionResult,
} from '@lokascript/framework/interfaces/value-extractor';

/**
 * Extract a URL from input at position.
 * Handles: /path, ./path, ../path, //domain.com, http://, https://
 */
export function extractUrl(input: string, position: number): string | null {
  const remaining = input.slice(position);

  // Absolute URL: http:// or https://
  if (remaining.startsWith('http://') || remaining.startsWith('https://')) {
    const match = remaining.match(/^https?:\/\/[^\s]*/);
    return match ? match[0] : null;
  }

  // Protocol-relative URL: //domain.com
  if (remaining.startsWith('//')) {
    const match = remaining.match(/^\/\/[^\s]*/);
    return match ? match[0] : null;
  }

  // Relative paths: ./path or ../path
  if (remaining.startsWith('./') || remaining.startsWith('../')) {
    const match = remaining.match(/^\.\.?\/[^\s]*/);
    return match ? match[0] : null;
  }

  // Absolute path: /path
  if (remaining.startsWith('/')) {
    const match = remaining.match(/^\/[^\s]*/);
    return match ? match[0] : null;
  }

  return null;
}

/**
 * UrlExtractor - Extracts URLs and paths for hyperscript.
 */
export class UrlExtractor implements ValueExtractor {
  readonly name = 'url';

  canExtract(input: string, position: number): boolean {
    const remaining = input.slice(position);
    return (
      remaining.startsWith('http://') ||
      remaining.startsWith('https://') ||
      remaining.startsWith('//') ||
      remaining.startsWith('./') ||
      remaining.startsWith('../') ||
      remaining.startsWith('/')
    );
  }

  extract(input: string, position: number): ExtractionResult | null {
    const url = extractUrl(input, position);
    if (url) {
      return {
        value: url,
        length: url.length,
        metadata: { type: 'url' },
      };
    }
    return null;
  }
}
