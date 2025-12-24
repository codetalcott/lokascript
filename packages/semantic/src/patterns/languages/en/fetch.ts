/**
 * English Fetch Patterns
 *
 * Hand-crafted patterns for fetch command with response type support.
 */

import type { LanguagePattern } from '../../../types';

/**
 * English: "fetch /url as json" with response type.
 * This pattern has higher priority to capture the "as json" modifier.
 */
export const fetchWithResponseTypeEnglish: LanguagePattern = {
  id: 'fetch-en-with-response-type',
  language: 'en',
  command: 'fetch',
  priority: 90, // Higher than simple pattern (80) to capture "as" modifier first
  template: {
    format: 'fetch {source} as {responseType}',
    tokens: [
      { type: 'literal', value: 'fetch' },
      { type: 'role', role: 'source', expectedTypes: ['literal', 'expression'] },
      { type: 'literal', value: 'as' },
      // json/text/html are identifiers not keywords, so we need to accept 'expression' type
      { type: 'role', role: 'responseType', expectedTypes: ['literal', 'expression'] },
    ],
  },
  extraction: {
    source: { position: 1 },
    responseType: { marker: 'as' },
  },
};

/**
 * English: "fetch /url" without "from" preposition.
 * Official hyperscript allows bare URL without "from".
 * Lower priority so it's tried after the response type pattern.
 */
export const fetchSimpleEnglish: LanguagePattern = {
  id: 'fetch-en-simple',
  language: 'en',
  command: 'fetch',
  priority: 80, // Lower than response type pattern (90) - fallback when "as" not present
  template: {
    format: 'fetch {source}',
    tokens: [
      { type: 'literal', value: 'fetch' },
      { type: 'role', role: 'source' },
    ],
  },
  extraction: {
    source: { position: 1 },
  },
};

/**
 * All English fetch patterns.
 */
export const fetchPatternsEn: LanguagePattern[] = [
  fetchWithResponseTypeEnglish,
  fetchSimpleEnglish,
];
