/**
 * Japanese Put Patterns
 *
 * Tree-shakeable: Only included when Japanese is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Japanese put patterns.
 */
export function getPutPatternsJa(): LanguagePattern[] {
  return [
    {
      id: 'put-ja-full',
      language: 'ja',
      command: 'put',
      priority: 100,
      template: {
        format: '{patient} を {destination} に 置く',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に', alternatives: ['へ'] },
          { type: 'literal', value: '置く', alternatives: ['入れる', 'セット', 'セットする'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'に', markerAlternatives: ['へ'] },
      },
    },
    {
      id: 'put-ja-insert',
      language: 'ja',
      command: 'put',
      priority: 95,
      template: {
        format: '{patient} を {destination} に 入れる',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
          { type: 'literal', value: '入れる' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'に' },
      },
    },
    {
      id: 'put-ja-topic',
      language: 'ja',
      command: 'put',
      priority: 90,
      template: {
        format: '{destination} に {patient} を 置く',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '置く', alternatives: ['入れる'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'を' },
      },
    },
  ];
}
