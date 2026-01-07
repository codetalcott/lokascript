/**
 * Thai Increment Patterns
 *
 * Patterns for parsing "increment" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getIncrementPatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: เพิ่มค่า :counter
    {
      id: 'increment-th-simple',
      language: 'th',
      command: 'increment',
      priority: 100,
      template: {
        format: 'เพิ่มค่า {patient}',
        tokens: [
          { type: 'literal', value: 'เพิ่มค่า' },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With quantity: เพิ่มค่า :counter ด้วย 5
    {
      id: 'increment-th-with-quantity',
      language: 'th',
      command: 'increment',
      priority: 95,
      template: {
        format: 'เพิ่มค่า {patient} ด้วย {quantity}',
        tokens: [
          { type: 'literal', value: 'เพิ่มค่า' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'ด้วย' },
          { type: 'role', role: 'quantity' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        quantity: { marker: 'ด้วย', position: 3 },
      },
    },
  ];
}
