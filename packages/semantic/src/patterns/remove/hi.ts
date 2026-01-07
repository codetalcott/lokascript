/**
 * Hindi Remove Patterns
 *
 * Patterns for parsing "remove" command in Hindi.
 */

import type { LanguagePattern } from '../../types';

export function getRemovePatternsHi(): LanguagePattern[] {
  return [
    // Full pattern: .class को #element से हटाएं
    {
      id: 'remove-hi-full',
      language: 'hi',
      command: 'remove',
      priority: 100,
      template: {
        format: '{patient} को {source} से हटाएं',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'को' },
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'से' },
          { type: 'literal', value: 'हटाएं', alternatives: ['हटा', 'मिटाएं'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        source: { marker: 'से', position: 3 },
      },
    },
    // Simple pattern: .class हटाएं
    {
      id: 'remove-hi-simple',
      language: 'hi',
      command: 'remove',
      priority: 90,
      template: {
        format: '{patient} हटाएं',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'हटाएं', alternatives: ['हटा', 'मिटाएं'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        source: { default: { type: 'reference', value: 'me' } },
      },
    },
    // Bare pattern: हटाएं .class
    {
      id: 'remove-hi-bare',
      language: 'hi',
      command: 'remove',
      priority: 80,
      template: {
        format: 'हटाएं {patient}',
        tokens: [
          { type: 'literal', value: 'हटाएं', alternatives: ['हटा', 'मिटाएं'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        source: { default: { type: 'reference', value: 'me' } },
      },
    },
  ];
}
