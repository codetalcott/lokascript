/**
 * Bengali Add Patterns
 *
 * Patterns for parsing "add" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getAddPatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: .active কে যোগ করুন
    {
      id: 'add-bn-full',
      language: 'bn',
      command: 'add',
      priority: 100,
      template: {
        format: '{patient} কে যোগ করুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'যোগ' },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // Simple pattern: যোগ .active
    {
      id: 'add-bn-simple',
      language: 'bn',
      command: 'add',
      priority: 90,
      template: {
        format: 'যোগ {patient}',
        tokens: [
          { type: 'literal', value: 'যোগ' },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With destination: #button এ .active কে যোগ করুন
    {
      id: 'add-bn-with-dest',
      language: 'bn',
      command: 'add',
      priority: 95,
      template: {
        format: '{destination} এ {patient} কে যোগ করুন',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'এ', alternatives: ['তে'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'যোগ' },
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
