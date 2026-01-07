/**
 * Bengali Decrement Patterns
 *
 * Patterns for parsing "decrement" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getDecrementPatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: :counter কে হ্রাস করুন
    {
      id: 'decrement-bn-full',
      language: 'bn',
      command: 'decrement',
      priority: 100,
      template: {
        format: '{patient} কে হ্রাস করুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'হ্রাস', alternatives: ['কমান'] },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // With quantity: :counter কে 5 দিয়ে হ্রাস করুন
    {
      id: 'decrement-bn-with-quantity',
      language: 'bn',
      command: 'decrement',
      priority: 95,
      template: {
        format: '{patient} কে {quantity} দিয়ে হ্রাস করুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'role', role: 'quantity' },
          { type: 'literal', value: 'দিয়ে' },
          { type: 'literal', value: 'হ্রাস', alternatives: ['কমান'] },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        quantity: { marker: 'দিয়ে', position: 2 },
      },
    },
    // Simple pattern: হ্রাস :counter
    {
      id: 'decrement-bn-simple',
      language: 'bn',
      command: 'decrement',
      priority: 90,
      template: {
        format: 'হ্রাস {patient}',
        tokens: [
          { type: 'literal', value: 'হ্রাস', alternatives: ['কমান'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
