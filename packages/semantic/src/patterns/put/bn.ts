/**
 * Bengali Put Patterns
 *
 * Patterns for parsing "put" command in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getPutPatternsBn(): LanguagePattern[] {
  return [
    // Full pattern: 'hello' কে #output এ রাখুন
    {
      id: 'put-bn-full',
      language: 'bn',
      command: 'put',
      priority: 100,
      template: {
        format: '{patient} কে {destination} এ রাখুন',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'কে' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'এ', alternatives: ['তে'] },
          { type: 'literal', value: 'রাখুন', alternatives: ['রাখ'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'এ', position: 2 },
      },
    },
    // Simple pattern: রাখুন 'hello' #output এ
    {
      id: 'put-bn-simple',
      language: 'bn',
      command: 'put',
      priority: 90,
      template: {
        format: 'রাখুন {patient} {destination} এ',
        tokens: [
          { type: 'literal', value: 'রাখুন', alternatives: ['রাখ'] },
          { type: 'role', role: 'patient' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'এ', alternatives: ['তে'] },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { position: 2 },
      },
    },
  ];
}
