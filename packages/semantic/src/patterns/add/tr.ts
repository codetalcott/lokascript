/**
 * Turkish Add Patterns
 *
 * Hand-crafted patterns for "add" command.
 * Turkish uses SOV order: {target}'a {patient} ekle
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Turkish add patterns.
 */
export function getAddPatternsTr(): LanguagePattern[] {
  return [
    {
      id: 'add-tr-full',
      language: 'tr',
      command: 'add',
      priority: 100,
      template: {
        format: "{destination}'a {patient} ekle",
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: "'a", alternatives: ["'e", "'ya", "'ye", '-a', '-e'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'ekle', alternatives: ['eklemek', 'ekler'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { position: 2 },
      },
    },
    {
      id: 'add-tr-simple',
      language: 'tr',
      command: 'add',
      priority: 90,
      template: {
        format: '{patient} ekle',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'ekle', alternatives: ['eklemek'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'add-tr-locative',
      language: 'tr',
      command: 'add',
      priority: 95,
      template: {
        format: '{destination} için {patient} ekle',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'için' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'ekle', alternatives: ['eklemek'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { position: 2 },
      },
    },
  ];
}
