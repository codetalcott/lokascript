/**
 * Turkish Hide Patterns
 *
 * Hand-crafted patterns for "hide" command.
 * Turkish: {patient} gizle
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Turkish hide patterns.
 */
export function getHidePatternsTr(): LanguagePattern[] {
  return [
    {
      id: 'hide-tr-full',
      language: 'tr',
      command: 'hide',
      priority: 100,
      template: {
        format: '{patient} gizle',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'gizle', alternatives: ['gizlemek', 'sakla', 'saklamak'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    {
      id: 'hide-tr-accusative',
      language: 'tr',
      command: 'hide',
      priority: 95,
      template: {
        format: "{patient}'i gizle",
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: "'i", alternatives: ["'ı", "'u", "'ü", '-i', '-ı'] },
          { type: 'literal', value: 'gizle', alternatives: ['gizlemek', 'sakla'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    {
      id: 'hide-tr-imperative',
      language: 'tr',
      command: 'hide',
      priority: 90,
      template: {
        format: 'gizle {patient}',
        tokens: [
          { type: 'literal', value: 'gizle', alternatives: ['gizlemek', 'sakla'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
