/**
 * Hindi Add Patterns
 *
 * Patterns for parsing "add" command in Hindi.
 */

import type { LanguagePattern } from '../../types';

export function getAddPatternsHi(): LanguagePattern[] {
  return [
    // Full pattern: .class को #element में जोड़ें
    {
      id: 'add-hi-full',
      language: 'hi',
      command: 'add',
      priority: 100,
      template: {
        format: '{patient} को {destination} में जोड़ें',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'को' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'में' },
          { type: 'literal', value: 'जोड़ें', alternatives: ['जोड़'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'में', position: 3 },
      },
    },
    // Simple pattern: .class जोड़ें
    {
      id: 'add-hi-simple',
      language: 'hi',
      command: 'add',
      priority: 90,
      template: {
        format: '{patient} जोड़ें',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'जोड़ें', alternatives: ['जोड़'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    // Bare pattern: जोड़ें .class
    {
      id: 'add-hi-bare',
      language: 'hi',
      command: 'add',
      priority: 80,
      template: {
        format: 'जोड़ें {patient}',
        tokens: [
          { type: 'literal', value: 'जोड़ें', alternatives: ['जोड़'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
  ];
}
