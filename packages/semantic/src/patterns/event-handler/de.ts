/**
 * German Event Handler Patterns
 *
 * Tree-shakeable: Only included when German is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get German event handler patterns.
 */
export function getEventHandlerPatternsDe(): LanguagePattern[] {
  return [
    {
      id: 'event-de-source',
      language: 'de',
      command: 'on',
      priority: 110,
      template: {
        format: 'bei {event} von {source} {body}',
        tokens: [
          { type: 'literal', value: 'bei', alternatives: ['auf'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'von', alternatives: ['aus'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'von', markerAlternatives: ['aus'] },
      },
    },
    {
      id: 'event-de-wenn',
      language: 'de',
      command: 'on',
      priority: 105,
      template: {
        format: 'wenn {event} {body}',
        tokens: [
          { type: 'literal', value: 'wenn', alternatives: ['falls'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-de-standard',
      language: 'de',
      command: 'on',
      priority: 100,
      template: {
        format: 'bei {event} {body}',
        tokens: [
          { type: 'literal', value: 'bei', alternatives: ['auf'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
