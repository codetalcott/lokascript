/**
 * Thai Set Patterns
 *
 * Patterns for parsing "set" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getSetPatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: ตั้ง :x 5
    {
      id: 'set-th-simple',
      language: 'th',
      command: 'set',
      priority: 100,
      template: {
        format: 'ตั้ง {patient} {goal}',
        tokens: [
          { type: 'literal', value: 'ตั้ง', alternatives: ['กำหนด'] },
          { type: 'role', role: 'patient' },
          { type: 'role', role: 'goal' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        goal: { position: 2 },
      },
    },
  ];
}
