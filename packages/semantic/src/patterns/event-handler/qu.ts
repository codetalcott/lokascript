/**
 * Quechua Event Handler Patterns
 *
 * Tree-shakeable: Only included when Quechua is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Quechua event handler patterns.
 */
export function getEventHandlerPatternsQu(): LanguagePattern[] {
  return [
    {
      id: 'event-qu-source',
      language: 'qu',
      command: 'on',
      priority: 110,
      template: {
        format: '{event} pi {source} manta {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'pi' },
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'manta' },
        ],
      },
      extraction: {
        event: { position: 0 },
        source: { marker: 'manta' },
      },
    },
    {
      id: 'event-qu-kaqtin',
      language: 'qu',
      command: 'on',
      priority: 105,
      template: {
        format: '{event} kaqtin {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'kaqtin', alternatives: ['qtin', 'ptin'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-qu-standard',
      language: 'qu',
      command: 'on',
      priority: 100,
      template: {
        format: '{event} pi {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'pi', alternatives: ['kaqpi', 'kaqpim'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
  ];
}
