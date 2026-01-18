/**
 * Arabic Take Patterns
 *
 * Tree-shakeable: Only included when Arabic is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Arabic take patterns.
 */
export function getTakePatternsAr(): LanguagePattern[] {
  return [
    {
      id: 'take-ar-full',
      language: 'ar',
      command: 'take',
      priority: 110,
      template: {
        format: 'خذ {patient} من {source}',
        tokens: [
          { type: 'literal', value: 'خذ', alternatives: ['احصل'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'من' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        source: { marker: 'من' },
      },
    },
    {
      id: 'take-ar-source-only',
      language: 'ar',
      command: 'take',
      priority: 100,
      template: {
        format: 'خذ من {source}',
        tokens: [
          { type: 'literal', value: 'خذ', alternatives: ['احصل'] },
          { type: 'literal', value: 'من' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        source: { marker: 'من' },
      },
    },
  ];
}
