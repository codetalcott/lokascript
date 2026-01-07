/**
 * Bengali Remove Patterns
 *
 * Patterns for parsing "remove" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getRemovePatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: .active কে সরান
    {
      id: 'remove-bn-full',
      language: 'bn',
      command: 'remove',
      priority: 100,
      template: {
        format: '{patient} কে সরান',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'সরান', alternatives: ['মুছুন'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // Simple pattern: সরান .active
    {
      id: 'remove-bn-simple',
      language: 'bn',
      command: 'remove',
      priority: 90,
      template: {
        format: 'সরান {patient}',
        tokens: [
          { type: 'literal', value: 'সরান', alternatives: ['মুছুন'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    // With source: #button থেকে .active কে সরান
    {
      id: 'remove-bn-with-source',
      language: 'bn',
      command: 'remove',
      priority: 95,
      template: {
        format: '{source} থেকে {patient} কে সরান',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'থেকে' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'সরান', alternatives: ['মুছুন'] },
        ],
      },
      extraction: {
        source: { position: 0 },
        patient: { position: 2 },
      },
    },
  ];
}
