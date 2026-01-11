/**
 * Tests for Feature Plugins
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ReactiveStateFeature,
  AutoFetchFeature,
  IntersectionFeature,
} from '../src/plugins/features';
import {
  createTestElement,
  createMockElementContext,
  createMockInitContext,
  waitForEvent,
  flushPromises,
} from './test-setup';

describe('ReactiveStateFeature', () => {
  describe('plugin structure', () => {
    it('should have correct type and name', () => {
      expect(ReactiveStateFeature.type).toBe('feature');
      expect(ReactiveStateFeature.name).toBe('reactive-state');
    });

    it('should have onGlobalInit and onElementInit handlers', () => {
      expect(ReactiveStateFeature.onGlobalInit).toBeInstanceOf(Function);
      expect(ReactiveStateFeature.onElementInit).toBeInstanceOf(Function);
    });
  });

  describe('onGlobalInit', () => {
    it('should register state feature', () => {
      const ctx = createMockInitContext();

      ReactiveStateFeature.onGlobalInit!(ctx);

      expect(ctx.registerFeature).toHaveBeenCalledWith(
        'state',
        expect.objectContaining({
          name: 'state',
          init: expect.any(Function),
        })
      );
    });

    it('should create reactive state from data-state attribute', () => {
      const ctx = createMockInitContext();
      ReactiveStateFeature.onGlobalInit!(ctx);

      // Get the registered feature
      const registerCall = vi.mocked(ctx.registerFeature).mock.calls[0];
      const stateFeature = registerCall[1];

      // Create element with state
      const element = createTestElement(
        '<div data-state=\'{"count": 0, "name": "test"}\'>Test</div>'
      );
      const elementCtx = createMockElementContext(element);

      // Initialize the feature
      stateFeature.init!(elementCtx);

      // Check state was attached
      expect((element as any)._hsState).toBeDefined();
      expect((element as any)._hsState.count).toBe(0);
      expect((element as any)._hsState.name).toBe('test');
    });

    it('should dispatch state:change event when state is modified', async () => {
      const ctx = createMockInitContext();
      ReactiveStateFeature.onGlobalInit!(ctx);

      const registerCall = vi.mocked(ctx.registerFeature).mock.calls[0];
      const stateFeature = registerCall[1];

      const element = createTestElement('<div data-state=\'{"count": 0}\'>Test</div>');
      const elementCtx = createMockElementContext(element);
      stateFeature.init!(elementCtx);

      // Set up event listener
      const eventPromise = waitForEvent(element, 'state:change');

      // Modify state
      (element as any)._hsState.count = 5;

      const event = await eventPromise;
      expect((event as CustomEvent).detail).toEqual({
        property: 'count',
        value: 5,
      });
    });

    it('should handle invalid JSON gracefully', () => {
      const ctx = createMockInitContext();
      ReactiveStateFeature.onGlobalInit!(ctx);

      const registerCall = vi.mocked(ctx.registerFeature).mock.calls[0];
      const stateFeature = registerCall[1];

      const element = createTestElement('<div data-state="not valid json">Test</div>');
      const elementCtx = createMockElementContext(element);

      // Should not throw
      expect(() => stateFeature.init!(elementCtx)).not.toThrow();
      expect((element as any)._hsState).toBeUndefined();
    });

    it('should handle element without data-state attribute', () => {
      const ctx = createMockInitContext();
      ReactiveStateFeature.onGlobalInit!(ctx);

      const registerCall = vi.mocked(ctx.registerFeature).mock.calls[0];
      const stateFeature = registerCall[1];

      const element = createTestElement('<div>No state</div>');
      const elementCtx = createMockElementContext(element);

      expect(() => stateFeature.init!(elementCtx)).not.toThrow();
      expect((element as any)._hsState).toBeUndefined();
    });
  });

  describe('onElementInit', () => {
    it('should set up MutationObserver for data-state changes', () => {
      const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
      const element = createTestElement('<div data-state=\'{"a": 1}\'>Test</div>');
      const ctx = createMockElementContext(element);

      ReactiveStateFeature.onElementInit!(ctx);

      expect(observeSpy).toHaveBeenCalledWith(element, {
        attributes: true,
        attributeFilter: ['data-state'],
      });

      observeSpy.mockRestore();
    });

    it('should register cleanup function', () => {
      const element = createTestElement('<div>Test</div>');
      const ctx = createMockElementContext(element);

      ReactiveStateFeature.onElementInit!(ctx);

      expect(ctx.cleanup).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});

describe('AutoFetchFeature', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ data: 'test' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('plugin structure', () => {
    it('should have correct type and name', () => {
      expect(AutoFetchFeature.type).toBe('feature');
      expect(AutoFetchFeature.name).toBe('auto-fetch');
    });

    it('should have onElementInit handler', () => {
      expect(AutoFetchFeature.onElementInit).toBeInstanceOf(Function);
    });
  });

  describe('onElementInit', () => {
    it('should fetch data on initialization', async () => {
      const element = createTestElement('<div data-fetch="/api/data">Loading...</div>');
      const ctx = createMockElementContext(element);

      AutoFetchFeature.onElementInit!(ctx);

      await flushPromises();

      expect(global.fetch).toHaveBeenCalledWith('/api/data');
    });

    it('should dispatch fetch:success event on success', async () => {
      const element = createTestElement('<div data-fetch="/api/data">Loading...</div>');
      const ctx = createMockElementContext(element);

      const eventPromise = waitForEvent(element, 'fetch:success');

      AutoFetchFeature.onElementInit!(ctx);

      const event = await eventPromise;
      expect((event as CustomEvent).detail).toEqual({ data: 'test' });
    });

    it('should dispatch fetch:error event on failure', async () => {
      const error = new Error('Network error');
      global.fetch = vi.fn().mockRejectedValue(error);

      const element = createTestElement('<div data-fetch="/api/data">Loading...</div>');
      const ctx = createMockElementContext(element);

      const eventPromise = waitForEvent(element, 'fetch:error');

      AutoFetchFeature.onElementInit!(ctx);

      const event = await eventPromise;
      expect((event as CustomEvent).detail).toBe(error);
    });

    it('should set up interval when data-fetch-interval is specified', async () => {
      vi.useFakeTimers();

      const element = createTestElement(
        '<div data-fetch="/api/data" data-fetch-interval="1000">Loading...</div>'
      );
      const ctx = createMockElementContext(element);

      AutoFetchFeature.onElementInit!(ctx);

      // Initial fetch
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Advance timer
      await vi.advanceTimersByTimeAsync(1000);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1000);
      expect(global.fetch).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should register cleanup function for interval', () => {
      vi.useFakeTimers();

      const element = createTestElement(
        '<div data-fetch="/api/data" data-fetch-interval="1000">Loading...</div>'
      );
      const ctx = createMockElementContext(element);

      AutoFetchFeature.onElementInit!(ctx);

      expect(ctx.cleanup).toHaveBeenCalledWith(expect.any(Function));

      vi.useRealTimers();
    });

    it('should not fetch if data-fetch attribute is missing', () => {
      const element = createTestElement('<div>No fetch</div>');
      const ctx = createMockElementContext(element);

      AutoFetchFeature.onElementInit!(ctx);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

describe('IntersectionFeature', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let observerCallback: IntersectionObserverCallback;
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    // Save original
    originalIntersectionObserver = global.IntersectionObserver;

    // Mock IntersectionObserver as a proper class
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = '';
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
        observerCallback = callback;
      }

      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn().mockReturnValue([]);
    }

    global.IntersectionObserver = MockIntersectionObserver as any;
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
    vi.restoreAllMocks();
  });

  describe('plugin structure', () => {
    it('should have correct type and name', () => {
      expect(IntersectionFeature.type).toBe('feature');
      expect(IntersectionFeature.name).toBe('intersection');
    });

    it('should have onElementInit handler', () => {
      expect(IntersectionFeature.onElementInit).toBeInstanceOf(Function);
    });
  });

  describe('onElementInit', () => {
    it('should create IntersectionObserver', () => {
      const element = createTestElement('<div data-intersect>Lazy</div>');
      const ctx = createMockElementContext(element);

      IntersectionFeature.onElementInit!(ctx);

      // Verify observer was created and observe was called
      expect(mockObserve).toHaveBeenCalledWith(element);
    });

    it('should use default threshold and rootMargin', () => {
      const element = createTestElement('<div data-intersect>Lazy</div>');
      const ctx = createMockElementContext(element);

      // Should not throw with default values
      expect(() => IntersectionFeature.onElementInit!(ctx)).not.toThrow();
      expect(mockObserve).toHaveBeenCalledWith(element);
    });

    it('should use custom threshold from data-intersect-threshold', () => {
      const element = createTestElement(
        '<div data-intersect data-intersect-threshold="0.5">Lazy</div>'
      );
      const ctx = createMockElementContext(element);

      // Should not throw with custom threshold
      expect(() => IntersectionFeature.onElementInit!(ctx)).not.toThrow();
      expect(mockObserve).toHaveBeenCalledWith(element);
    });

    it('should use custom rootMargin from data-intersect-margin', () => {
      const element = createTestElement(
        '<div data-intersect data-intersect-margin="10px">Lazy</div>'
      );
      const ctx = createMockElementContext(element);

      // Should not throw with custom rootMargin
      expect(() => IntersectionFeature.onElementInit!(ctx)).not.toThrow();
      expect(mockObserve).toHaveBeenCalledWith(element);
    });

    it('should dispatch intersect:enter when element becomes visible', async () => {
      const element = createTestElement('<div data-intersect>Lazy</div>');
      const ctx = createMockElementContext(element);

      IntersectionFeature.onElementInit!(ctx);

      const eventPromise = waitForEvent(element, 'intersect:enter');

      // Simulate intersection
      const entry = {
        isIntersecting: true,
        target: element,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: 1,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };
      observerCallback([entry], {} as IntersectionObserver);

      const event = await eventPromise;
      expect((event as CustomEvent).detail).toBe(entry);
    });

    it('should dispatch intersect:leave when element leaves viewport', async () => {
      const element = createTestElement('<div data-intersect>Lazy</div>');
      const ctx = createMockElementContext(element);

      IntersectionFeature.onElementInit!(ctx);

      const eventPromise = waitForEvent(element, 'intersect:leave');

      // Simulate leaving intersection
      const entry = {
        isIntersecting: false,
        target: element,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: 0,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };
      observerCallback([entry], {} as IntersectionObserver);

      const event = await eventPromise;
      expect((event as CustomEvent).detail).toBe(entry);
    });

    it('should register cleanup function', () => {
      const element = createTestElement('<div data-intersect>Lazy</div>');
      const ctx = createMockElementContext(element);

      IntersectionFeature.onElementInit!(ctx);

      expect(ctx.cleanup).toHaveBeenCalledWith(expect.any(Function));

      // Call cleanup and verify disconnect is called
      const cleanupFn = vi.mocked(ctx.cleanup).mock.calls[0][0];
      cleanupFn();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
