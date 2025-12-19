/**
 * Spanish Put Patterns
 *
 * Tree-shakeable: Only included when Spanish is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Spanish put patterns.
 */
export function getPutPatternsEs(): LanguagePattern[] {
  return [
    {
      id: 'put-es-full',
      language: 'es',
      command: 'put',
      priority: 100,
      template: {
        format: 'poner {patient} en {destination}',
        tokens: [
          { type: 'literal', value: 'poner', alternatives: ['pon', 'colocar', 'put'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'en', alternatives: ['dentro de', 'a'] },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'en', markerAlternatives: ['dentro de', 'a'] },
      },
    },
    {
      id: 'put-es-before',
      language: 'es',
      command: 'put',
      priority: 95,
      template: {
        format: 'poner {patient} antes de {destination}',
        tokens: [
          { type: 'literal', value: 'poner', alternatives: ['pon', 'colocar'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'antes de', alternatives: ['antes'] },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'antes de', markerAlternatives: ['antes'] },
        manner: { default: { type: 'literal', value: 'before' } },
      },
    },
    {
      id: 'put-es-after',
      language: 'es',
      command: 'put',
      priority: 95,
      template: {
        format: 'poner {patient} después de {destination}',
        tokens: [
          { type: 'literal', value: 'poner', alternatives: ['pon', 'colocar'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'después de', alternatives: ['despues de', 'después'] },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'después de', markerAlternatives: ['despues de', 'después'] },
        manner: { default: { type: 'literal', value: 'after' } },
      },
    },
  ];
}
