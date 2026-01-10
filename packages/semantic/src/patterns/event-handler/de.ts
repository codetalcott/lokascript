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
      id: 'event-de-wenn-source',
      language: 'de',
      command: 'on',
      priority: 115,
      template: {
        format: 'wenn {event} von {source} {body}',
        tokens: [
          { type: 'literal', value: 'wenn', alternatives: ['falls', 'sobald'] },
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
          { type: 'literal', value: 'wenn', alternatives: ['falls', 'sobald'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-de-bei-source',
      language: 'de',
      command: 'on',
      priority: 110,
      template: {
        format: 'bei {event} von {source} {body}',
        tokens: [
          { type: 'literal', value: 'bei', alternatives: ['beim'] },
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
      id: 'event-de-bei',
      language: 'de',
      command: 'on',
      priority: 100,
      template: {
        format: 'bei {event} {body}',
        tokens: [
          { type: 'literal', value: 'bei', alternatives: ['beim'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-de-auf',
      language: 'de',
      command: 'on',
      priority: 95,
      template: {
        format: 'auf {event} {body}',
        tokens: [
          { type: 'literal', value: 'auf' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-de-im-falle',
      language: 'de',
      command: 'on',
      priority: 90,
      template: {
        format: 'im Falle von {event} {body}',
        tokens: [
          { type: 'literal', value: 'im Falle von', alternatives: ['im Fall von'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
