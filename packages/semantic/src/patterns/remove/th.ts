/**
 * Thai Remove Patterns
 *
 * Patterns for parsing "remove" command in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getRemovePatternsTh(): LanguagePattern[] {
  return [
    // Simple pattern: ลบ .active
    {
      id: 'remove-th-simple',
      language: 'th',
      command: 'remove',
      priority: 100,
      template: {
        format: 'ลบ {patient}',
        tokens: [
          { type: 'literal', value: 'ลบ', alternatives: ['ลบออก'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With source: ลบ .active จาก #button
    {
      id: 'remove-th-with-source',
      language: 'th',
      command: 'remove',
      priority: 95,
      template: {
        format: 'ลบ {patient} จาก {source}',
        tokens: [
          { type: 'literal', value: 'ลบ', alternatives: ['ลบออก'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'จาก' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        source: { marker: 'จาก', position: 3 },
      },
    },
  ];
}
