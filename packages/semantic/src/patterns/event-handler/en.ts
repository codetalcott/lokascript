/**
 * English Event Handler Patterns
 *
 * Tree-shakeable: Only included when English is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get English event handler patterns.
 */
export function getEventHandlerPatternsEn(): LanguagePattern[] {
  return [
    {
      id: 'event-en-when-source',
      language: 'en',
      command: 'on',
      priority: 115,
      template: {
        format: 'when {event} from {source} {body}',
        tokens: [
          { type: 'literal', value: 'when' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'from' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'from' },
      },
    },
    {
      id: 'event-en-when',
      language: 'en',
      command: 'on',
      priority: 105,
      template: {
        format: 'when {event} {body}',
        tokens: [
          { type: 'literal', value: 'when' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-en-source',
      language: 'en',
      command: 'on',
      priority: 110,
      template: {
        format: 'on {event} from {source} {body}',
        tokens: [
          { type: 'literal', value: 'on' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'from' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'from' },
      },
    },
    {
      id: 'event-en-standard',
      language: 'en',
      command: 'on',
      priority: 100,
      template: {
        format: 'on {event} {body}',
        tokens: [
          { type: 'literal', value: 'on' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-en-upon',
      language: 'en',
      command: 'on',
      priority: 98,
      template: {
        format: 'upon {event} {body}',
        tokens: [
          { type: 'literal', value: 'upon' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-en-if',
      language: 'en',
      command: 'on',
      priority: 95,
      template: {
        format: 'if {event} {body}',
        tokens: [
          { type: 'literal', value: 'if' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
