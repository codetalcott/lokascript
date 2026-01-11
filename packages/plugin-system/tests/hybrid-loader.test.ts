/**
 * Tests for HybridPluginLoader
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HybridPluginLoader, createHybridLoader } from '../src/hybrid-loader';
import { createMockCommandPlugin, createMockFeaturePlugin, createTestElement } from './test-setup';
import type { Plugin } from '../src/types';

// Mock the optimizedRegistry
vi.mock('../src/optimized-registry', () => ({
  optimizedRegistry: {
    load: vi.fn(),
    apply: vi.fn(),
  },
}));

import { optimizedRegistry } from '../src/optimized-registry';

describe('HybridPluginLoader', () => {
  let corePlugins: Plugin[];

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';

    corePlugins = [
      createMockCommandPlugin({ name: 'on', pattern: /^on/ }),
      createMockCommandPlugin({ name: 'toggle', pattern: /^toggle/ }),
    ];
  });

  describe('constructor', () => {
    it('should use default config values', () => {
      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins: new Map(),
      });

      const stats = loader.getStats();
      expect(stats.coreLoaded).toBe(0);
      expect(stats.optionalAvailable).toBe(0);
    });

    it('should accept custom config', () => {
      const optionalPlugins = new Map([
        ['test', async () => createMockFeaturePlugin({ name: 'test' })],
      ]);

      const loader = new HybridPluginLoader({
        corePlugins,
        optionalPlugins,
        autoDetect: false,
        lazyLoadDelay: 500,
      });

      const stats = loader.getStats();
      expect(stats.coreLoaded).toBe(2);
      expect(stats.optionalAvailable).toBe(1);
    });
  });

  describe('initialize', () => {
    it('should load core plugins', async () => {
      const loader = new HybridPluginLoader({
        corePlugins,
        optionalPlugins: new Map(),
        autoDetect: false,
      });

      await loader.initialize();

      expect(optimizedRegistry.load).toHaveBeenCalledWith(...corePlugins);
    });

    it('should apply registry to DOM', async () => {
      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins: new Map(),
        autoDetect: false,
      });

      await loader.initialize();

      expect(optimizedRegistry.apply).toHaveBeenCalled();
    });
  });

  describe('loadOptional', () => {
    it('should load an optional plugin', async () => {
      const mockLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
      const optionalPlugins = new Map([['websocket', mockLoader]]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: false,
      });

      await loader.loadOptional('websocket');

      expect(mockLoader).toHaveBeenCalled();
      expect(optimizedRegistry.load).toHaveBeenCalled();
    });

    it('should not load same plugin twice', async () => {
      const mockLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
      const optionalPlugins = new Map([['websocket', mockLoader]]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: false,
      });

      await loader.loadOptional('websocket');
      await loader.loadOptional('websocket');

      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('should throw for unknown plugin', async () => {
      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins: new Map(),
        autoDetect: false,
      });

      await expect(loader.loadOptional('unknown-plugin')).rejects.toThrow(
        'Unknown optional plugin: unknown-plugin'
      );
    });

    it('should deduplicate concurrent loads', async () => {
      const mockLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
      const optionalPlugins = new Map([['websocket', mockLoader]]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: false,
      });

      // Start two loads simultaneously
      const [, ] = await Promise.all([
        loader.loadOptional('websocket'),
        loader.loadOptional('websocket'),
      ]);

      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('should load multiple optional plugins in parallel', async () => {
      const wsLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
      const workerLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'worker' }));

      const optionalPlugins = new Map([
        ['websocket', wsLoader],
        ['worker', workerLoader],
      ]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: false,
      });

      await Promise.all([
        loader.loadOptional('websocket'),
        loader.loadOptional('worker'),
      ]);

      expect(wsLoader).toHaveBeenCalled();
      expect(workerLoader).toHaveBeenCalled();
    });
  });

  describe('setupDynamicLoading', () => {
    it('should setup MutationObserver', () => {
      const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins: new Map(),
        autoDetect: false,
      });

      loader.setupDynamicLoading();

      expect(observeSpy).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });

      observeSpy.mockRestore();
    });
  });

  describe('getStats', () => {
    it('should return correct initial stats', () => {
      const optionalPlugins = new Map([
        ['websocket', async () => createMockFeaturePlugin({ name: 'websocket' })],
        ['worker', async () => createMockFeaturePlugin({ name: 'worker' })],
      ]);

      const loader = new HybridPluginLoader({
        corePlugins,
        optionalPlugins,
        autoDetect: false,
      });

      const stats = loader.getStats();

      expect(stats).toEqual({
        coreLoaded: 2,
        optionalAvailable: 2,
        optionalLoaded: 0,
        currentlyLoading: 0,
      });
    });

    it('should update stats after loading optional plugins', async () => {
      const wsLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
      const workerLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'worker' }));

      const optionalPlugins = new Map([
        ['websocket', wsLoader],
        ['worker', workerLoader],
      ]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: false,
      });

      await loader.loadOptional('websocket');
      await loader.loadOptional('worker');

      const stats = loader.getStats();

      expect(stats.optionalLoaded).toBe(2);
      expect(stats.currentlyLoading).toBe(0);
    });
  });

  describe('auto-detection', () => {
    it('should detect data-ws attribute during initialization', async () => {
      vi.useFakeTimers();

      createTestElement('<div data-ws="ws://localhost">WS</div>');

      const wsLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
      const optionalPlugins = new Map([['websocket', wsLoader]]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: true,
        lazyLoadDelay: 0,
      });

      // Initialize starts the detection
      const initPromise = loader.initialize();

      // Let the initialization and detection complete
      await vi.runAllTimersAsync();
      await initPromise;

      expect(wsLoader).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should detect data-intersect attribute during initialization', async () => {
      vi.useFakeTimers();

      createTestElement('<div data-intersect>Lazy</div>');

      const intersectionLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'intersection' }));
      const optionalPlugins = new Map([['intersection', intersectionLoader]]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: true,
        lazyLoadDelay: 0,
      });

      const initPromise = loader.initialize();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(intersectionLoader).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should respect lazyLoadDelay', async () => {
      vi.useFakeTimers();

      createTestElement('<div data-ws>WS</div>');

      const wsLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
      const optionalPlugins = new Map([['websocket', wsLoader]]);

      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins,
        autoDetect: true,
        lazyLoadDelay: 500,
      });

      await loader.initialize();

      // Before delay, plugin should not be loaded
      expect(wsLoader).not.toHaveBeenCalled();

      // After delay, plugin should be loaded
      await vi.advanceTimersByTimeAsync(500);

      expect(wsLoader).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should not detect plugins when not in optionalPlugins', async () => {
      vi.useFakeTimers();

      createTestElement('<div data-ws>WS</div>');

      // Empty optionalPlugins - no websocket configured
      const loader = new HybridPluginLoader({
        corePlugins: [],
        optionalPlugins: new Map(),
        autoDetect: true,
        lazyLoadDelay: 0,
      });

      const initPromise = loader.initialize();
      await vi.runAllTimersAsync();
      await initPromise;

      expect(loader.getStats().optionalLoaded).toBe(0);

      vi.useRealTimers();
    });
  });
});

describe('createHybridLoader', () => {
  it('should create a HybridPluginLoader instance', () => {
    const loader = createHybridLoader();

    expect(loader).toBeInstanceOf(HybridPluginLoader);
  });

  it('should have optional plugins configured', () => {
    const loader = createHybridLoader();
    const stats = loader.getStats();

    expect(stats.optionalAvailable).toBeGreaterThan(0);
  });
});

describe('checkElementForPlugins (via auto-detection)', () => {
  // Note: checkElementForPlugins is private but tested through detectAndLoadOptional
  // which uses similar detection logic. The MutationObserver dynamic loading is tested
  // by verifying the observer is set up correctly in setupDynamicLoading tests above.

  it('should detect websocket plugin via data-ws attribute', async () => {
    vi.useFakeTimers();

    createTestElement('<div data-ws="ws://test">WS</div>');

    const wsLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
    const optionalPlugins = new Map([['websocket', wsLoader]]);

    const loader = new HybridPluginLoader({
      corePlugins: [],
      optionalPlugins,
      autoDetect: true,
      lazyLoadDelay: 0,
    });

    const initPromise = loader.initialize();
    await vi.runAllTimersAsync();
    await initPromise;

    expect(wsLoader).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should detect auto-fetch plugin via data-fetch attribute', async () => {
    vi.useFakeTimers();

    createTestElement('<div data-fetch="/api/data">Fetch</div>');

    const fetchLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'auto-fetch' }));
    const optionalPlugins = new Map([['auto-fetch', fetchLoader]]);

    const loader = new HybridPluginLoader({
      corePlugins: [],
      optionalPlugins,
      autoDetect: true,
      lazyLoadDelay: 0,
    });

    const initPromise = loader.initialize();
    await vi.runAllTimersAsync();
    await initPromise;

    expect(fetchLoader).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should detect reactive-state plugin via data-state attribute', async () => {
    vi.useFakeTimers();

    createTestElement('<div data-state=\'{"count": 0}\'>State</div>');

    const stateLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'reactive-state' }));
    const optionalPlugins = new Map([['reactive-state', stateLoader]]);

    const loader = new HybridPluginLoader({
      corePlugins: [],
      optionalPlugins,
      autoDetect: true,
      lazyLoadDelay: 0,
    });

    const initPromise = loader.initialize();
    await vi.runAllTimersAsync();
    await initPromise;

    expect(stateLoader).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should detect multiple plugins simultaneously', async () => {
    vi.useFakeTimers();

    createTestElement('<div data-ws="ws://test">WS</div>');
    createTestElement('<div data-intersect>Intersect</div>');

    const wsLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'websocket' }));
    const intersectionLoader = vi.fn().mockResolvedValue(createMockFeaturePlugin({ name: 'intersection' }));
    const optionalPlugins = new Map([
      ['websocket', wsLoader],
      ['intersection', intersectionLoader],
    ]);

    const loader = new HybridPluginLoader({
      corePlugins: [],
      optionalPlugins,
      autoDetect: true,
      lazyLoadDelay: 0,
    });

    const initPromise = loader.initialize();
    await vi.runAllTimersAsync();
    await initPromise;

    expect(wsLoader).toHaveBeenCalled();
    expect(intersectionLoader).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should not load plugin if not in optionalPlugins', async () => {
    vi.useFakeTimers();

    createTestElement('<div data-ws="ws://test">WS</div>');

    // Empty optionalPlugins - websocket not configured
    const loader = new HybridPluginLoader({
      corePlugins: [],
      optionalPlugins: new Map(),
      autoDetect: true,
      lazyLoadDelay: 0,
    });

    const initPromise = loader.initialize();
    await vi.runAllTimersAsync();
    await initPromise;

    expect(loader.getStats().optionalLoaded).toBe(0);

    vi.useRealTimers();
  });
});
