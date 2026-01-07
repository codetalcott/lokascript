/**
 * Bengali Get Patterns
 *
 * Patterns for parsing "get" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getGetPatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: :x থেকে পান
    {
      id: 'get-bn-full',
      language: 'bn',
      command: 'get',
      priority: 100,
      template: {
        format: '{source} থেকে পান',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'থেকে' },
          { type: 'literal', value: 'পান', alternatives: ['নিন'] },
        ],
      },
      extraction: {
        source: { position: 0 },
      },
    },
    // Simple pattern: পান :x
    {
      id: 'get-bn-simple',
      language: 'bn',
      command: 'get',
      priority: 90,
      template: {
        format: 'পান {source}',
        tokens: [
          { type: 'literal', value: 'পান', alternatives: ['নিন'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        source: { position: 1 },
      },
    },
  ];
}
