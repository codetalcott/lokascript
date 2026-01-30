import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupDurationReversion,
  setupEventReversion,
  setupTemporalModifiers,
  setupTemporalModifiersForElements,
  createReversionFn,
} from '../temporal-modifiers';

describe('Temporal Modifiers', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    element.id = 'test';
    document.body.appendChild(element);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('createReversionFn', () => {
    it('should toggle class when toggleType is "class"', () => {
      element.classList.add('active');
      expect(element.classList.contains('active')).toBe(true);

      const revertFn = createReversionFn(element, 'class', 'active');
      revertFn();

      expect(element.classList.contains('active')).toBe(false);
    });

    it('should toggle attribute when toggleType is "attribute"', () => {
      element.setAttribute('disabled', '');
      expect(element.hasAttribute('disabled')).toBe(true);

      const revertFn = createReversionFn(element, 'attribute', 'disabled');
      revertFn();

      expect(element.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('setupDurationReversion', () => {
    it('should revert class after specified duration', () => {
      element.classList.add('active');
      expect(element.classList.contains('active')).toBe(true);

      setupDurationReversion(element, 'class', 'active', 1000);

      // Before duration
      vi.advanceTimersByTime(500);
      expect(element.classList.contains('active')).toBe(true);

      // After duration
      vi.advanceTimersByTime(500);
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should allow cancellation via cleanup function', () => {
      element.classList.add('active');

      const cleanup = setupDurationReversion(element, 'class', 'active', 1000);

      // Cancel before timeout
      cleanup();
      vi.advanceTimersByTime(1000);

      // Class should NOT be reverted
      expect(element.classList.contains('active')).toBe(true);
    });

    it('should handle zero duration', () => {
      element.classList.add('active');

      setupDurationReversion(element, 'class', 'active', 0);

      // Zero duration behaves like setTimeout(fn, 0) - fires immediately
      vi.runAllTimers();

      // Class should be reverted
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should handle negative duration', () => {
      element.classList.add('active');

      setupDurationReversion(element, 'class', 'active', -100);

      // Negative duration behaves like setTimeout(fn, 0) - fires immediately
      vi.runAllTimers();

      // Class should be reverted
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should cleanup and clear timeout when cleanup is called', () => {
      element.classList.add('active');

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const cleanup = setupDurationReversion(element, 'class', 'active', 1000);

      cleanup();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('setupEventReversion', () => {
    it('should revert class when event is fired', () => {
      element.classList.add('active');
      expect(element.classList.contains('active')).toBe(true);

      setupEventReversion(element, 'class', 'active', 'click');

      // Fire event
      element.dispatchEvent(new Event('click'));

      expect(element.classList.contains('active')).toBe(false);
    });

    it('should remove listener after first event (once behavior)', () => {
      element.classList.add('active');

      setupEventReversion(element, 'class', 'active', 'click');

      // First click should revert
      element.dispatchEvent(new Event('click'));
      expect(element.classList.contains('active')).toBe(false);

      // Add class back and fire again
      element.classList.add('active');
      element.dispatchEvent(new Event('click'));

      // Should NOT revert again (listener was removed)
      expect(element.classList.contains('active')).toBe(true);
    });

    it('should allow cancellation via cleanup function', () => {
      element.classList.add('active');

      const cleanup = setupEventReversion(element, 'class', 'active', 'click');

      // Cancel before event
      cleanup();

      // Fire event
      element.dispatchEvent(new Event('click'));

      // Class should NOT be reverted
      expect(element.classList.contains('active')).toBe(true);
    });

    it('should handle custom events', () => {
      element.setAttribute('data-state', 'loading');
      expect(element.hasAttribute('data-state')).toBe(true);

      setupEventReversion(element, 'attribute', 'data-state', 'loadComplete');

      // Fire custom event
      element.dispatchEvent(new Event('loadComplete'));

      expect(element.hasAttribute('data-state')).toBe(false);
    });
  });

  describe('setupTemporalModifiers', () => {
    it('should set up both duration and event modifiers', () => {
      element.classList.add('active');

      const cleanups = setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: 1000,
        untilEvent: 'click',
      });

      expect(cleanups).toHaveLength(2);
      expect(element.classList.contains('active')).toBe(true);
    });

    it('should revert on duration when duration fires first', () => {
      element.classList.add('active');

      setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: 500,
        untilEvent: 'click',
      });

      // Advance time before firing event
      vi.advanceTimersByTime(500);

      // Duration fires and toggles
      expect(element.classList.contains('active')).toBe(false);

      // Event listener is still active and will also toggle
      element.classList.add('active');
      element.dispatchEvent(new Event('click'));
      // Both modifiers fire independently - event also toggles
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should revert on event when event fires first', () => {
      element.classList.add('active');

      setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: 1000,
        untilEvent: 'click',
      });

      // Fire event before timeout
      vi.advanceTimersByTime(100);
      element.dispatchEvent(new Event('click'));

      // Event fires and toggles
      expect(element.classList.contains('active')).toBe(false);

      // Timeout is still active and will also toggle
      element.classList.add('active');
      vi.advanceTimersByTime(900);
      // Both modifiers fire independently - timeout also toggles
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should skip duration if undefined', () => {
      element.classList.add('active');

      const cleanups = setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: undefined,
        untilEvent: 'click',
      });

      expect(cleanups).toHaveLength(1);

      // Only event should work
      element.dispatchEvent(new Event('click'));
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should skip duration if zero or negative', () => {
      element.classList.add('active');

      const cleanups1 = setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: 0,
        untilEvent: 'click',
      });

      expect(cleanups1).toHaveLength(1);

      const cleanups2 = setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: -100,
        untilEvent: 'click',
      });

      expect(cleanups2).toHaveLength(1);
    });

    it('should skip event if undefined', () => {
      element.classList.add('active');

      const cleanups = setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: 1000,
        untilEvent: undefined,
      });

      expect(cleanups).toHaveLength(1);

      // Only duration should work
      vi.advanceTimersByTime(1000);
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should skip event if empty string', () => {
      element.classList.add('active');

      const cleanups = setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: 1000,
        untilEvent: '',
      });

      expect(cleanups).toHaveLength(1);
    });
  });

  describe('setupTemporalModifiersForElements', () => {
    it('should apply modifiers to multiple elements', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      const element3 = document.createElement('div');

      element1.classList.add('active');
      element2.classList.add('active');
      element3.classList.add('active');

      setupTemporalModifiersForElements(
        [element1, element2, element3],
        'class',
        'active',
        1000,
        'click'
      );

      // All should have the class
      expect(element1.classList.contains('active')).toBe(true);
      expect(element2.classList.contains('active')).toBe(true);
      expect(element3.classList.contains('active')).toBe(true);

      // Advance time
      vi.advanceTimersByTime(1000);

      // All should be reverted
      expect(element1.classList.contains('active')).toBe(false);
      expect(element2.classList.contains('active')).toBe(false);
      expect(element3.classList.contains('active')).toBe(false);
    });

    it('should return single cleanup function that cleans up all', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      element1.classList.add('active');
      element2.classList.add('active');

      const cleanup = setupTemporalModifiersForElements(
        [element1, element2],
        'class',
        'active',
        1000,
        'click'
      );

      // Call cleanup
      cleanup();

      // Advance time - should not revert (cleaned up)
      vi.advanceTimersByTime(1000);
      expect(element1.classList.contains('active')).toBe(true);
      expect(element2.classList.contains('active')).toBe(true);

      // Fire events - should not revert (cleaned up)
      element1.dispatchEvent(new Event('click'));
      element2.dispatchEvent(new Event('click'));
      expect(element1.classList.contains('active')).toBe(true);
      expect(element2.classList.contains('active')).toBe(true);
    });

    it('should handle empty array', () => {
      const cleanup = setupTemporalModifiersForElements([], 'class', 'active', 1000, 'click');

      // Should not throw
      expect(cleanup).toBeDefined();
      cleanup(); // Should not throw
    });
  });

  describe('Edge Cases', () => {
    it('should handle element removed from DOM before reversion', () => {
      element.classList.add('active');
      document.body.appendChild(element);

      setupDurationReversion(element, 'class', 'active', 1000);

      // Remove element from DOM
      document.body.removeChild(element);

      // Should not throw when timeout fires
      expect(() => {
        vi.advanceTimersByTime(1000);
      }).not.toThrow();

      // Class should still be toggled (element is in memory)
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should handle multiple reversions on same element', () => {
      element.classList.add('active');
      element.classList.add('loading');

      setupDurationReversion(element, 'class', 'active', 500);
      setupDurationReversion(element, 'class', 'loading', 1000);

      // First reversion
      vi.advanceTimersByTime(500);
      expect(element.classList.contains('active')).toBe(false);
      expect(element.classList.contains('loading')).toBe(true);

      // Second reversion
      vi.advanceTimersByTime(500);
      expect(element.classList.contains('loading')).toBe(false);
    });

    it('should handle attribute with value', () => {
      element.setAttribute('data-state', 'loading');
      expect(element.getAttribute('data-state')).toBe('loading');

      setupDurationReversion(element, 'attribute', 'data-state', 500);

      vi.advanceTimersByTime(500);

      // Attribute should be toggled (removed if present)
      expect(element.hasAttribute('data-state')).toBe(false);
    });

    it('should handle very large duration', () => {
      element.classList.add('active');

      setupDurationReversion(element, 'class', 'active', 999999999);

      // Advance by a large but not complete amount
      vi.advanceTimersByTime(999999998);
      expect(element.classList.contains('active')).toBe(true);

      // Complete the duration
      vi.advanceTimersByTime(1);
      expect(element.classList.contains('active')).toBe(false);
    });

    it('should handle event reversion when element is not in DOM', () => {
      const detachedElement = document.createElement('div');
      detachedElement.classList.add('active');

      setupEventReversion(detachedElement, 'class', 'active', 'click');

      // Fire event on detached element
      detachedElement.dispatchEvent(new Event('click'));

      // Should still work
      expect(detachedElement.classList.contains('active')).toBe(false);
    });

    it('should handle cleanup called multiple times', () => {
      element.classList.add('active');

      const cleanup = setupDurationReversion(element, 'class', 'active', 1000);

      // Call cleanup multiple times - should not throw
      expect(() => {
        cleanup();
        cleanup();
        cleanup();
      }).not.toThrow();
    });

    it('should handle both modifiers completing in quick succession', () => {
      element.classList.add('active');

      setupTemporalModifiers({
        element,
        toggleType: 'class',
        identifier: 'active',
        duration: 100,
        untilEvent: 'click',
      });

      // Fire event at almost the same time as duration
      vi.advanceTimersByTime(99);
      element.dispatchEvent(new Event('click'));

      // Event fires and toggles
      expect(element.classList.contains('active')).toBe(false);

      // Complete the duration
      vi.advanceTimersByTime(1);

      // Duration also toggles (both fire independently)
      expect(element.classList.contains('active')).toBe(true);
    });
  });
});
