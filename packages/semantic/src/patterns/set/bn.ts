/**
 * Bengali Set Patterns
 *
 * Patterns for parsing "set" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getSetPatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: :x কে 5 এ সেট করুন
    {
      id: 'set-bn-full',
      language: 'bn',
      command: 'set',
      priority: 100,
      template: {
        format: '{patient} কে {goal} এ সেট করুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'এ', alternatives: ['তে'] },
          { type: 'literal', value: 'সেট', alternatives: ['নির্ধারণ'] },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { marker: 'এ', position: 2 },
      },
    },
    // Simple pattern: সেট :x 5
    {
      id: 'set-bn-simple',
      language: 'bn',
      command: 'set',
      priority: 90,
      template: {
        format: 'সেট {patient} {goal}',
        tokens: [
          { type: 'literal', value: 'সেট', alternatives: ['নির্ধারণ'] },
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
