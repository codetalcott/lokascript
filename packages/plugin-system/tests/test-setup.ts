/**
 * Global test setup for Plugin System
 * This file runs before each test file
 */

import { beforeEach, afterEach, vi, expect } from 'vitest';
import type {
  Plugin,
  CommandPlugin,
  FeaturePlugin,
  RuntimeContext,
  ElementContext,
  InitContext,
  ParseContext,
  Token,
} from '../src/types';

// Mock console methods in test environment to reduce noise
const consoleMethods = ['log', 'error', 'info', 'warn'] as const;

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Mock console methods unless explicitly testing them
  consoleMethods.forEach((method) => {
    if (method in console) {
      vi.spyOn(console, method).mockImplementation(() => {});
    }
  });

  // Reset DOM state safely
  if (document.head) {
    document.head.innerHTML = '';
  }
  if (document.body) {
    document.body.innerHTML = '';
  }

  // Clear any global plugin state
  if (typeof globalThis !== 'undefined') {
    delete (globalThis as any)._hyperfixiPlugins;
  }
});

afterEach(() => {
  // Restore console methods
  consoleMethods.forEach((method) => {
    if (method in console) {
      const spy = vi.mocked(console[method]);
      if (spy && spy.mockRestore) {
        spy.mockRestore();
      }
    }
  });

  // Clean up any event listeners or timers
  vi.clearAllTimers();

  // Clean up DOM safely
  if (document.head) {
    document.head.innerHTML = '';
  }
  if (document.body) {
    document.body.innerHTML = '';
  }
});

// Add custom matchers for plugin-specific assertions
expect.extend({
  toBeValidPlugin(received: unknown) {
    const isValid =
      received &&
      typeof received === 'object' &&
      'type' in received &&
      'name' in received &&
      ['command', 'feature', 'transform', 'runtime'].includes(
        (received as Plugin).type
      );
    return {
      message: () =>
        `expected ${JSON.stringify(received)} to be a valid plugin`,
      pass: isValid,
    };
  },

  toBeCommandPlugin(received: unknown) {
    const isValid =
      received &&
      typeof received === 'object' &&
      (received as Plugin).type === 'command' &&
      'pattern' in received &&
      'execute' in received;
    return {
      message: () =>
        `expected ${JSON.stringify(received)} to be a command plugin`,
      pass: isValid,
    };
  },

  toBeFeaturePlugin(received: unknown) {
    const isValid =
      received &&
      typeof received === 'object' &&
      (received as Plugin).type === 'feature';
    return {
      message: () =>
        `expected ${JSON.stringify(received)} to be a feature plugin`,
      pass: isValid,
    };
  },
});

// Extend Vitest's expect types
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeValidPlugin(): void;
    toBeCommandPlugin(): void;
    toBeFeaturePlugin(): void;
  }
  interface AsymmetricMatchersContaining {
    toBeValidPlugin(): void;
    toBeCommandPlugin(): void;
    toBeFeaturePlugin(): void;
  }
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Create an HTML element from a string
 */
export function createTestElement(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  const element = div.firstElementChild as HTMLElement;
  document.body.appendChild(element);
  return element;
}

/**
 * Wait for an event to be dispatched
 */
export function waitForEvent(
  target: EventTarget,
  eventName: string,
  timeout = 1000
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      target.removeEventListener(eventName, handler);
      reject(new Error(`Event ${eventName} not fired within ${timeout}ms`));
    }, timeout);

    const handler = (event: Event) => {
      clearTimeout(timer);
      target.removeEventListener(eventName, handler);
      resolve(event);
    };

    target.addEventListener(eventName, handler);
  });
}

/**
 * Wait for a condition to be true
 */
export function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 10
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Condition not met within timeout'));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

// ============================================================================
// Mock Plugin Factories
// ============================================================================

/**
 * Create a mock command plugin
 */
export function createMockCommandPlugin(
  overrides: Partial<CommandPlugin> = {}
): CommandPlugin {
  return {
    type: 'command',
    name: overrides.name || 'mock-command',
    pattern: overrides.pattern || /^mock/,
    execute: overrides.execute || vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * Create a mock feature plugin
 */
export function createMockFeaturePlugin(
  overrides: Partial<FeaturePlugin> = {}
): FeaturePlugin {
  return {
    type: 'feature',
    name: overrides.name || 'mock-feature',
    onGlobalInit: overrides.onGlobalInit || vi.fn(),
    onElementInit: overrides.onElementInit || vi.fn(),
    ...overrides,
  };
}

// ============================================================================
// Mock Context Factories
// ============================================================================

/**
 * Create a mock RuntimeContext
 */
export function createMockRuntimeContext(
  element?: HTMLElement,
  overrides: Partial<RuntimeContext> = {}
): RuntimeContext {
  const el = element || document.createElement('div');
  return {
    // Plugin info
    plugin: createMockCommandPlugin(),
    element: el,
    args: [],
    modifiers: new Map(),
    cleanup: undefined,
    // ExecutionContext fields
    me: el,
    you: null,
    it: null,
    result: null,
    locals: new Map(),
    globals: new Map(),
    event: undefined,
    ...overrides,
  } as RuntimeContext;
}

/**
 * Create a mock ElementContext
 */
export function createMockElementContext(
  element?: HTMLElement,
  overrides: Partial<ElementContext> = {}
): ElementContext {
  const el = element || document.createElement('div');
  return {
    element: el,
    attribute: '_',
    value: '',
    cleanup: vi.fn(),
    ...overrides,
  };
}

/**
 * Create a mock InitContext
 */
export function createMockInitContext(
  overrides: Partial<InitContext> = {}
): InitContext {
  return {
    plugins: new Map(),
    registerCommand: vi.fn(),
    registerFeature: vi.fn(),
    ...overrides,
  };
}

/**
 * Create a mock ParseContext
 */
export function createMockParseContext(
  input = '',
  overrides: Partial<ParseContext> = {}
): ParseContext {
  const tokens: Token[] = input.split(/\s+/).map((value, index) => ({
    type: 'word',
    value,
    position: index,
  }));

  return {
    input,
    position: 0,
    tokens,
    currentToken: tokens[0] || { type: 'eof', value: '', position: 0 },
    ...overrides,
  };
}

// ============================================================================
// DOM Helpers
// ============================================================================

/**
 * Create multiple test elements
 */
export function createTestElements(
  htmlArray: string[]
): HTMLElement[] {
  return htmlArray.map((html) => createTestElement(html));
}

/**
 * Simulate a click event
 */
export function simulateClick(element: Element): void {
  element.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true })
  );
}

/**
 * Simulate a custom event
 */
export function simulateEvent(
  element: Element,
  eventName: string,
  detail?: unknown
): void {
  element.dispatchEvent(
    new CustomEvent(eventName, { bubbles: true, detail })
  );
}

// ============================================================================
// Async Helpers
// ============================================================================

/**
 * Flush all pending promises
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for next tick
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}
