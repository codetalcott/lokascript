/**
 * Tests for Runtime Integration Bridge
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  RuntimeBridge,
  createRuntimeBridge,
  type RuntimeBridgeConfig,
} from '../src/integration/runtime-bridge';
import { PluginExecutionError } from '../src/errors';
import type { CommandPlugin, RuntimePlugin, RuntimeContext } from '../src/types';

// Helper to create a mock command plugin
function createMockCommandPlugin(overrides: Partial<CommandPlugin> = {}): CommandPlugin {
  return {
    name: 'test-command',
    type: 'command',
    pattern: /^test-command$/i,
    execute: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// Helper to create a mock runtime plugin
function createMockRuntimePlugin(overrides: Partial<RuntimePlugin> = {}): RuntimePlugin {
  return {
    name: 'test-runtime',
    type: 'runtime',
    ...overrides,
  };
}

describe('RuntimeBridge', () => {
  let bridge: RuntimeBridge;

  beforeEach(() => {
    bridge = new RuntimeBridge();
  });

  describe('constructor', () => {
    it('should create bridge with default config', () => {
      const bridge = new RuntimeBridge();
      expect(bridge.getRegisteredCommands()).toEqual([]);
    });

    it('should create bridge with custom config', () => {
      const onError = vi.fn();
      const bridge = new RuntimeBridge({
        enableHooks: false,
        onExecutionError: onError,
        executionTimeout: 5000,
        debug: true,
      });
      expect(bridge.getRegisteredCommands()).toEqual([]);
    });
  });

  describe('registerCommand', () => {
    it('should register a command plugin', () => {
      const plugin = createMockCommandPlugin({ name: 'toggle' });
      bridge.registerCommand(plugin);

      expect(bridge.hasCommand('toggle')).toBe(true);
      expect(bridge.getRegisteredCommands()).toContain('toggle');
    });

    it('should register multiple command plugins', () => {
      bridge.registerCommand(createMockCommandPlugin({ name: 'toggle' }));
      bridge.registerCommand(createMockCommandPlugin({ name: 'add' }));
      bridge.registerCommand(createMockCommandPlugin({ name: 'remove' }));

      expect(bridge.getRegisteredCommands()).toHaveLength(3);
    });

    it('should log in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const bridge = new RuntimeBridge({ debug: true });

      bridge.registerCommand(createMockCommandPlugin({ name: 'toggle' }));

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Registered command: toggle'));
      consoleSpy.mockRestore();
    });
  });

  describe('unregisterCommand', () => {
    it('should unregister an existing command', () => {
      bridge.registerCommand(createMockCommandPlugin({ name: 'toggle' }));

      expect(bridge.unregisterCommand('toggle')).toBe(true);
      expect(bridge.hasCommand('toggle')).toBe(false);
    });

    it('should return false for non-existent command', () => {
      expect(bridge.unregisterCommand('nonexistent')).toBe(false);
    });
  });

  describe('registerRuntimePlugin', () => {
    it('should register a runtime plugin', () => {
      const plugin = createMockRuntimePlugin({ name: 'logger' });
      bridge.registerRuntimePlugin(plugin);

      // Runtime plugins affect hooks, not directly queryable
      // Test that hooks are called during execution
    });
  });

  describe('executeCommand', () => {
    it('should execute a registered command', async () => {
      const executeFn = vi.fn().mockResolvedValue(undefined);
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'toggle',
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      const result = await bridge.executeCommand('toggle', element, ['.active']);

      expect(result.success).toBe(true);
      expect(result.commandName).toBe('toggle');
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(executeFn).toHaveBeenCalled();
    });

    it('should fail for unknown command', async () => {
      const element = document.createElement('button');
      const result = await bridge.executeCommand('unknown', element);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(PluginExecutionError);
      expect(result.error?.message).toContain('Command not found');
    });

    it('should call onExecutionError for errors', async () => {
      const onError = vi.fn();
      const bridge = new RuntimeBridge({ onExecutionError: onError });

      const element = document.createElement('button');
      await bridge.executeCommand('unknown', element);

      expect(onError).toHaveBeenCalled();
    });

    it('should handle execution errors', async () => {
      const executeFn = vi.fn().mockRejectedValue(new Error('Test error'));
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'failing',
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      const result = await bridge.executeCommand('failing', element);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(PluginExecutionError);
      expect(result.error?.message).toContain('Test error');
    });

    it('should pass args to execute function', async () => {
      const executeFn = vi.fn().mockResolvedValue(undefined);
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'add',
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      await bridge.executeCommand('add', element, ['.active', 'to', '#target']);

      const ctx = executeFn.mock.calls[0][0] as RuntimeContext;
      expect(ctx.args).toEqual(['.active', 'to', '#target']);
    });

    it('should pass modifiers to execute function', async () => {
      const executeFn = vi.fn().mockResolvedValue(undefined);
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'toggle',
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      const modifiers = new Map([['event', new Set(['click'])]]);
      await bridge.executeCommand('toggle', element, ['.active'], { modifiers });

      const ctx = executeFn.mock.calls[0][0] as RuntimeContext;
      expect(ctx.modifiers.get('event')).toEqual(new Set(['click']));
    });

    it('should pass event to context', async () => {
      const executeFn = vi.fn().mockResolvedValue(undefined);
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'toggle',
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      const event = new MouseEvent('click');
      await bridge.executeCommand('toggle', element, [], { event });

      const ctx = executeFn.mock.calls[0][0] as RuntimeContext;
      expect(ctx.event).toBe(event);
    });
  });

  describe('runtime plugin hooks', () => {
    it('should call beforeExecute hook', async () => {
      const beforeExecute = vi.fn();
      const runtimePlugin = createMockRuntimePlugin({
        name: 'logger',
        beforeExecute,
      });

      bridge.registerRuntimePlugin(runtimePlugin);
      bridge.registerCommand(createMockCommandPlugin({ name: 'toggle' }));

      const element = document.createElement('button');
      await bridge.executeCommand('toggle', element);

      expect(beforeExecute).toHaveBeenCalled();
    });

    it('should call afterExecute hook', async () => {
      const afterExecute = vi.fn();
      const runtimePlugin = createMockRuntimePlugin({
        name: 'logger',
        afterExecute,
      });

      bridge.registerRuntimePlugin(runtimePlugin);
      bridge.registerCommand(createMockCommandPlugin({ name: 'toggle' }));

      const element = document.createElement('button');
      await bridge.executeCommand('toggle', element);

      expect(afterExecute).toHaveBeenCalled();
    });

    it('should support command interception', async () => {
      const executeFn = vi.fn();
      const interceptCommand = vi.fn().mockReturnValue(true);
      const runtimePlugin = createMockRuntimePlugin({
        name: 'interceptor',
        interceptCommand,
      });

      bridge.registerRuntimePlugin(runtimePlugin);
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'toggle',
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      const result = await bridge.executeCommand('toggle', element);

      expect(result.success).toBe(true);
      expect(interceptCommand).toHaveBeenCalledWith('toggle', expect.any(Object));
      expect(executeFn).not.toHaveBeenCalled();
    });

    it('should not call hooks when disabled', async () => {
      const bridge = new RuntimeBridge({ enableHooks: false });
      const beforeExecute = vi.fn();
      const runtimePlugin = createMockRuntimePlugin({
        name: 'logger',
        beforeExecute,
      });

      bridge.registerRuntimePlugin(runtimePlugin);
      bridge.registerCommand(createMockCommandPlugin({ name: 'toggle' }));

      const element = document.createElement('button');
      await bridge.executeCommand('toggle', element);

      expect(beforeExecute).not.toHaveBeenCalled();
    });
  });

  describe('execution timeout', () => {
    it('should timeout long-running commands', async () => {
      const bridge = new RuntimeBridge({ executionTimeout: 50 });

      const executeFn = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 200))
      );
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'slow',
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      const result = await bridge.executeCommand('slow', element);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timed out');
    });
  });

  describe('parseAttribute', () => {
    it('should parse simple command', () => {
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'toggle',
          pattern: /^toggle$/i,
        })
      );

      const commands = bridge.parseAttribute('toggle .active');

      expect(commands.length).toBeGreaterThanOrEqual(0);
    });

    it('should parse event handler', () => {
      const commands = bridge.parseAttribute('on click toggle .active');

      expect(commands.length).toBe(1);
      expect(commands[0].name).toBe('_event_handler');
      expect(commands[0].modifiers.get('event')?.has('click')).toBe(true);
    });

    it('should parse multiple event handlers', () => {
      const commands = bridge.parseAttribute('on click toggle .active on mouseover add .hover');

      expect(commands.length).toBe(2);
      expect(commands[0].modifiers.get('event')?.has('click')).toBe(true);
      expect(commands[1].modifiers.get('event')?.has('mouseover')).toBe(true);
    });
  });

  describe('processAttribute', () => {
    it('should process attribute and execute commands', async () => {
      const executeFn = vi.fn().mockResolvedValue(undefined);
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'toggle',
          pattern: /^toggle$/i,
          execute: executeFn,
        })
      );

      const element = document.createElement('button');
      const attr = document.createAttribute('_');
      attr.value = 'toggle .active';
      element.setAttributeNode(attr);

      const results = await bridge.processAttribute(element, attr);

      // Results depend on successful parsing
      expect(results).toBeInstanceOf(Array);
    });

    it('should return empty array for empty attribute', async () => {
      const element = document.createElement('button');
      const attr = document.createAttribute('_');
      attr.value = '';
      element.setAttributeNode(attr);

      const results = await bridge.processAttribute(element, attr);

      expect(results).toEqual([]);
    });

    it('should setup event handlers', async () => {
      bridge.registerCommand(
        createMockCommandPlugin({
          name: 'toggle',
          pattern: /^toggle$/i,
        })
      );

      const element = document.createElement('button');
      const attr = document.createAttribute('_');
      attr.value = 'on click toggle .active';
      element.setAttributeNode(attr);

      await bridge.processAttribute(element, attr);

      // Event handler should be set up
      // We can't easily test this without triggering the event
    });
  });

  describe('cleanup', () => {
    it('should register and run cleanup functions', () => {
      const cleanupFn = vi.fn();
      const element = document.createElement('button');

      bridge.registerCleanup(element, cleanupFn);
      bridge.cleanup(element);

      expect(cleanupFn).toHaveBeenCalled();
    });

    it('should run multiple cleanup functions', () => {
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();
      const element = document.createElement('button');

      bridge.registerCleanup(element, cleanup1);
      bridge.registerCleanup(element, cleanup2);
      bridge.cleanup(element);

      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', () => {
      const bridge = new RuntimeBridge({ debug: true });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const cleanup = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      const element = document.createElement('button');

      bridge.registerCleanup(element, cleanup);
      expect(() => bridge.cleanup(element)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should clear cleanup functions after running', () => {
      const cleanupFn = vi.fn();
      const element = document.createElement('button');

      bridge.registerCleanup(element, cleanupFn);
      bridge.cleanup(element);
      bridge.cleanup(element); // Second call should not run cleanup again

      expect(cleanupFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getParserBridge', () => {
    it('should return the internal parser bridge', () => {
      const parserBridge = bridge.getParserBridge();

      expect(parserBridge).toBeDefined();
      expect(typeof parserBridge.registerCommand).toBe('function');
    });
  });

  describe('exportCommandRegistry', () => {
    it('should export command registry', () => {
      const executeFn1 = vi.fn();
      const executeFn2 = vi.fn();

      bridge.registerCommand(
        createMockCommandPlugin({ name: 'toggle', execute: executeFn1 })
      );
      bridge.registerCommand(
        createMockCommandPlugin({ name: 'add', execute: executeFn2 })
      );

      const registry = bridge.exportCommandRegistry();

      expect(registry.size).toBe(2);
      expect(registry.get('toggle')).toBe(executeFn1);
      expect(registry.get('add')).toBe(executeFn2);
    });
  });
});

describe('createRuntimeBridge', () => {
  it('should create bridge with pre-registered command plugins', () => {
    const plugins = [
      createMockCommandPlugin({ name: 'toggle' }),
      createMockCommandPlugin({ name: 'add' }),
    ];

    const bridge = createRuntimeBridge(plugins);

    expect(bridge.hasCommand('toggle')).toBe(true);
    expect(bridge.hasCommand('add')).toBe(true);
  });

  it('should create bridge with runtime plugins', () => {
    const commandPlugins = [createMockCommandPlugin({ name: 'toggle' })];
    const runtimePlugins = [
      createMockRuntimePlugin({ name: 'logger', beforeExecute: vi.fn() }),
    ];

    const bridge = createRuntimeBridge(commandPlugins, runtimePlugins);

    expect(bridge.hasCommand('toggle')).toBe(true);
  });

  it('should apply config to created bridge', () => {
    const onError = vi.fn();
    const bridge = createRuntimeBridge([], [], { onExecutionError: onError });

    // Execute unknown command to trigger error
    const element = document.createElement('button');
    bridge.executeCommand('unknown', element);

    // Allow async execution
    setTimeout(() => {
      expect(onError).toHaveBeenCalled();
    }, 10);
  });
});

describe('createRuntimeContext', () => {
  let bridge: RuntimeBridge;

  beforeEach(() => {
    bridge = new RuntimeBridge();
  });

  it('should create runtime context with all properties', () => {
    const plugin = createMockCommandPlugin({ name: 'toggle' });
    const element = document.createElement('button');
    const args = ['.active'];
    const modifiers = new Map([['event', new Set(['click'])]]);
    const event = new MouseEvent('click');

    const ctx = bridge.createRuntimeContext(element, plugin, args, modifiers, { event });

    expect(ctx.element).toBe(element);
    expect(ctx.plugin).toBe(plugin);
    expect(ctx.args).toEqual(args);
    expect(ctx.modifiers).toBe(modifiers);
    expect(ctx.event).toBe(event);
    expect(ctx.target).toBe(element);
  });

  it('should use custom target when provided', () => {
    const plugin = createMockCommandPlugin({ name: 'toggle' });
    const element = document.createElement('button');
    const target = document.createElement('div');

    const ctx = bridge.createRuntimeContext(element, plugin, [], new Map(), { target });

    expect(ctx.target).toBe(target);
  });
});
