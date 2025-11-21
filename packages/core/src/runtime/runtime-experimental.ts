/**
 * RuntimeExperimental - Test runtime using RuntimeBase + CommandAdapterV2 + commands-v2
 *
 * This is an experimental runtime for testing the tree-shaking refactoring.
 * It uses:
 * - RuntimeBase (generic, zero command imports)
 * - EnhancedCommandRegistryV2 (generic adapter)
 * - Commands from commands-v2/ (with parseInput() methods)
 *
 * This runtime is for validation and testing only. DO NOT use in production
 * until Phase 5 validation is complete.
 */

import { RuntimeBase } from './runtime-base';
import { EnhancedCommandRegistryV2 } from './command-adapter-v2';
import type { EnhancedCommandRegistry } from './command-adapter';
import { ExpressionEvaluator } from '../core/expression-evaluator';
import { LazyExpressionEvaluator } from '../core/lazy-expression-evaluator';

// Import commands-v2 (with parseInput() methods)
import { createHideCommand } from '../commands-v2/dom/hide';
import { createShowCommand } from '../commands-v2/dom/show';
import { createAddCommand } from '../commands-v2/dom/add';
import { createRemoveCommand } from '../commands-v2/dom/remove';
import { createToggleCommand } from '../commands-v2/dom/toggle';

export interface RuntimeExperimentalOptions {
  /**
   * Enable lazy loading of expressions
   */
  lazyLoad?: boolean;

  /**
   * Preload level for expressions (if lazy loading enabled)
   */
  expressionPreload?: 'core' | 'all' | 'common' | 'none';

  /**
   * Custom registry (optional - if not provided, creates default with 5 core commands)
   */
  registry?: EnhancedCommandRegistryV2;

  /**
   * Enable async command execution
   */
  enableAsyncCommands?: boolean;

  /**
   * Command timeout in milliseconds
   */
  commandTimeout?: number;

  /**
   * Enable error reporting
   */
  enableErrorReporting?: boolean;
}

/**
 * RuntimeExperimental - Test runtime for tree-shaking validation
 *
 * This runtime extends RuntimeBase and pre-registers 5 core commands from
 * commands-v2/ for testing purposes.
 *
 * Key differences from Runtime:
 * - Uses RuntimeBase (generic AST traversal)
 * - Uses EnhancedCommandRegistryV2 (generic adapter)
 * - Uses commands-v2 (with parseInput())
 * - Only registers 5 core commands by default
 * - Much smaller bundle size (estimated 120KB vs 511KB)
 */
export class RuntimeExperimental extends RuntimeBase {
  constructor(options: RuntimeExperimentalOptions = {}) {
    // Create or use provided registry
    const registry = options.registry || new EnhancedCommandRegistryV2();

    // If no custom registry provided, register default 5 core commands
    if (!options.registry) {
      // Register commands from commands-v2/ (with parseInput() methods)
      registry.register(createHideCommand());
      registry.register(createShowCommand());
      registry.register(createAddCommand());
      registry.register(createRemoveCommand());
      registry.register(createToggleCommand());

      console.log('RuntimeExperimental: Registered 5 core commands (hide, show, add, remove, toggle)');
    }

    // Create expression evaluator (lazy or standard)
    const expressionEvaluator = options.lazyLoad
      ? new LazyExpressionEvaluator({ preload: options.expressionPreload || 'core' })
      : new ExpressionEvaluator();

    // Initialize RuntimeBase with registry and evaluator
    // Note: Cast registry to EnhancedCommandRegistry for type compatibility
    // EnhancedCommandRegistryV2 implements the same interface
    const baseOptions: any = {
      registry: registry as unknown as EnhancedCommandRegistry,
      expressionEvaluator,
    };

    if (options.enableAsyncCommands !== undefined) {
      baseOptions.enableAsyncCommands = options.enableAsyncCommands;
    }
    if (options.commandTimeout !== undefined) {
      baseOptions.commandTimeout = options.commandTimeout;
    }
    if (options.enableErrorReporting !== undefined) {
      baseOptions.enableErrorReporting = options.enableErrorReporting;
    }

    super(baseOptions);
  }
}

/**
 * Factory function for creating RuntimeExperimental with default options
 */
export function createRuntimeExperimental(options: RuntimeExperimentalOptions = {}): RuntimeExperimental {
  return new RuntimeExperimental(options);
}

/**
 * Factory function for creating a minimal runtime with custom commands
 *
 * Example usage:
 * ```typescript
 * import { createMinimalRuntime } from './runtime-experimental';
 * import { createHideCommand, createShowCommand } from '../commands-v2';
 *
 * const runtime = createMinimalRuntime([
 *   createHideCommand(),
 *   createShowCommand()
 * ]);
 * ```
 */
export function createMinimalRuntime(
  commands: any[],
  options: Omit<RuntimeExperimentalOptions, 'registry'> = {}
): RuntimeExperimental {
  const registry = new EnhancedCommandRegistryV2();

  for (const command of commands) {
    registry.register(command);
  }

  return new RuntimeExperimental({
    ...options,
    registry,
  });
}
