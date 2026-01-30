import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createCustomEvent,
  parseEventValue,
  dispatchCustomEvent,
  dispatchLokaScriptEvent,
} from '../event-helpers';

describe('Event Helpers', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('createCustomEvent', () => {
    it('should create CustomEvent with detail', () => {
      const detail = { foo: 'bar', count: 42 };
      const event = createCustomEvent('test-event', detail);

      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe('test-event');
      expect(event.detail).toEqual(detail);
    });

    it('should apply default options', () => {
      const event = createCustomEvent('test-event', {});

      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
      expect(event.composed).toBe(false);
    });

    it('should accept custom options', () => {
      const event = createCustomEvent(
        'test-event',
        {},
        {
          bubbles: false,
          cancelable: false,
          composed: true,
        }
      );

      expect(event.bubbles).toBe(false);
      expect(event.cancelable).toBe(false);
      expect(event.composed).toBe(true);
    });
  });

  describe('parseEventValue', () => {
    it('should parse integer string to number', () => {
      expect(parseEventValue('42')).toBe(42);
      expect(parseEventValue('0')).toBe(0);
      expect(parseEventValue('999')).toBe(999);
    });

    it('should parse float string to number', () => {
      expect(parseEventValue('3.14')).toBe(3.14);
      expect(parseEventValue('0.5')).toBe(0.5);
      expect(parseEventValue('.75')).toBe(0.75);
    });

    it('should parse boolean strings to boolean', () => {
      expect(parseEventValue('true')).toBe(true);
      expect(parseEventValue('false')).toBe(false);
    });

    it('should parse null string to null', () => {
      expect(parseEventValue('null')).toBe(null);
    });

    it('should parse undefined string to undefined', () => {
      expect(parseEventValue('undefined')).toBe(undefined);
    });

    it('should unquote quoted strings', () => {
      expect(parseEventValue('"hello world"')).toBe('hello world');
      expect(parseEventValue("'single quotes'")).toBe('single quotes');
      expect(parseEventValue('"with spaces"')).toBe('with spaces');
    });

    it('should return trimmed string for non-matching values', () => {
      expect(parseEventValue('  hello  ')).toBe('hello');
      expect(parseEventValue('regular-string')).toBe('regular-string');
      expect(parseEventValue('text123')).toBe('text123');
    });
  });

  describe('dispatchCustomEvent', () => {
    it('should dispatch event on target element', () => {
      const detail = { message: 'test' };
      const listener = vi.fn();

      element.addEventListener('custom-event', listener);
      dispatchCustomEvent(element, 'custom-event', detail);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].detail).toEqual(detail);
    });

    it('should return the dispatched event', () => {
      const detail = { foo: 'bar' };
      const event = dispatchCustomEvent(element, 'test-event', detail);

      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe('test-event');
      expect(event.detail).toEqual(detail);
    });

    it('should handle edge case: empty detail', () => {
      const listener = vi.fn();

      element.addEventListener('empty-event', listener);
      dispatchCustomEvent(element, 'empty-event', {});

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].detail).toEqual({});
    });
  });

  describe('dispatchLokaScriptEvent', () => {
    it('should dispatch both lokascript: and hyperfixi: events', () => {
      const lokaListener = vi.fn();
      const hyperfixiListener = vi.fn();
      const detail = { data: 'test' };

      element.addEventListener('lokascript:test', lokaListener);
      element.addEventListener('hyperfixi:test', hyperfixiListener);

      dispatchLokaScriptEvent(element, 'test', detail);

      expect(lokaListener).toHaveBeenCalledTimes(1);
      expect(hyperfixiListener).toHaveBeenCalledTimes(1);
      expect(lokaListener.mock.calls[0][0].detail).toEqual(detail);
      expect(hyperfixiListener.mock.calls[0][0].detail).toEqual(detail);
    });

    it('should return both dispatched events', () => {
      const detail = { value: 42 };
      const events = dispatchLokaScriptEvent(element, 'dual', detail);

      expect(events.lokascript).toBeInstanceOf(CustomEvent);
      expect(events.hyperfixi).toBeInstanceOf(CustomEvent);
      expect(events.lokascript.type).toBe('lokascript:dual');
      expect(events.hyperfixi.type).toBe('hyperfixi:dual');
      expect(events.lokascript.detail).toEqual(detail);
      expect(events.hyperfixi.detail).toEqual(detail);
    });

    it('should allow listener to catch both event types', () => {
      const allEvents: string[] = [];

      element.addEventListener('lokascript:action', e => {
        allEvents.push('lokascript:action');
      });

      element.addEventListener('hyperfixi:action', e => {
        allEvents.push('hyperfixi:action');
      });

      dispatchLokaScriptEvent(element, 'action', { test: true });

      expect(allEvents).toEqual(['lokascript:action', 'hyperfixi:action']);
    });

    it('should apply custom options to both events', () => {
      const detail = { test: true };
      const options = {
        bubbles: false,
        cancelable: false,
        composed: true,
      };

      const events = dispatchLokaScriptEvent(element, 'custom-options', detail, options);

      expect(events.lokascript.bubbles).toBe(false);
      expect(events.lokascript.cancelable).toBe(false);
      expect(events.lokascript.composed).toBe(true);
      expect(events.hyperfixi.bubbles).toBe(false);
      expect(events.hyperfixi.cancelable).toBe(false);
      expect(events.hyperfixi.composed).toBe(true);
    });
  });

  describe('Integration: event bubbling', () => {
    it('should bubble events by default', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);

      const parentListener = vi.fn();
      parent.addEventListener('bubble-test', parentListener);

      dispatchCustomEvent(child, 'bubble-test', { from: 'child' });

      expect(parentListener).toHaveBeenCalledTimes(1);
      expect(parentListener.mock.calls[0][0].target).toBe(child);

      document.body.removeChild(parent);
    });

    it('should not bubble when bubbles:false', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);

      const parentListener = vi.fn();
      parent.addEventListener('no-bubble-test', parentListener);

      dispatchCustomEvent(child, 'no-bubble-test', { from: 'child' }, { bubbles: false });

      expect(parentListener).not.toHaveBeenCalled();

      document.body.removeChild(parent);
    });
  });
});
