/**
 * Hindi Increment Patterns
 *
 * Patterns for parsing "increment" command in Hindi.
 */

import type { LanguagePattern } from '../../types';

export function getIncrementPatternsHi(): LanguagePattern[] {
  return [
    // Full pattern: :counter को बढ़ाएं
    {
      id: 'increment-hi-full',
      language: 'hi',
      command: 'increment',
      priority: 100,
      template: {
        format: '{patient} को बढ़ाएं',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'को' },
          { type: 'literal', value: 'बढ़ाएं', alternatives: ['बढ़ा'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // With quantity: :counter को 5 से बढ़ाएं
    {
      id: 'increment-hi-with-quantity',
      language: 'hi',
      command: 'increment',
      priority: 95,
      template: {
        format: '{patient} को {quantity} से बढ़ाएं',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'को' },
          { type: 'role', role: 'quantity' },
          { type: 'literal', value: 'से' },
          { type: 'literal', value: 'बढ़ाएं', alternatives: ['बढ़ा'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        quantity: { marker: 'से', position: 2 },
      },
    },
    // Simple pattern: बढ़ाएं :counter
    {
      id: 'increment-hi-simple',
      language: 'hi',
      command: 'increment',
      priority: 90,
      template: {
        format: 'बढ़ाएं {patient}',
        tokens: [
          { type: 'literal', value: 'बढ़ाएं', alternatives: ['बढ़ा'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
