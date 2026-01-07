/**
 * Thai Hide Patterns
 *
 * Patterns for parsing "hide" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getHidePatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: ซ่อน #element
    {
      id: 'hide-th-simple',
      language: 'th',
      command: 'hide',
      priority: 100,
      template: {
        format: 'ซ่อน {patient}',
        tokens: [
          { type: 'literal', value: 'ซ่อน' },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
