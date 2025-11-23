/**
 * Runtime - Clean V2 Implementation
 *
 * This runtime extends RuntimeBase and registers all 43 V2 commands from commands-v2/.
 *
 * Key improvements over V1:
 * - Extends RuntimeBase (generic AST traversal)
 * - Uses EnhancedCommandRegistryV2 (70% simpler adapter)
 * - Uses commands-v2 (standalone, zero V1 dependencies)
 * - Registers 43 V2 commands by default
 * - Much smaller bundle size (~224 KB vs 366 KB V1 baseline, 39% reduction)
 * - 100% tree-shakeable architecture
 *
 * Phase 7: Runtime Consolidation
 * - Replaces legacy runtime.ts (2,972 lines) with clean V2 implementation
 * - Eliminates 3,945 lines of duplicate V1 code
 * - Single runtime architecture (no V1/V2 confusion)
 */

import { RuntimeBase } from './runtime-base';
import { EnhancedCommandRegistryV2 } from './command-adapter';
import type { EnhancedCommandRegistry } from './command-adapter';
import { ExpressionEvaluator } from '../core/expression-evaluator';
import { LazyExpressionEvaluator } from '../core/lazy-expression-evaluator';

// Import all 43 V2 commands
// DOM Commands (7)
import { createHideCommand } from '../commands-v2/dom/hide';
import { createShowCommand } from '../commands-v2/dom/show';
import { createAddCommand } from '../commands-v2/dom/add';
import { createRemoveCommand } from '../commands-v2/dom/remove';
import { createToggleCommand } from '../commands-v2/dom/toggle';
import { createPutCommand } from '../commands-v2/dom/put';
import { createMakeCommand } from '../commands-v2/dom/make';

// Async Commands (2)
import { createWaitCommand } from '../commands-v2/async/wait';
import { createFetchCommand } from '../commands-v2/async/fetch';

// Data Commands (3)
import { createSetCommand } from '../commands-v2/data/set';
import { createIncrementCommand } from '../commands-v2/data/increment';
import { createDecrementCommand } from '../commands-v2/data/decrement';

// Utility Commands (1)
import { createLogCommand } from '../commands-v2/utility/log';

// Event Commands (2)
import { createTriggerCommand } from '../commands-v2/events/trigger';
import { createSendCommand } from '../commands-v2/events/send';

// Navigation Commands (1)
import { createGoCommand } from '../commands-v2/navigation/go';

// Control Flow Commands (7)
import { createIfCommand } from '../commands-v2/control-flow/if';
import { createRepeatCommand } from '../commands-v2/control-flow/repeat';
import { createBreakCommand } from '../commands-v2/control-flow/break';
import { createContinueCommand } from '../commands-v2/control-flow/continue';
import { createHaltCommand } from '../commands-v2/control-flow/halt';
import { createReturnCommand } from '../commands-v2/control-flow/return';
import { createExitCommand } from '../commands-v2/control-flow/exit';

// Data Commands - Phase 6-2 (1)
import { createBindCommand } from '../commands-v2/data/bind';

// Execution Commands (1)
import { createCallCommand } from '../commands-v2/execution/call';

// Content Commands (1)
import { createAppendCommand } from '../commands-v2/content/append';

// Animation Commands - Phase 6-3 (3)
import { createTransitionCommand } from '../commands-v2/animation/transition';
import { createMeasureCommand } from '../commands-v2/animation/measure';
import { createSettleCommand } from '../commands-v2/animation/settle';

// Data Persistence - Phase 6-3 (1)
import { createPersistCommand } from '../commands-v2/data/persist';

// Advanced Commands - Phase 6-4 (2)
import { createJsCommand } from '../commands-v2/advanced/js';
import { createAsyncCommand } from '../commands-v2/advanced/async';

// Control Flow - Phase 6-4 (1)
import { createUnlessCommand } from '../commands-v2/control-flow/unless';

// Data Commands - Phase 6-4 (1)
import { createDefaultCommand } from '../commands-v2/data/default';

// Execution Commands - Phase 6-4 (1)
import { createPseudoCommand } from '../commands-v2/execution/pseudo-command';

// Utility & Specialized - Phase 6-5 (6)
import { createTellCommand } from '../commands-v2/utility/tell';
import { createCopyCommand } from '../commands-v2/utility/copy';
import { createPickCommand } from '../commands-v2/utility/pick';
import { createThrowCommand } from '../commands-v2/control-flow/throw';
import { createBeepCommand } from '../commands-v2/utility/beep';
import { createInstallCommand } from '../commands-v2/behaviors/install';

// Final Commands - Phase 6-6 (2)
import { createTakeCommand } from '../commands-v2/animation/take';
import { createRenderCommand } from '../commands-v2/templates/render';

/**
 * Runtime options (backward compatible with V1 interface)
 */
export interface RuntimeOptions {
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

  /**
   * Enable lazy loading of expressions (default: true)
   */
  lazyLoad?: boolean;

  /**
   * Expression preloading strategy
   * - 'core': Load only essential expressions (default, ~40KB)
   * - 'common': Load core + common expressions (~70KB)
   * - 'all': Eager load all expressions (legacy behavior, ~100KB)
   * - 'none': Maximum lazy loading (load on first use)
   */
  expressionPreload?: 'core' | 'common' | 'all' | 'none';

  /**
   * Custom registry (optional - if not provided, creates default with 43 V2 commands)
   */
  registry?: EnhancedCommandRegistryV2;

  /**
   * Deprecated - V1 option, kept for backward compatibility
   * @deprecated Use lazyLoad instead
   */
  useEnhancedCommands?: boolean;

  /**
   * Deprecated - V1 option, kept for backward compatibility
   * @deprecated All commands are now lazy-loaded by default
   */
  commands?: string[];
}

/**
 * Runtime - Clean V2 Implementation
 *
 * Production-ready runtime that extends RuntimeBase and registers all 43 V2 commands.
 *
 * Key features:
 * - 100% V2 architecture (zero V1 dependencies)
 * - All 43 user-facing commands registered
 * - Tree-shakeable design (224 KB bundle)
 * - Lazy expression loading support
 * - Backward compatible with V1 RuntimeOptions
 */
export class Runtime extends RuntimeBase {
  constructor(options: RuntimeOptions = {}) {
    // Create or use provided registry
    const registry = options.registry || new EnhancedCommandRegistryV2();

    // If no custom registry provided, register all 43 V2 commands
    if (!options.registry) {
      // DOM Commands (7)
      registry.register(createHideCommand());
      registry.register(createShowCommand());
      registry.register(createAddCommand());
      registry.register(createRemoveCommand());
      registry.register(createToggleCommand());
      registry.register(createPutCommand());
      registry.register(createMakeCommand());

      // Async Commands (2)
      registry.register(createWaitCommand());
      registry.register(createFetchCommand());

      // Data Commands (3)
      registry.register(createSetCommand());
      registry.register(createIncrementCommand());
      registry.register(createDecrementCommand());

      // Utility Commands (1)
      registry.register(createLogCommand());

      // Event Commands (2)
      registry.register(createTriggerCommand());
      registry.register(createSendCommand());

      // Navigation Commands (1)
      registry.register(createGoCommand());

      // Control Flow Commands (7)
      registry.register(createIfCommand());
      registry.register(createRepeatCommand());
      registry.register(createBreakCommand());
      registry.register(createContinueCommand());
      registry.register(createHaltCommand());
      registry.register(createReturnCommand());
      registry.register(createExitCommand());

      // Phase 6-2 Commands (5)
      registry.register(createBindCommand());
      registry.register(createCallCommand());
      registry.register(createAppendCommand());

      // Phase 6-3 Commands (4)
      registry.register(createTransitionCommand());
      registry.register(createMeasureCommand());
      registry.register(createSettleCommand());
      registry.register(createPersistCommand());

      // Phase 6-4 Commands (5)
      registry.register(createJsCommand());
      registry.register(createAsyncCommand());
      registry.register(createUnlessCommand());
      registry.register(createDefaultCommand());
      registry.register(createPseudoCommand());

      // Phase 6-5 Commands (6)
      registry.register(createTellCommand());
      registry.register(createCopyCommand());
      registry.register(createPickCommand());
      registry.register(createThrowCommand());
      registry.register(createBeepCommand());
      registry.register(createInstallCommand());

      // Phase 6-6 Commands (2)
      registry.register(createTakeCommand());
      registry.register(createRenderCommand());

      console.log('Runtime V2: Registered 43 V2 commands (Phase 7 COMPLETE - V1 runtime eliminated)');
    }

    // Create expression evaluator (lazy or standard)
    const expressionEvaluator = options.lazyLoad !== false
      ? new LazyExpressionEvaluator({ preload: options.expressionPreload || 'core' })
      : new ExpressionEvaluator();

    // Initialize RuntimeBase with registry and evaluator
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
 * Factory function for creating Runtime with default options
 */
export function createRuntime(options: RuntimeOptions = {}): Runtime {
  return new Runtime(options);
}

/**
 * Factory function for creating a minimal runtime with custom commands
 *
 * Example usage:
 * ```typescript
 * import { createMinimalRuntime } from './runtime';
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
  options: Omit<RuntimeOptions, 'registry'> = {}
): Runtime {
  const registry = new EnhancedCommandRegistryV2();

  for (const command of commands) {
    registry.register(command);
  }

  return new Runtime({
    ...options,
    registry,
  });
}
