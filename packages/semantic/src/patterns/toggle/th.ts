/**
 * Thai Toggle Patterns
 *
 * Patterns for parsing "toggle" command in Thai.
 * Thai is SVO with no word spaces.
 */

import type { LanguagePattern } from '../../types';

export function getTogglePatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: สลับ .active
    {
      id: 'toggle-th-simple',
      language: 'th',
      command: 'toggle',
      priority: 100,
      template: {
        format: 'สลับ {patient}',
        tokens: [
          { type: 'literal', value: 'สลับ' },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With destination: สลับ .active ใน #button
    {
      id: 'toggle-th-with-dest',
      language: 'th',
      command: 'toggle',
      priority: 95,
      template: {
        format: 'สลับ {patient} ใน {destination}',
        tokens: [
          { type: 'literal', value: 'สลับ' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'ใน' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'ใน', position: 3 },
      },
    },
  ];
}
