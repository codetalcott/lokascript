/**
 * Turkish Toggle Patterns
 *
 * Tree-shakeable: Only included when Turkish is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Turkish toggle patterns.
 */
export function getTogglePatternsTr(): LanguagePattern[] {
  return [
    {
      id: 'toggle-tr-full',
      language: 'tr',
      command: 'toggle',
      priority: 100,
      template: {
        format: '{target} üzerinde {patient} değiştir',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'üzerinde', alternatives: ['üstünde', 'de', 'da'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'değiştir', alternatives: ['değistir'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { position: 2 },
      },
    },
    {
      id: 'toggle-tr-simple',
      language: 'tr',
      command: 'toggle',
      priority: 90,
      template: {
        format: '{patient} değiştir',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'değiştir', alternatives: ['değistir'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'toggle-tr-imperative',
      language: 'tr',
      command: 'toggle',
      priority: 85,
      template: {
        format: 'değiştir {patient}',
        tokens: [
          { type: 'literal', value: 'değiştir', alternatives: ['değistir'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    // Phase 6d: Object-before-destination scrambled order
    {
      id: 'toggle-tr-scrambled',
      language: 'tr',
      command: 'toggle',
      priority: 70,
      template: {
        format: '{patient} {destination} üzerinde değiştir',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'üzerinde', alternatives: ['üstünde'] },
          { type: 'literal', value: 'değiştir', alternatives: ['değistir'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
      },
    },
  ];
}
