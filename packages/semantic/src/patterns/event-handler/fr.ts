/**
 * French Event Handler Patterns
 *
 * Tree-shakeable: Only included when French is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get French event handler patterns.
 */
export function getEventHandlerPatternsFr(): LanguagePattern[] {
  return [
    {
      id: 'event-fr-source',
      language: 'fr',
      command: 'on',
      priority: 110,
      template: {
        format: 'sur {event} de {source} {body}',
        tokens: [
          { type: 'literal', value: 'sur', alternatives: ['lors'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'de', alternatives: ['depuis'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'de', markerAlternatives: ['depuis'] },
      },
    },
    {
      id: 'event-fr-quand',
      language: 'fr',
      command: 'on',
      priority: 105,
      template: {
        format: 'quand {event} {body}',
        tokens: [
          { type: 'literal', value: 'quand', alternatives: ['lorsque'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-fr-standard',
      language: 'fr',
      command: 'on',
      priority: 100,
      template: {
        format: 'sur {event} {body}',
        tokens: [
          { type: 'literal', value: 'sur', alternatives: ['lors'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
