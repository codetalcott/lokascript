/**
 * Bengali Hide Patterns
 *
 * Patterns for parsing "hide" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getHidePatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: #element কে লুকান
    {
      id: 'hide-bn-full',
      language: 'bn',
      command: 'hide',
      priority: 100,
      template: {
        format: '{patient} কে লুকান',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'লুকান', alternatives: ['লুকাও'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // Simple pattern: লুকান #element
    {
      id: 'hide-bn-simple',
      language: 'bn',
      command: 'hide',
      priority: 90,
      template: {
        format: 'লুকান {patient}',
        tokens: [
          { type: 'literal', value: 'লুকান', alternatives: ['লুকাও'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
