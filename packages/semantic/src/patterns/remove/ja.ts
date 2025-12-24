/**
 * Japanese Remove Patterns
 *
 * Hand-crafted patterns for "remove" command.
 * Japanese uses SOV order: {target} から {patient} を 削除
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Japanese remove patterns.
 */
export function getRemovePatternsJa(): LanguagePattern[] {
  return [
    {
      id: 'remove-ja-full',
      language: 'ja',
      command: 'remove',
      priority: 100,
      template: {
        format: '{destination} から {patient} を 削除',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'から' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '削除', alternatives: ['削除する', '除去', '取り除く'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'を' },
      },
    },
    {
      id: 'remove-ja-simple',
      language: 'ja',
      command: 'remove',
      priority: 90,
      template: {
        format: '{patient} を 削除',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '削除', alternatives: ['削除する', '除去', '取り除く'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'remove-ja-possessive',
      language: 'ja',
      command: 'remove',
      priority: 95,
      template: {
        format: '{destination} の {patient} を 削除',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'の' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '削除', alternatives: ['削除する'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'を' },
      },
    },
  ];
}
