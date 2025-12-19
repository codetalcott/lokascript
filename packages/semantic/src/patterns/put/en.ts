/**
 * English Put Patterns
 *
 * Tree-shakeable: Only included when English is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get English put patterns.
 */
export function getPutPatternsEn(): LanguagePattern[] {
  return [
    {
      id: 'put-en-into',
      language: 'en',
      command: 'put',
      priority: 100,
      template: {
        format: 'put {patient} into {destination}',
        tokens: [
          { type: 'literal', value: 'put' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'into', alternatives: ['in', 'to'] },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'into', markerAlternatives: ['in', 'to'] },
      },
    },
    {
      id: 'put-en-before',
      language: 'en',
      command: 'put',
      priority: 95,
      template: {
        format: 'put {patient} before {destination}',
        tokens: [
          { type: 'literal', value: 'put' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'before' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'before' },
        manner: { default: { type: 'literal', value: 'before' } },
      },
    },
    {
      id: 'put-en-after',
      language: 'en',
      command: 'put',
      priority: 95,
      template: {
        format: 'put {patient} after {destination}',
        tokens: [
          { type: 'literal', value: 'put' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'after' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'after' },
        manner: { default: { type: 'literal', value: 'after' } },
      },
    },
  ];
}
