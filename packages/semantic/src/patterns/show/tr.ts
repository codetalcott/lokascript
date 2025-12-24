/**
 * Turkish Show Patterns
 *
 * Hand-crafted patterns for "show" command.
 * Turkish: {patient} göster
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Turkish show patterns.
 */
export function getShowPatternsTr(): LanguagePattern[] {
  return [
    {
      id: 'show-tr-full',
      language: 'tr',
      command: 'show',
      priority: 100,
      template: {
        format: '{patient} göster',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'göster', alternatives: ['göstermek', 'gösterme'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    {
      id: 'show-tr-accusative',
      language: 'tr',
      command: 'show',
      priority: 95,
      template: {
        format: "{patient}'i göster",
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: "'i", alternatives: ["'ı", "'u", "'ü", '-i', '-ı'] },
          { type: 'literal', value: 'göster', alternatives: ['göstermek'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    {
      id: 'show-tr-imperative',
      language: 'tr',
      command: 'show',
      priority: 90,
      template: {
        format: 'göster {patient}',
        tokens: [
          { type: 'literal', value: 'göster', alternatives: ['göstermek'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
