/**
 * English Repeat Patterns
 *
 * Hand-crafted patterns for repeat command with event termination.
 */

import type { LanguagePattern } from '../../../types';

/**
 * English: "repeat until event pointerup from document"
 * Full form with event source specification.
 * Higher priority to capture the complete "until event X from Y" syntax.
 */
export const repeatUntilEventFromEnglish: LanguagePattern = {
  id: 'repeat-en-until-event-from',
  language: 'en',
  command: 'repeat',
  priority: 120, // Highest priority - most specific pattern
  template: {
    format: 'repeat until event {event} from {source}',
    tokens: [
      { type: 'literal', value: 'repeat' },
      { type: 'literal', value: 'until' },
      { type: 'literal', value: 'event' },
      { type: 'role', role: 'event', expectedTypes: ['literal', 'expression'] },
      { type: 'literal', value: 'from' },
      { type: 'role', role: 'source', expectedTypes: ['selector', 'reference', 'expression'] },
    ],
  },
  extraction: {
    event: { marker: 'event' },
    source: { marker: 'from' },
    loopType: { default: { type: 'literal', value: 'until-event' } },
  },
};

/**
 * English: "repeat until event pointerup"
 * Simple event termination without source.
 */
export const repeatUntilEventEnglish: LanguagePattern = {
  id: 'repeat-en-until-event',
  language: 'en',
  command: 'repeat',
  priority: 110, // Lower than "from" variant, but higher than quantity-based repeat
  template: {
    format: 'repeat until event {event}',
    tokens: [
      { type: 'literal', value: 'repeat' },
      { type: 'literal', value: 'until' },
      { type: 'literal', value: 'event' },
      { type: 'role', role: 'event', expectedTypes: ['literal', 'expression'] },
    ],
  },
  extraction: {
    event: { marker: 'event' },
    loopType: { default: { type: 'literal', value: 'until-event' } },
  },
};

/**
 * All English repeat patterns.
 */
export const repeatPatternsEn: LanguagePattern[] = [
  repeatUntilEventFromEnglish,
  repeatUntilEventEnglish,
];
