/**
 * Swahili Event Handler Patterns
 *
 * Tree-shakeable: Only included when Swahili is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Swahili event handler patterns.
 */
export function getEventHandlerPatternsSw(): LanguagePattern[] {
  return [
    {
      id: 'event-sw-unapo-source',
      language: 'sw',
      command: 'on',
      priority: 115,
      template: {
        format: 'unapo {event} kutoka {source} {body}',
        tokens: [
          { type: 'literal', value: 'unapo', alternatives: ['wakati wa', 'wakati'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'kutoka' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'kutoka' },
      },
    },
    {
      id: 'event-sw-unapo',
      language: 'sw',
      command: 'on',
      priority: 105,
      template: {
        format: 'unapo {event} {body}',
        tokens: [
          { type: 'literal', value: 'unapo', alternatives: ['wakati wa', 'wakati'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-sw-kwa-source',
      language: 'sw',
      command: 'on',
      priority: 110,
      template: {
        format: 'kwa {event} kutoka {source} {body}',
        tokens: [
          { type: 'literal', value: 'kwa' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'kutoka' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'kutoka' },
      },
    },
    {
      id: 'event-sw-kwa',
      language: 'sw',
      command: 'on',
      priority: 100,
      template: {
        format: 'kwa {event} {body}',
        tokens: [
          { type: 'literal', value: 'kwa' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-sw-ikiwa',
      language: 'sw',
      command: 'on',
      priority: 95,
      template: {
        format: 'ikiwa {event} {body}',
        tokens: [
          { type: 'literal', value: 'ikiwa', alternatives: ['kama'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-sw-baada-ya',
      language: 'sw',
      command: 'on',
      priority: 90,
      template: {
        format: 'baada ya {event} {body}',
        tokens: [
          { type: 'literal', value: 'baada ya' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
