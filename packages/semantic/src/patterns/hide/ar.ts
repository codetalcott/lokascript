/**
 * Arabic Hide Patterns
 *
 * Hand-crafted patterns for "hide" command.
 * Arabic: أخفِ {patient}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Arabic hide patterns.
 */
export function getHidePatternsAr(): LanguagePattern[] {
  return [
    {
      id: 'hide-ar-full',
      language: 'ar',
      command: 'hide',
      priority: 100,
      template: {
        format: 'أخفِ {patient}',
        tokens: [
          { type: 'literal', value: 'أخفِ', alternatives: ['اخف', 'أخف', 'اخفي', 'إخفاء'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'hide-ar-with-من',
      language: 'ar',
      command: 'hide',
      priority: 95,
      template: {
        format: 'أخفِ {patient} من {destination}',
        tokens: [
          { type: 'literal', value: 'أخفِ', alternatives: ['اخف', 'أخف'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'من' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'من' },
      },
    },
    {
      id: 'hide-ar-definite',
      language: 'ar',
      command: 'hide',
      priority: 90,
      template: {
        format: 'إخفاء {patient}',
        tokens: [
          { type: 'literal', value: 'إخفاء', alternatives: ['اخفاء'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
