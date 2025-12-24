/**
 * Turkish Set Patterns
 *
 * Hand-crafted patterns for "set" command.
 * Turkish: {destination}'i {patient} olarak ayarla
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Turkish set patterns.
 */
export function getSetPatternsTr(): LanguagePattern[] {
  return [
    {
      id: 'set-tr-full',
      language: 'tr',
      command: 'set',
      priority: 100,
      template: {
        format: "{destination}'i {patient} olarak ayarla",
        tokens: [
          { type: 'role', role: 'destination', expectedTypes: ['property-path', 'selector', 'reference', 'expression'] },
          { type: 'literal', value: "'i", alternatives: ["'ı", "'u", "'ü", '-i', '-ı'] },
          { type: 'role', role: 'patient', expectedTypes: ['literal', 'expression', 'reference'] },
          { type: 'literal', value: 'olarak' },
          { type: 'literal', value: 'ayarla', alternatives: ['ayarlamak', 'belirle', 'koy'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { position: 2 },
      },
    },
    {
      id: 'set-tr-simple',
      language: 'tr',
      command: 'set',
      priority: 90,
      template: {
        format: '{destination} {patient} ayarla',
        tokens: [
          { type: 'role', role: 'destination', expectedTypes: ['property-path', 'selector', 'reference', 'expression'] },
          { type: 'role', role: 'patient', expectedTypes: ['literal', 'expression', 'reference'] },
          { type: 'literal', value: 'ayarla', alternatives: ['ayarlamak'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { position: 1 },
      },
    },
    {
      id: 'set-tr-equals',
      language: 'tr',
      command: 'set',
      priority: 95,
      template: {
        format: '{destination} = {patient}',
        tokens: [
          { type: 'role', role: 'destination', expectedTypes: ['property-path', 'selector', 'reference', 'expression'] },
          { type: 'literal', value: '=' },
          { type: 'role', role: 'patient', expectedTypes: ['literal', 'expression', 'reference'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { position: 2 },
      },
    },
  ];
}
