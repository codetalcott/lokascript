/**
 * Thai Show Patterns
 *
 * Patterns for parsing "show" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getShowPatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: แสดง #element
    {
      id: 'show-th-simple',
      language: 'th',
      command: 'show',
      priority: 100,
      template: {
        format: 'แสดง {patient}',
        tokens: [
          { type: 'literal', value: 'แสดง' },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
