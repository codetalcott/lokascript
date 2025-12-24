/**
 * Japanese Hide Patterns
 *
 * Hand-crafted patterns for "hide" command.
 * Japanese: {patient} を 非表示
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Japanese hide patterns.
 */
export function getHidePatternsJa(): LanguagePattern[] {
  return [
    {
      id: 'hide-ja-full',
      language: 'ja',
      command: 'hide',
      priority: 100,
      template: {
        format: '{patient} を 非表示',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '非表示', alternatives: ['非表示にする', '隠す', '隠れる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    {
      id: 'hide-ja-imperative',
      language: 'ja',
      command: 'hide',
      priority: 90,
      template: {
        format: '非表示 {patient}',
        tokens: [
          { type: 'literal', value: '非表示', alternatives: ['非表示にする'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'hide-ja-possessive',
      language: 'ja',
      command: 'hide',
      priority: 95,
      template: {
        format: '{destination} の {patient} を 非表示',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'の' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '非表示', alternatives: ['非表示にする', '隠す'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'を' },
      },
    },
  ];
}
