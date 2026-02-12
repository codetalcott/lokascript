/**
 * Event Modifier Extractor
 *
 * Extracts event modifiers: .once, .debounce(300), .throttle(100), .queue(strategy)
 * This is hyperscript-specific syntax.
 */

import type { ValueExtractor, ExtractionResult } from '../value-extractor-types';

/**
 * EventModifierExtractor - Extracts event modifiers for hyperscript.
 */
export class EventModifierExtractor implements ValueExtractor {
  readonly name = 'event-modifier';

  canExtract(input: string, position: number): boolean {
    if (input[position] !== '.') return false;

    // Check if this looks like an event modifier
    const remaining = input.slice(position);
    return /^\.(once|prevent|stop|debounce|throttle|queue)/.test(remaining);
  }

  extract(input: string, position: number): ExtractionResult | null {
    // Match pattern: .(once|prevent|stop|debounce|throttle|queue) followed by optional (value)
    const match = input
      .slice(position)
      .match(/^\.(?:once|prevent|stop|debounce|throttle|queue)(?:\(([^)]+)\))?/);

    if (!match) return null;

    const fullMatch = match[0];
    const modifierName = fullMatch.slice(1).split('(')[0]; // Extract modifier name
    const value = match[1]; // Extract value from parentheses if present

    return {
      value: fullMatch,
      length: fullMatch.length,
      metadata: {
        type: 'event-modifier',
        modifierName,
        value: value ? (modifierName === 'queue' ? value : parseInt(value, 10)) : undefined,
      },
    };
  }
}
