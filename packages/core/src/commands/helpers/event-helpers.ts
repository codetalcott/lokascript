/**
 * Event Helpers - Shared utilities for event creation and dispatch
 *
 * Used by: send, trigger commands
 *
 * These utilities handle:
 * - Creating CustomEvents with proper options
 * - Parsing string values to appropriate types
 * - Dispatching events on targets
 *
 * Bundle size savings: ~50 lines per command using these helpers
 */

/**
 * Event options for custom events
 */
export interface EventOptions {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

/**
 * Create custom event with detail and options
 *
 * @param eventName - Event name
 * @param detail - Event detail data
 * @param options - Event options (bubbles, cancelable, composed)
 * @returns CustomEvent instance
 */
export function createCustomEvent(
  eventName: string,
  detail: unknown,
  options: EventOptions = {}
): CustomEvent {
  return new CustomEvent(eventName, {
    detail: detail !== undefined ? detail : {},
    bubbles: options.bubbles !== undefined ? options.bubbles : true,
    cancelable: options.cancelable !== undefined ? options.cancelable : true,
    composed: options.composed !== undefined ? options.composed : false,
  });
}

/**
 * Parse string value to appropriate type
 *
 * Converts string literals to numbers, booleans, null, etc.
 *
 * @param value - String value to parse
 * @returns Parsed value
 */
export function parseEventValue(value: string): unknown {
  const trimmed = value.trim();

  // Try to parse as integer
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  // Try to parse as float
  if (/^\d*\.\d+$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Try to parse as boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // Try to parse as null/undefined
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;

  // Remove quotes if present
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Return as string
  return trimmed;
}

/**
 * Dispatch a custom event on a target element
 *
 * @param target - Target element or EventTarget
 * @param eventName - Event name
 * @param detail - Event detail data
 * @param options - Event options
 * @returns The dispatched event
 */
export function dispatchCustomEvent(
  target: EventTarget,
  eventName: string,
  detail: unknown = {},
  options: EventOptions = {}
): CustomEvent {
  const event = createCustomEvent(eventName, detail, options);
  target.dispatchEvent(event);
  return event;
}

/**
 * Dispatch a LokaScript lifecycle event with backward compatibility
 *
 * Dispatches both the new lokascript: prefixed event and the legacy hyperfixi: event
 * for backward compatibility during migration period.
 *
 * @param target - Target element or EventTarget
 * @param eventName - Event name without prefix (e.g., 'pushurl', 'boosted')
 * @param detail - Event detail data
 * @param options - Event options
 * @returns Object with both dispatched events
 */
export function dispatchLokaScriptEvent(
  target: EventTarget,
  eventName: string,
  detail: unknown = {},
  options: EventOptions = {}
): { lokascript: CustomEvent; hyperfixi: CustomEvent } {
  // Dispatch new lokascript: event
  const lokascriptEvent = dispatchCustomEvent(target, `lokascript:${eventName}`, detail, options);

  // Dispatch legacy hyperfixi: event for backward compatibility
  const hyperfixiEvent = dispatchCustomEvent(target, `hyperfixi:${eventName}`, detail, options);

  return {
    lokascript: lokascriptEvent,
    hyperfixi: hyperfixiEvent,
  };
}
