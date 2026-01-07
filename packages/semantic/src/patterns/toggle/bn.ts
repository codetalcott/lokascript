/**
 * Bengali Toggle Patterns
 *
 * Patterns for parsing "toggle" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getTogglePatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: .active কে টগল করুন
    {
      id: 'toggle-bn-full',
      language: 'bn',
      command: 'toggle',
      priority: 100,
      template: {
        format: '{patient} কে টগল করুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'টগল', alternatives: ['পরিবর্তন'] },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // Simple pattern: টগল .active
    {
      id: 'toggle-bn-simple',
      language: 'bn',
      command: 'toggle',
      priority: 90,
      template: {
        format: 'টগল {patient}',
        tokens: [
          { type: 'literal', value: 'টগল', alternatives: ['পরিবর্তন'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With destination: #button এ .active কে টগল করুন
    {
      id: 'toggle-bn-with-dest',
      language: 'bn',
      command: 'toggle',
      priority: 95,
      template: {
        format: '{destination} এ {patient} কে টগল করুন',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'এ', alternatives: ['তে'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'টগল', alternatives: ['পরিবর্তন'] },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { position: 2 },
      },
    },
  ];
}
