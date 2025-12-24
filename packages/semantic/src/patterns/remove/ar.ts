/**
 * Arabic Remove Patterns
 *
 * Hand-crafted patterns for "remove" command.
 * Arabic uses VSO order: احذف {patient} من {target}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Arabic remove patterns.
 */
export function getRemovePatternsAr(): LanguagePattern[] {
  return [
    {
      id: 'remove-ar-full',
      language: 'ar',
      command: 'remove',
      priority: 100,
      template: {
        format: 'احذف {patient} من {destination}',
        tokens: [
          { type: 'literal', value: 'احذف', alternatives: ['أحذف', 'أزل', 'ازل', 'إزالة'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'من' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'من' },
      },
    },
    {
      id: 'remove-ar-simple',
      language: 'ar',
      command: 'remove',
      priority: 90,
      template: {
        format: 'احذف {patient}',
        tokens: [
          { type: 'literal', value: 'احذف', alternatives: ['أحذف', 'أزل', 'ازل'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'remove-ar-with-عن',
      language: 'ar',
      command: 'remove',
      priority: 95,
      template: {
        format: 'احذف {patient} عن {destination}',
        tokens: [
          { type: 'literal', value: 'احذف', alternatives: ['أحذف'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'عن' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'عن' },
      },
    },
  ];
}
