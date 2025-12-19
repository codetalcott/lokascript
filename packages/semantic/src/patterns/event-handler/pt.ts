/**
 * Portuguese Event Handler Patterns
 *
 * Tree-shakeable: Only included when Portuguese is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Portuguese event handler patterns.
 */
export function getEventHandlerPatternsPt(): LanguagePattern[] {
  return [
    {
      id: 'event-pt-ao-source',
      language: 'pt',
      command: 'on',
      priority: 115,
      template: {
        format: 'ao {event} em {source} {body}',
        tokens: [
          { type: 'literal', value: 'ao', alternatives: ['à'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'em', alternatives: ['de', 'no', 'na'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'em', markerAlternatives: ['de', 'no', 'na'] },
      },
    },
    {
      id: 'event-pt-quando-source',
      language: 'pt',
      command: 'on',
      priority: 110,
      template: {
        format: 'quando {event} de {source} {body}',
        tokens: [
          { type: 'literal', value: 'quando' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'de', alternatives: ['em', 'no', 'na'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'de', markerAlternatives: ['em', 'no', 'na'] },
      },
    },
    {
      id: 'event-pt-ao',
      language: 'pt',
      command: 'on',
      priority: 105,
      template: {
        format: 'ao {event} {body}',
        tokens: [
          { type: 'literal', value: 'ao', alternatives: ['à'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-pt-quando',
      language: 'pt',
      command: 'on',
      priority: 100,
      template: {
        format: 'quando {event} {body}',
        tokens: [
          { type: 'literal', value: 'quando' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-pt-em',
      language: 'pt',
      command: 'on',
      priority: 95,
      template: {
        format: 'em {event} {body}',
        tokens: [
          { type: 'literal', value: 'em', alternatives: ['no', 'na'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-pt-se',
      language: 'pt',
      command: 'on',
      priority: 90,
      template: {
        format: 'se {event} {body}',
        tokens: [
          { type: 'literal', value: 'se' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
