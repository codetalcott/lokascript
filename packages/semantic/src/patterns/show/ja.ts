/**
 * Japanese Show Patterns
 *
 * Hand-crafted patterns for "show" command.
 * Japanese: {patient} を 表示
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Japanese show patterns.
 */
export function getShowPatternsJa(): LanguagePattern[] {
  return [
    {
      id: 'show-ja-full',
      language: 'ja',
      command: 'show',
      priority: 100,
      template: {
        format: '{patient} を 表示',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '表示', alternatives: ['表示する', '見せる', '示す'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    {
      id: 'show-ja-imperative',
      language: 'ja',
      command: 'show',
      priority: 90,
      template: {
        format: '表示 {patient}',
        tokens: [
          { type: 'literal', value: '表示', alternatives: ['表示する'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'show-ja-possessive',
      language: 'ja',
      command: 'show',
      priority: 95,
      template: {
        format: '{destination} の {patient} を 表示',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'の' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '表示', alternatives: ['表示する'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'を' },
      },
    },
  ];
}
