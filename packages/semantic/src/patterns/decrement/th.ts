/**
 * Thai Decrement Patterns
 *
 * Patterns for parsing "decrement" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getDecrementPatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: ลดค่า :counter
    {
      id: 'decrement-th-simple',
      language: 'th',
      command: 'decrement',
      priority: 100,
      template: {
        format: 'ลดค่า {patient}',
        tokens: [
          { type: 'literal', value: 'ลดค่า' },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With quantity: ลดค่า :counter ด้วย 5
    {
      id: 'decrement-th-with-quantity',
      language: 'th',
      command: 'decrement',
      priority: 95,
      template: {
        format: 'ลดค่า {patient} ด้วย {quantity}',
        tokens: [
          { type: 'literal', value: 'ลดค่า' },
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
