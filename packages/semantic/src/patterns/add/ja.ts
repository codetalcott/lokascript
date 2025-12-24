/**
 * Japanese Add Patterns
 *
 * Hand-crafted patterns for "add" command.
 * Japanese uses SOV order: {target} に {patient} を 追加
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Japanese add patterns.
 */
export function getAddPatternsJa(): LanguagePattern[] {
  return [
    {
      id: 'add-ja-full',
      language: 'ja',
      command: 'add',
      priority: 100,
      template: {
        format: '{destination} に {patient} を 追加',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '追加', alternatives: ['追加する', '加える'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'を' },
      },
    },
    {
      id: 'add-ja-simple',
      language: 'ja',
      command: 'add',
      priority: 90,
      template: {
        format: '{patient} を 追加',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '追加', alternatives: ['追加する', '加える'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'add-ja-possessive',
      language: 'ja',
      command: 'add',
      priority: 95,
      template: {
        format: '{destination} の {patient} を 追加',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'の' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '追加', alternatives: ['追加する'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'を' },
      },
    },
    // Phase 6d: Word order flexibility - verb-first pattern
    {
      id: 'add-ja-verb-first',
      language: 'ja',
      command: 'add',
      priority: 75,
      template: {
        format: '追加 {patient} を',
        tokens: [
          { type: 'literal', value: '追加', alternatives: ['追加する'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
  ];
}
