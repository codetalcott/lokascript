/**
 * Bengali Increment Patterns
 *
 * Patterns for parsing "increment" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getIncrementPatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: :counter কে বৃদ্ধি করুন
    {
      id: 'increment-bn-full',
      language: 'bn',
      command: 'increment',
      priority: 100,
      template: {
        format: '{patient} কে বৃদ্ধি করুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'literal', value: 'বৃদ্ধি', alternatives: ['বাড়ান'] },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    // With quantity: :counter কে 5 দিয়ে বৃদ্ধি করুন
    {
      id: 'increment-bn-with-quantity',
      language: 'bn',
      command: 'increment',
      priority: 95,
      template: {
        format: '{patient} কে {quantity} দিয়ে বৃদ্ধি করুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'role', role: 'quantity' },
          { type: 'literal', value: 'দিয়ে' },
          { type: 'literal', value: 'বৃদ্ধি', alternatives: ['বাড়ান'] },
          { type: 'literal', value: 'করুন' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        quantity: { marker: 'দিয়ে', position: 2 },
      },
    },
    // Simple pattern: বৃদ্ধি :counter
    {
      id: 'increment-bn-simple',
      language: 'bn',
      command: 'increment',
      priority: 90,
      template: {
        format: 'বৃদ্ধি {patient}',
        tokens: [
          { type: 'literal', value: 'বৃদ্ধি', alternatives: ['বাড়ান'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
