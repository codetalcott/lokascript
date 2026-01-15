/**
 * CleanupRegistry Tests
 *
 * Comprehensive tests for resource cleanup and memory leak prevention.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CleanupRegistry, createAutoCleanupRegistry } from './cleanup-registry';

describe('CleanupRegistry', () => {
  let registry: CleanupRegistry;
  let element: Element;

  beforeEach(() => {
    registry = new CleanupRegistry();
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Constructor', () => {
    it('should create registry with default options', () => {
      const reg = new CleanupRegistry();
      expect(reg.getStats().elementsTracked).toBe(0);
    });

    it('should create registry with debug option', () => {
      const reg = new CleanupRegistry({ debug: true });
      expect(reg.getStats().elementsTracked).toBe(0);
    });
  });

  describe('registerListener', () => {
    it('should register event listener for cleanup', () => {
      const handler = vi.fn();
      const target = document.createElement('button');

      registry.registerListener(element, target, 'click', handler);

      expect(registry.hasCleanups(element)).toBe(true);
      expect(registry.getCleanupCount(element)).toBe(1);
    });

    it('should remove event listener on cleanup', () => {
      const handler = vi.fn();
      const target = document.createElement('button');
      target.addEventListener('click', handler);

      registry.registerListener(element, target, 'click', handler);
      registry.cleanupElement(element);

      // Verify listener was removed by dispatching event
      target.dispatchEvent(new Event('click'));
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle event listener with options', () => {
      const handler = vi.fn();
      const target = document.createElement('button');
      const options = { capture: true };

      registry.registerListener(element, target, 'click', handler, options);
      expect(registry.getCleanupCount(element)).toBe(1);
    });
  });

  describe('registerObserver', () => {
    it('should register MutationObserver for cleanup', () => {
      const observer = new MutationObserver(vi.fn());

      registry.registerObserver(element, observer);

      expect(registry.hasCleanups(element)).toBe(true);
      expect(registry.getCleanupCount(element)).toBe(1);
    });

    it('should disconnect observer on cleanup', () => {
      const callback = vi.fn();
      const observer = new MutationObserver(callback);
      const disconnectSpy = vi.spyOn(observer, 'disconnect');

      registry.registerObserver(element, observer);
      registry.cleanupElement(element);

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('registerInterval', () => {
    it('should register interval for cleanup', () => {
      const intervalId = setInterval(() => {}, 1000);

      registry.registerInterval(element, intervalId);

      expect(registry.hasCleanups(element)).toBe(true);
      expect(registry.getCleanupCount(element)).toBe(1);

      // Clean up immediately to prevent test leak
      registry.cleanupElement(element);
    });

    it('should clear interval on cleanup', () => {
      const callback = vi.fn();
      vi.useFakeTimers();

      const intervalId = setInterval(callback, 100);
      registry.registerInterval(element, intervalId as unknown as ReturnType<typeof setInterval>);
      registry.cleanupElement(element);

      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('registerTimeout', () => {
    it('should register timeout for cleanup', () => {
      const timeoutId = setTimeout(() => {}, 1000);

      registry.registerTimeout(element, timeoutId);

      expect(registry.hasCleanups(element)).toBe(true);
      expect(registry.getCleanupCount(element)).toBe(1);

      // Clean up immediately to prevent test leak
      registry.cleanupElement(element);
    });

    it('should clear timeout on cleanup', () => {
      const callback = vi.fn();
      vi.useFakeTimers();

      const timeoutId = setTimeout(callback, 100);
      registry.registerTimeout(element, timeoutId as unknown as ReturnType<typeof setTimeout>);
      registry.cleanupElement(element);

      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('registerCustom', () => {
    it('should register custom cleanup function', () => {
      const cleanup = vi.fn();

      registry.registerCustom(element, cleanup, 'test cleanup');

      expect(registry.hasCleanups(element)).toBe(true);
      expect(registry.getCleanupCount(element)).toBe(1);
    });

    it('should call custom cleanup on element cleanup', () => {
      const cleanup = vi.fn();

      registry.registerCustom(element, cleanup, 'test cleanup');
      registry.cleanupElement(element);

      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('should work without description', () => {
      const cleanup = vi.fn();

      registry.registerCustom(element, cleanup);

      expect(registry.hasCleanups(element)).toBe(true);
    });
  });

  describe('registerGlobal', () => {
    it('should register global cleanup', () => {
      const cleanup = vi.fn();

      registry.registerGlobal(cleanup, 'custom', 'global test');

      const stats = registry.getStats();
      expect(stats.global).toBe(1);
    });

    it('should default to custom type', () => {
      const cleanup = vi.fn();

      registry.registerGlobal(cleanup);

      const stats = registry.getStats();
      expect(stats.custom).toBe(1);
    });

    it('should call global cleanup on cleanupGlobal', () => {
      const cleanup = vi.fn();

      registry.registerGlobal(cleanup, 'custom', 'global test');
      registry.cleanupGlobal();

      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanupElement', () => {
    it('should run all cleanups for an element', () => {
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      registry.registerCustom(element, cleanup1);
      registry.registerCustom(element, cleanup2);

      const count = registry.cleanupElement(element);

      expect(count).toBe(2);
      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });

    it('should return 0 for element with no cleanups', () => {
      const otherElement = document.createElement('span');
      const count = registry.cleanupElement(otherElement);
      expect(count).toBe(0);
    });

    it('should remove element from tracking after cleanup', () => {
      const cleanup = vi.fn();
      registry.registerCustom(element, cleanup);

      expect(registry.hasCleanups(element)).toBe(true);
      registry.cleanupElement(element);
      expect(registry.hasCleanups(element)).toBe(false);
    });

    it('should handle cleanup errors gracefully', () => {
      const errorCleanup = vi.fn(() => {
        throw new Error('Cleanup error');
      });
      const successCleanup = vi.fn();

      registry.registerCustom(element, errorCleanup);
      registry.registerCustom(element, successCleanup);

      // Should not throw
      const count = registry.cleanupElement(element);

      expect(count).toBe(1); // Only successful cleanup counted
      expect(errorCleanup).toHaveBeenCalled();
      expect(successCleanup).toHaveBeenCalled();
    });
  });

  describe('cleanupElementTree', () => {
    it('should cleanup element and all descendants', () => {
      const child = document.createElement('span');
      const grandchild = document.createElement('button');
      child.appendChild(grandchild);
      element.appendChild(child);

      const parentCleanup = vi.fn();
      const childCleanup = vi.fn();
      const grandchildCleanup = vi.fn();

      registry.registerCustom(element, parentCleanup);
      registry.registerCustom(child, childCleanup);
      registry.registerCustom(grandchild, grandchildCleanup);

      const count = registry.cleanupElementTree(element);

      expect(count).toBe(3);
      expect(parentCleanup).toHaveBeenCalled();
      expect(childCleanup).toHaveBeenCalled();
      expect(grandchildCleanup).toHaveBeenCalled();
    });

    it('should handle tree with no registered cleanups', () => {
      const child = document.createElement('span');
      element.appendChild(child);

      const count = registry.cleanupElementTree(element);
      expect(count).toBe(0);
    });
  });

  describe('cleanupGlobal', () => {
    it('should run all global cleanups', () => {
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      registry.registerGlobal(cleanup1);
      registry.registerGlobal(cleanup2);

      const count = registry.cleanupGlobal();

      expect(count).toBe(2);
      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });

    it('should clear global cleanups after running', () => {
      const cleanup = vi.fn();
      registry.registerGlobal(cleanup);

      registry.cleanupGlobal();
      const count = registry.cleanupGlobal(); // Second call

      expect(count).toBe(0);
    });

    it('should handle global cleanup errors gracefully', () => {
      const errorCleanup = vi.fn(() => {
        throw new Error('Global error');
      });

      registry.registerGlobal(errorCleanup);

      // Should not throw
      const count = registry.cleanupGlobal();
      expect(count).toBe(0); // Error cleanups don't count
    });
  });

  describe('cleanupAll', () => {
    it('should run global cleanups', () => {
      const cleanup = vi.fn();
      registry.registerGlobal(cleanup);

      const count = registry.cleanupAll();

      expect(count).toBeGreaterThanOrEqual(0);
      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe('hasCleanups', () => {
    it('should return true when element has cleanups', () => {
      registry.registerCustom(element, vi.fn());
      expect(registry.hasCleanups(element)).toBe(true);
    });

    it('should return false when element has no cleanups', () => {
      expect(registry.hasCleanups(element)).toBe(false);
    });

    it('should return false after cleanups are executed', () => {
      registry.registerCustom(element, vi.fn());
      registry.cleanupElement(element);
      expect(registry.hasCleanups(element)).toBe(false);
    });
  });

  describe('getCleanupCount', () => {
    it('should return correct count of cleanups', () => {
      expect(registry.getCleanupCount(element)).toBe(0);

      registry.registerCustom(element, vi.fn());
      expect(registry.getCleanupCount(element)).toBe(1);

      registry.registerCustom(element, vi.fn());
      expect(registry.getCleanupCount(element)).toBe(2);
    });

    it('should return 0 for unknown element', () => {
      const otherElement = document.createElement('div');
      expect(registry.getCleanupCount(otherElement)).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return empty stats for new registry', () => {
      const stats = registry.getStats();

      expect(stats.elementsTracked).toBe(0);
      expect(stats.listeners).toBe(0);
      expect(stats.observers).toBe(0);
      expect(stats.intervals).toBe(0);
      expect(stats.timeouts).toBe(0);
      expect(stats.custom).toBe(0);
      expect(stats.global).toBe(0);
    });

    it('should count different cleanup types', () => {
      const target = document.createElement('button');
      const observer = new MutationObserver(vi.fn());

      registry.registerListener(element, target, 'click', vi.fn() as EventListener);
      registry.registerObserver(element, observer);
      registry.registerCustom(element, vi.fn());
      registry.registerGlobal(vi.fn(), 'interval');

      const stats = registry.getStats();

      expect(stats.elementsTracked).toBe(1);
      expect(stats.listeners).toBe(1);
      expect(stats.observers).toBe(1);
      expect(stats.custom).toBe(1);
      expect(stats.global).toBe(1);

      // Clean up observer
      registry.cleanupElement(element);
    });

    it('should track multiple elements', () => {
      const element2 = document.createElement('span');

      registry.registerCustom(element, vi.fn());
      registry.registerCustom(element2, vi.fn());

      const stats = registry.getStats();
      expect(stats.elementsTracked).toBe(2);
    });
  });

  describe('setDebugMode', () => {
    it('should enable debug mode', () => {
      const reg = new CleanupRegistry();
      reg.setDebugMode(true);
      // Debug mode doesn't expose a getter, but shouldn't throw
      expect(() => reg.registerCustom(element, vi.fn())).not.toThrow();
    });

    it('should disable debug mode', () => {
      const reg = new CleanupRegistry({ debug: true });
      reg.setDebugMode(false);
      expect(() => reg.registerCustom(element, vi.fn())).not.toThrow();
    });
  });

  describe('Multiple cleanups for same element', () => {
    it('should track all cleanups for one element', () => {
      registry.registerCustom(element, vi.fn(), 'cleanup 1');
      registry.registerCustom(element, vi.fn(), 'cleanup 2');
      registry.registerCustom(element, vi.fn(), 'cleanup 3');

      expect(registry.getCleanupCount(element)).toBe(3);
      expect(registry.getStats().elementsTracked).toBe(1);
    });

    it('should execute all cleanups in order', () => {
      const order: number[] = [];
      registry.registerCustom(element, () => order.push(1));
      registry.registerCustom(element, () => order.push(2));
      registry.registerCustom(element, () => order.push(3));

      registry.cleanupElement(element);

      expect(order).toEqual([1, 2, 3]);
    });
  });
});

describe('createAutoCleanupRegistry', () => {
  it('should create registry with auto-cleanup observer', () => {
    const registry = createAutoCleanupRegistry();

    // Global cleanup includes the auto-cleanup observer
    const stats = registry.getStats();
    expect(stats.global).toBe(1);

    // Clean up the auto-cleanup observer
    registry.cleanupAll();
  });

  it('should auto-cleanup when element is removed from DOM', async () => {
    const registry = createAutoCleanupRegistry();
    const element = document.createElement('div');
    document.body.appendChild(element);

    const cleanup = vi.fn();
    registry.registerCustom(element, cleanup);

    // Remove element from DOM
    element.remove();

    // Wait for MutationObserver to fire
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(cleanup).toHaveBeenCalled();

    // Clean up the auto-cleanup observer
    registry.cleanupAll();
  });

  it('should accept custom root element', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const registry = createAutoCleanupRegistry({ root });

    const stats = registry.getStats();
    expect(stats.global).toBe(1);

    registry.cleanupAll();
    root.remove();
  });

  it('should accept debug option', () => {
    const registry = createAutoCleanupRegistry({ debug: true });

    expect(registry.getStats().global).toBe(1);
    registry.cleanupAll();
  });
});
