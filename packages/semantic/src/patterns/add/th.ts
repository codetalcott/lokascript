/**
 * Thai Add Patterns
 *
 * Patterns for parsing "add" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getAddPatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: เพิ่ม .active
    {
      id: 'add-th-simple',
      language: 'th',
      command: 'add',
      priority: 100,
      template: {
        format: 'เพิ่ม {patient}',
        tokens: [
          { type: 'literal', value: 'เพิ่ม' },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With destination: เพิ่ม .active ใน #button
    {
      id: 'add-th-with-dest',
      language: 'th',
      command: 'add',
      priority: 95,
      template: {
        format: 'เพิ่ม {patient} ใน {destination}',
        tokens: [
          { type: 'literal', value: 'เพิ่ม' },
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
