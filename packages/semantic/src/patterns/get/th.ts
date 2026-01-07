/**
 * Thai Get Patterns
 *
 * Patterns for parsing "get" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getGetPatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: รับค่า :x
    {
      id: 'get-th-simple',
      language: 'th',
      command: 'get',
      priority: 100,
      template: {
        format: 'รับค่า {source}',
        tokens: [
          { type: 'literal', value: 'รับค่า' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        source: { position: 1 },
      },
    },
  ];
}
