/**
 * Temporal Modifiers
 *
 * Provides shared utilities for automatic reversion of DOM changes
 * after a duration or when an event fires.
 *
 * Used by toggle command for "toggle .active for 2s" and "toggle .active until click" syntax.
 *
 * Patterns consolidated:
 * - setupTemporalModifier (toggle.ts)
 * - setupEventModifier (toggle.ts)
 *
 * Estimated savings: ~50 lines in toggle.ts
 */

import { toggleAttribute } from './batch-dom-operations';

// ============================================================================
// Types
// ============================================================================

/**
 * Type of toggle operation to revert
 */
export type ToggleType = 'class' | 'attribute';

/**
 * Cleanup function returned by setup functions
 * Call to cancel the scheduled reversion
 */
export type CleanupFn = () => void;

// ============================================================================
// Reversion Logic
// ============================================================================

/**
 * Create a reversion function for a toggle operation
 *
 * @param element - Element to revert
 * @param toggleType - Type of toggle ('class' or 'attribute')
 * @param identifier - Class name or attribute name to toggle back
 * @returns Function that performs the reversion
 */
export function createReversionFn(
  element: HTMLElement,
  toggleType: ToggleType,
  identifier: string
): () => void {
  return () => {
    if (toggleType === 'class') {
      element.classList.toggle(identifier);
    } else if (toggleType === 'attribute') {
      toggleAttribute(element, identifier);
    }
  };
}

// ============================================================================
// Duration-based Reversion
// ============================================================================

/**
 * Setup automatic reversion after a duration
 *
 * Schedules a toggle reversion to occur after the specified duration.
 * Returns a cleanup function to cancel the scheduled reversion.
 *
 * @param element - Element to modify
 * @param toggleType - Type of toggle ('class' or 'attribute')
 * @param identifier - Class name or attribute name
 * @param duration - Duration in milliseconds
 * @returns Cleanup function to cancel the reversion
 *
 * @example
 * // Toggle class and revert after 2 seconds
 * element.classList.add('active');
 * const cancel = setupDurationReversion(element, 'class', 'active', 2000);
 * // Later, if needed: cancel();
 */
export function setupDurationReversion(
  element: HTMLElement,
  toggleType: ToggleType,
  identifier: string,
  duration: number
): CleanupFn {
  const revert = createReversionFn(element, toggleType, identifier);
  const timeoutId = setTimeout(revert, duration);

  return () => {
    clearTimeout(timeoutId);
  };
}

// ============================================================================
// Event-based Reversion
// ============================================================================

/**
 * Setup automatic reversion when an event fires
 *
 * Listens for the specified event and reverts the toggle when it fires.
 * The event listener is automatically removed after firing (once: true).
 * Returns a cleanup function to remove the listener before it fires.
 *
 * @param element - Element to modify and listen on
 * @param toggleType - Type of toggle ('class' or 'attribute')
 * @param identifier - Class name or attribute name
 * @param eventName - Event name to listen for
 * @returns Cleanup function to remove the event listener
 *
 * @example
 * // Toggle class and revert when user clicks
 * element.classList.add('active');
 * const cancel = setupEventReversion(element, 'class', 'active', 'click');
 * // Later, if needed: cancel();
 */
export function setupEventReversion(
  element: HTMLElement,
  toggleType: ToggleType,
  identifier: string,
  eventName: string
): CleanupFn {
  const revert = createReversionFn(element, toggleType, identifier);

  const handler = () => {
    revert();
    element.removeEventListener(eventName, handler);
  };

  element.addEventListener(eventName, handler, { once: true });

  return () => {
    element.removeEventListener(eventName, handler);
  };
}

// ============================================================================
// Combined Setup
// ============================================================================

/**
 * Options for setting up temporal modifiers
 */
export interface TemporalModifierOptions {
  element: HTMLElement;
  toggleType: ToggleType;
  identifier: string;
  duration?: number;
  untilEvent?: string;
}

/**
 * Setup temporal modifiers for an element
 *
 * Convenience function that sets up both duration and event-based
 * reversions if specified. Returns an array of cleanup functions.
 *
 * @param options - Temporal modifier options
 * @returns Array of cleanup functions
 *
 * @example
 * const cleanups = setupTemporalModifiers({
 *   element: myElement,
 *   toggleType: 'class',
 *   identifier: 'active',
 *   duration: 2000,
 *   untilEvent: 'click'
 * });
 * // Later: cleanups.forEach(fn => fn());
 */
export function setupTemporalModifiers(options: TemporalModifierOptions): CleanupFn[] {
  const { element, toggleType, identifier, duration, untilEvent } = options;
  const cleanups: CleanupFn[] = [];

  if (duration !== undefined && duration > 0) {
    cleanups.push(setupDurationReversion(element, toggleType, identifier, duration));
  }

  if (untilEvent !== undefined && untilEvent.length > 0) {
    cleanups.push(setupEventReversion(element, toggleType, identifier, untilEvent));
  }

  return cleanups;
}

// ============================================================================
// Batch Operations with Temporal Modifiers
// ============================================================================

/**
 * Apply temporal modifiers to multiple elements
 *
 * Sets up duration and/or event-based reversions for each element.
 * Returns a single cleanup function that cancels all reversions.
 *
 * @param elements - Elements to set up modifiers for
 * @param toggleType - Type of toggle ('class' or 'attribute')
 * @param identifier - Class name or attribute name
 * @param duration - Optional duration in milliseconds
 * @param untilEvent - Optional event name to listen for
 * @returns Single cleanup function to cancel all reversions
 */
export function setupTemporalModifiersForElements(
  elements: HTMLElement[],
  toggleType: ToggleType,
  identifier: string,
  duration?: number,
  untilEvent?: string
): CleanupFn {
  const allCleanups: CleanupFn[] = [];

  for (const element of elements) {
    const cleanups = setupTemporalModifiers({
      element,
      toggleType,
      identifier,
      duration,
      untilEvent,
    });
    allCleanups.push(...cleanups);
  }

  return () => {
    for (const cleanup of allCleanups) {
      cleanup();
    }
  };
}
