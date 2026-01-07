/**
 * Bengali Show Patterns
 *
 * Patterns for parsing "show" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getShowPatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: #element কে দেখান
    {
      id: 'show-bn-full',
      language: 'bn',
      command: 'show',
      priority: 100,
      template: {
        format: '{patient} কে দেখান',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'দেখান', alternatives: ['দেখাও'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // Simple pattern: দেখান #element
    {
      id: 'show-bn-simple',
      language: 'bn',
      command: 'show',
      priority: 90,
      template: {
        format: 'দেখান {patient}',
        tokens: [
          { type: 'literal', value: 'দেখান', alternatives: ['দেখাও'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
