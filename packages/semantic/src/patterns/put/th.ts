/**
 * Thai Put Patterns
 *
 * Patterns for parsing "put" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getPutPatternsTh(): LanguagePattern[] {
  return [
    // Pattern: ใส่ 'hello' ใน #output
    {
      id: 'put-th-full',
      language: 'th',
      command: 'put',
      priority: 100,
      template: {
        format: 'ใส่ {patient} ใน {destination}',
        tokens: [
          { type: 'literal', value: 'ใส่', alternatives: ['วาง'] },
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
