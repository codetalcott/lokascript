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
      id: 'event-fr-quand-source',
      language: 'fr',
      command: 'on',
      priority: 115,
      template: {
        format: 'quand {event} de {source} {body}',
        tokens: [
          { type: 'literal', value: 'quand', alternatives: ['lorsque'] },
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
      id: 'event-fr-sur-source',
      language: 'fr',
      command: 'on',
      priority: 110,
      template: {
        format: 'sur {event} de {source} {body}',
        tokens: [
          { type: 'literal', value: 'sur', alternatives: ['lors de'] },
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
      id: 'event-fr-sur',
      language: 'fr',
      command: 'on',
      priority: 100,
      template: {
        format: 'sur {event} {body}',
        tokens: [
          { type: 'literal', value: 'sur', alternatives: ['lors de'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-fr-si',
      language: 'fr',
      command: 'on',
      priority: 95,
      template: {
        format: 'si {event} {body}',
        tokens: [
          { type: 'literal', value: 'si' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-fr-a',
      language: 'fr',
      command: 'on',
      priority: 90,
      template: {
        format: 'à {event} {body}',
        tokens: [
          { type: 'literal', value: 'à', alternatives: ['au'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
