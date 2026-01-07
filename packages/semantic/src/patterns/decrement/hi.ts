/**
 * Hindi Decrement Patterns
 *
 * Patterns for parsing "decrement" command in Hindi.
 */

import type { LanguagePattern } from '../../types';

export function getDecrementPatternsHi(): LanguagePattern[] {
  return [
    // Full pattern: :counter को घटाएं
    {
      id: 'decrement-hi-full',
      language: 'hi',
      command: 'decrement',
      priority: 100,
      template: {
        format: '{patient} को घटाएं',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'को' },
          { type: 'literal', value: 'घटाएं', alternatives: ['घटा'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // With quantity: :counter को 5 से घटाएं
    {
      id: 'decrement-hi-with-quantity',
      language: 'hi',
      command: 'decrement',
      priority: 95,
      template: {
        format: '{patient} को {quantity} से घटाएं',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'को' },
          { type: 'role', role: 'quantity' },
          { type: 'literal', value: 'से' },
          { type: 'literal', value: 'घटाएं', alternatives: ['घटा'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        quantity: { marker: 'से', position: 2 },
      },
    },
    // Simple pattern: घटाएं :counter
    {
      id: 'decrement-hi-simple',
      language: 'hi',
      command: 'decrement',
      priority: 90,
      template: {
        format: 'घटाएं {patient}',
        tokens: [
          { type: 'literal', value: 'घटाएं', alternatives: ['घटा'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
