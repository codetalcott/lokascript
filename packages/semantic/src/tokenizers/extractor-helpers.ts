/**
 * Extractor Helper Functions
 *
 * Provides convenient helpers for registering hyperscript-specific extractors
 * in tokenizers. This centralizes extractor management and makes migration easier.
 */

import type { ValueExtractor } from './value-extractor-types';
import {
  CssSelectorExtractor,
  EventModifierExtractor,
  UrlExtractor,
  // PropertyAccessExtractor, // TODO: Needs refinement, skip for now
} from './extractors/index';

/**
 * Get the standard set of hyperscript-specific extractors.
 *
 * These handle hyperscript's domain-specific syntax:
 * - CSS selectors (#id, .class, [attr], <tag/>)
 * - Event modifiers (.once, .debounce(300), .throttle(100))
 * - URLs and paths (/api/data, http://example.com)
 *
 * Note: PropertyAccessExtractor is not included as it requires
 * stateful context tracking. Use BaseTokenizer.tryPropertyAccess() instead.
 *
 * @returns Array of hyperscript-specific extractors
 *
 * @example
 * ```typescript
 * import { getDefaultExtractors } from '@lokascript/framework';
 * import { getHyperscriptExtractors } from './extractor-helpers';
 *
 * class EnglishTokenizer extends BaseTokenizer {
 *   constructor() {
 *     super();
 *     this.registerExtractors(getDefaultExtractors());
 *     this.registerExtractors(getHyperscriptExtractors());
 *   }
 * }
 * ```
 */
export function getHyperscriptExtractors(): ValueExtractor[] {
  return [new CssSelectorExtractor(), new EventModifierExtractor(), new UrlExtractor()];
}
