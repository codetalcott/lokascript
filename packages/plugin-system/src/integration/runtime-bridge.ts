/**
 * Runtime Integration Bridge
 * Bridges plugin-system with the core hyperfixi runtime
 */

import type {
  Plugin,
  CommandPlugin,
  RuntimePlugin,
  RuntimeContext,
  ExecutionContext,
} from '../types';
import { PluginExecutionError } from '../errors';
import { ParserBridge, tokenize } from './parser-bridge';

/**
 * Configuration for runtime bridge
 */
export interface RuntimeBridgeConfig {
  /** Whether to run beforeExecute/afterExecute hooks */
  enableHooks?: boolean;
  /** Custom error handler */
  onExecutionError?: (error: PluginExecutionError) => void;
  /** Max execution time in ms (0 = no limit) */
  executionTimeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Result of command execution
 */
export interface ExecutionResult {
  success: boolean;
  error?: PluginExecutionError;
  duration: number;
  commandName: string;
}

/**
 * Parsed command with context
 */
export interface ParsedCommand {
  name: string;
  args: any[];
  modifiers: Map<string, Set<string>>;
  rawValue: string;
}

/**
 * Runtime Bridge
 * Provides integration between plugin-system and core hyperfixi runtime
 */
export class RuntimeBridge {
  private plugins = new Map<string, CommandPlugin>();
  private runtimePlugins: RuntimePlugin[] = [];
  private parserBridge: ParserBridge;
  private config: Required<RuntimeBridgeConfig>;
  private cleanupFunctions = new Map<Element, (() => void)[]>();

  constructor(config: RuntimeBridgeConfig = {}) {
    this.config = {
      enableHooks: true,
      onExecutionError: () => {},
      executionTimeout: 0,
      debug: false,
      ...config,
    };
    this.parserBridge = new ParserBridge();
  }

  /**
   * Register a command plugin
   */
  registerCommand(plugin: CommandPlugin): void {
    this.plugins.set(plugin.name, plugin);
    this.parserBridge.registerCommand(plugin);

    if (this.config.debug) {
      console.log(`[RuntimeBridge] Registered command: ${plugin.name}`);
    }
  }

  /**
   * Register a runtime plugin for hooks
   */
  registerRuntimePlugin(plugin: RuntimePlugin): void {
    this.runtimePlugins.push(plugin);

    if (this.config.debug) {
      console.log(`[RuntimeBridge] Registered runtime plugin: ${plugin.name}`);
    }
  }

  /**
   * Unregister a command
   */
  unregisterCommand(name: string): boolean {
    const removed = this.plugins.delete(name);
    if (removed) {
      this.parserBridge.unregisterCommand(name);
    }
    return removed;
  }

  /**
   * Check if a command is registered
   */
  hasCommand(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get all registered command names
   */
  getRegisteredCommands(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Parse a hyperscript attribute value into commands
   */
  parseAttribute(value: string): ParsedCommand[] {
    const commands: ParsedCommand[] = [];
    const tokens = tokenize(value);

    // Create parse context
    const ctx = this.parserBridge.createExtendedContext({
      input: value,
      position: 0,
      tokens,
      currentToken: tokens[0],
    });

    while (!ctx.isAtEnd()) {
      const token = ctx.peek();

      // Skip 'on' event handlers - these need different handling
      if (token.type === 'keyword' && token.value.toLowerCase() === 'on') {
        // Parse event handler: on <event> <commands>
        ctx.advance(); // consume 'on'

        // Get event name
        if (!ctx.isAtEnd()) {
          const eventToken = ctx.advance();
          const modifiers = new Map<string, Set<string>>();
          modifiers.set('event', new Set([eventToken.value]));

          // Collect commands until next 'on' or end
          const commandTokens: string[] = [];
          while (!ctx.isAtEnd()) {
            const next = ctx.peek();
            if (next.type === 'keyword' && next.value.toLowerCase() === 'on') {
              break;
            }
            commandTokens.push(ctx.advance().value);
          }

          if (commandTokens.length > 0) {
            commands.push({
              name: '_event_handler',
              args: commandTokens,
              modifiers,
              rawValue: `on ${eventToken.value} ${commandTokens.join(' ')}`,
            });
          }
        }
        continue;
      }

      // Try to match a command
      const result = this.parserBridge.tryParseAnyCommand(ctx);
      if (result) {
        commands.push({
          name: result.command,
          args: result.result.args || [],
          modifiers: this.extractModifiers(result.result),
          rawValue: value,
        });
      } else {
        // Skip unknown token
        ctx.advance();
      }
    }

    return commands;
  }

  /**
   * Extract modifiers from a parsed result
   */
  private extractModifiers(parsed: any): Map<string, Set<string>> {
    const modifiers = new Map<string, Set<string>>();

    if (parsed.modifiers) {
      for (const [key, values] of Object.entries(parsed.modifiers)) {
        if (Array.isArray(values)) {
          modifiers.set(key, new Set(values));
        } else if (typeof values === 'string') {
          modifiers.set(key, new Set([values]));
        }
      }
    }

    return modifiers;
  }

  /**
   * Create a runtime context for execution
   */
  createRuntimeContext(
    element: Element,
    plugin: Plugin,
    args: any[],
    modifiers: Map<string, Set<string>>,
    baseContext?: Partial<ExecutionContext>
  ): RuntimeContext {
    return {
      element,
      plugin,
      args,
      modifiers,
      event: baseContext?.event,
      target: baseContext?.target || element,
      ...baseContext,
    };
  }

  /**
   * Execute a command on an element
   */
  async executeCommand(
    commandName: string,
    element: Element,
    args: any[] = [],
    options?: {
      modifiers?: Map<string, Set<string>>;
      event?: Event;
      baseContext?: Partial<ExecutionContext>;
    }
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const plugin = this.plugins.get(commandName);

    if (!plugin) {
      const error = new PluginExecutionError(commandName, 'Command not found', { element });
      this.config.onExecutionError(error);
      return {
        success: false,
        error,
        duration: performance.now() - startTime,
        commandName,
      };
    }

    const ctx = this.createRuntimeContext(
      element,
      plugin,
      args,
      options?.modifiers || new Map(),
      {
        event: options?.event,
        ...options?.baseContext,
      }
    );

    // Run beforeExecute hooks
    if (this.config.enableHooks) {
      for (const runtimePlugin of this.runtimePlugins) {
        if (runtimePlugin.beforeExecute) {
          try {
            runtimePlugin.beforeExecute(ctx);
          } catch (error) {
            if (this.config.debug) {
              console.warn(`[RuntimeBridge] beforeExecute hook failed for ${runtimePlugin.name}:`, error);
            }
          }
        }

        // Check for command interception
        if (runtimePlugin.interceptCommand?.(commandName, ctx)) {
          if (this.config.debug) {
            console.log(`[RuntimeBridge] Command ${commandName} intercepted by ${runtimePlugin.name}`);
          }
          return {
            success: true,
            duration: performance.now() - startTime,
            commandName,
          };
        }
      }
    }

    try {
      // Execute with optional timeout
      if (this.config.executionTimeout > 0) {
        await Promise.race([
          this.executeWithCleanup(plugin, ctx),
          this.createTimeout(commandName, element),
        ]);
      } else {
        await this.executeWithCleanup(plugin, ctx);
      }

      // Run afterExecute hooks
      if (this.config.enableHooks) {
        for (const runtimePlugin of this.runtimePlugins) {
          if (runtimePlugin.afterExecute) {
            try {
              runtimePlugin.afterExecute(ctx);
            } catch (error) {
              if (this.config.debug) {
                console.warn(`[RuntimeBridge] afterExecute hook failed for ${runtimePlugin.name}:`, error);
              }
            }
          }
        }
      }

      return {
        success: true,
        duration: performance.now() - startTime,
        commandName,
      };
    } catch (error) {
      let execError: PluginExecutionError;
      if (error instanceof PluginExecutionError) {
        execError = error;
      } else {
        const errorOptions: {
          element: Element;
          action: string;
          cause?: Error;
        } = {
          element,
          action: args.join(' '),
        };
        if (error instanceof Error) {
          errorOptions.cause = error;
        }
        execError = new PluginExecutionError(
          commandName,
          error instanceof Error ? error.message : String(error),
          errorOptions
        );
      }

      this.config.onExecutionError(execError);

      return {
        success: false,
        error: execError,
        duration: performance.now() - startTime,
        commandName,
      };
    }
  }

  /**
   * Execute plugin and handle cleanup registration
   */
  private async executeWithCleanup(plugin: CommandPlugin, ctx: RuntimeContext): Promise<void> {
    await plugin.execute(ctx);

    // Register cleanup if returned
    if (typeof ctx.cleanup === 'function') {
      this.registerCleanup(ctx.element, ctx.cleanup);
    }
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(commandName: string, element: Element): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new PluginExecutionError(commandName, `Execution timed out after ${this.config.executionTimeout}ms`, {
            element,
          })
        );
      }, this.config.executionTimeout);
    });
  }

  /**
   * Process a hyperscript attribute on an element
   */
  async processAttribute(element: Element, attr: Attr): Promise<ExecutionResult[]> {
    const value = attr.value;
    if (!value) return [];

    const commands = this.parseAttribute(value);
    const results: ExecutionResult[] = [];

    for (const command of commands) {
      // Skip event handlers - they need to be set up differently
      if (command.name === '_event_handler') {
        this.setupEventHandler(element, command);
        continue;
      }

      const result = await this.executeCommand(command.name, element, command.args, {
        modifiers: command.modifiers,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Setup an event handler for an element
   */
  private setupEventHandler(element: Element, command: ParsedCommand): void {
    const eventName = command.modifiers.get('event')?.values().next().value;
    if (!eventName) return;

    const handler = async (event: Event) => {
      // Parse and execute the command sequence
      const commandArgs = command.args;
      if (commandArgs.length === 0) return;

      // Try to find matching command
      const firstArg = String(commandArgs[0]).toLowerCase();
      const plugin = this.plugins.get(firstArg);

      if (plugin) {
        await this.executeCommand(firstArg, element, commandArgs.slice(1), {
          event,
          modifiers: command.modifiers,
        });
      }
    };

    element.addEventListener(eventName, handler);

    // Register cleanup for event listener
    this.registerCleanup(element, () => {
      element.removeEventListener(eventName, handler);
    });

    if (this.config.debug) {
      console.log(`[RuntimeBridge] Set up event handler: ${eventName} on`, element);
    }
  }

  /**
   * Register a cleanup function for an element
   */
  registerCleanup(element: Element, cleanup: () => void): void {
    const existing = this.cleanupFunctions.get(element) || [];
    existing.push(cleanup);
    this.cleanupFunctions.set(element, existing);
  }

  /**
   * Run cleanup functions for an element
   */
  cleanup(element: Element): void {
    const cleanups = this.cleanupFunctions.get(element);
    if (cleanups) {
      for (const fn of cleanups) {
        try {
          fn();
        } catch (error) {
          if (this.config.debug) {
            console.warn(`[RuntimeBridge] Cleanup failed for element:`, error);
          }
        }
      }
      this.cleanupFunctions.delete(element);
    }
  }

  /**
   * Get the parser bridge for advanced usage
   */
  getParserBridge(): ParserBridge {
    return this.parserBridge;
  }

  /**
   * Export command registry compatible with core runtime
   */
  exportCommandRegistry(): Map<string, (ctx: RuntimeContext) => Promise<void> | void> {
    const registry = new Map<string, (ctx: RuntimeContext) => Promise<void> | void>();

    for (const [name, plugin] of this.plugins) {
      registry.set(name, plugin.execute);
    }

    return registry;
  }
}

/**
 * Factory function to create a runtime bridge with plugins pre-registered
 */
export function createRuntimeBridge(
  commandPlugins: CommandPlugin[],
  runtimePlugins: RuntimePlugin[] = [],
  config?: RuntimeBridgeConfig
): RuntimeBridge {
  const bridge = new RuntimeBridge(config);

  for (const plugin of commandPlugins) {
    bridge.registerCommand(plugin);
  }

  for (const plugin of runtimePlugins) {
    bridge.registerRuntimePlugin(plugin);
  }

  return bridge;
}
