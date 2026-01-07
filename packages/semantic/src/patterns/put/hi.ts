/**
 * Hindi Put Patterns
 *
 * Patterns for parsing "put" command in Hindi.
 */

import type { LanguagePattern } from '../../types';

export function getPutPatternsHi(): LanguagePattern[] {
  return [
    // Full pattern: "text" को #element में रखें
    {
      id: 'put-hi-full',
      language: 'hi',
      command: 'put',
      priority: 100,
      template: {
        format: '{patient} को {destination} में रखें',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'को' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'में' },
          { type: 'literal', value: 'रखें', alternatives: ['रख', 'डालें', 'डाल'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'में', position: 3 },
      },
    },
    // Simple pattern: "text" रखें
    {
      id: 'put-hi-simple',
      language: 'hi',
      command: 'put',
      priority: 90,
      template: {
        format: '{patient} रखें',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'रखें', alternatives: ['रख', 'डालें', 'डाल'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    // Bare pattern: रखें "text"
    {
      id: 'put-hi-bare',
      language: 'hi',
      command: 'put',
      priority: 80,
      template: {
        format: 'रखें {patient}',
        tokens: [
          { type: 'literal', value: 'रखें', alternatives: ['रख', 'डालें', 'डाल'] },
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
