/**
 * Arabic Put Patterns
 *
 * Tree-shakeable: Only included when Arabic is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Arabic put patterns.
 */
export function getPutPatternsAr(): LanguagePattern[] {
  return [
    {
      id: 'put-ar-full',
      language: 'ar',
      command: 'put',
      priority: 100,
      template: {
        format: 'ضع {patient} في {destination}',
        tokens: [
          { type: 'literal', value: 'ضع', alternatives: ['اضع', 'يضع'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'في', alternatives: ['إلى', 'الى'] },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'في', markerAlternatives: ['إلى', 'الى'] },
      },
    },
    {
      id: 'put-ar-before',
      language: 'ar',
      command: 'put',
      priority: 95,
      template: {
        format: 'ضع {patient} قبل {destination}',
        tokens: [
          { type: 'literal', value: 'ضع' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'قبل' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'قبل' },
        manner: { default: { type: 'literal', value: 'before' } },
      },
    },
    {
      id: 'put-ar-after',
      language: 'ar',
      command: 'put',
      priority: 95,
      template: {
        format: 'ضع {patient} بعد {destination}',
        tokens: [
          { type: 'literal', value: 'ضع' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'بعد' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'بعد' },
        manner: { default: { type: 'literal', value: 'after' } },
      },
    },
  ];
}
