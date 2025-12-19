/**
 * Chinese Event Handler Patterns
 *
 * Tree-shakeable: Only included when Chinese is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Chinese event handler patterns.
 */
export function getEventHandlerPatternsZh(): LanguagePattern[] {
  return [
    {
      id: 'event-zh-temporal-source',
      language: 'zh',
      command: 'on',
      priority: 115,
      template: {
        format: '{event} 的时候 从 {source} {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '的时候', alternatives: ['时候', '时'] },
          { type: 'literal', value: '从', alternatives: ['在'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 0 },
        source: { marker: '从', markerAlternatives: ['在'] },
      },
    },
    {
      id: 'event-zh-source',
      language: 'zh',
      command: 'on',
      priority: 110,
      template: {
        format: '当 {event} 从 {source} {body}',
        tokens: [
          { type: 'literal', value: '当' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: '从', alternatives: ['在'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: '从', markerAlternatives: ['在'] },
      },
    },
    {
      id: 'event-zh-immediate',
      language: 'zh',
      command: 'on',
      priority: 108,
      template: {
        format: '一 {event} 就 {body}',
        tokens: [
          { type: 'literal', value: '一' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: '就' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-zh-temporal',
      language: 'zh',
      command: 'on',
      priority: 105,
      template: {
        format: '{event} 的时候 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '的时候', alternatives: ['时候', '时'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-zh-whenever',
      language: 'zh',
      command: 'on',
      priority: 103,
      template: {
        format: '每当 {event} {body}',
        tokens: [
          { type: 'literal', value: '每当', alternatives: ['每次'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-zh-standard',
      language: 'zh',
      command: 'on',
      priority: 100,
      template: {
        format: '当 {event} {body}',
        tokens: [
          { type: 'literal', value: '当' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-zh-completion',
      language: 'zh',
      command: 'on',
      priority: 95,
      template: {
        format: '{event} 了 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '了' },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-zh-conditional',
      language: 'zh',
      command: 'on',
      priority: 90,
      template: {
        format: '如果 {event} {body}',
        tokens: [
          { type: 'literal', value: '如果', alternatives: ['若', '假如'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
