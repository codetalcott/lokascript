/**
 * HyperFixi Core - Universal Modern Hyperscript
 * Works in Node.js, Deno, and browsers
 */

// ============================================================================
// Core Types and Interfaces
// ============================================================================

export type {
  // Enhanced core types for LLM agents
  TypedCommandImplementation,
  TypedExecutionContext,
  TypedExpressionImplementation,
  EvaluationResult,
  ValidationResult,
  HyperScriptError,
  HyperScriptValue,
  CommandMetadata,
  LLMDocumentation,
} from './types/enhanced-core.ts';

export type {
  // Legacy compatibility types
  CommandImplementation,
  ExecutionContext,
  ExpressionImplementation,
} from './types/core.ts';

// ============================================================================
// Commands - DOM Manipulation
// ============================================================================

export { HideCommand, createHideCommand } from './commands/dom/hide.ts';
export { ShowCommand } from './commands/dom/show.ts';
export { ToggleCommand } from './commands/dom/toggle.ts';
export { AddCommand } from './commands/dom/add.ts';
export { RemoveCommand } from './commands/dom/remove.ts';

// ============================================================================
// Commands - Events
// ============================================================================

export { OnCommand } from './commands/events/on.ts';
export { TriggerCommand } from './commands/events/trigger.ts';
export { SendCommand } from './commands/events/send.ts';

// ============================================================================
// Commands - Navigation
// ============================================================================

export { GoCommand } from './commands/navigation/go.ts';

// ============================================================================
// Commands - Async Operations
// ============================================================================

export { FetchCommand } from './commands/async/fetch.ts';
export { WaitCommand } from './commands/async/wait.ts';

// ============================================================================
// Commands - Control Flow
// ============================================================================

export { IfCommand } from './commands/control/if.ts';
export { RepeatCommand } from './commands/control/repeat.ts';

// ============================================================================
// Expressions - All Categories
// ============================================================================

export {
  // Reference expressions (me, you, it, CSS selectors)
  evaluateReference,
  type ReferenceExpression,
} from './expressions/references/index.ts';

export {
  // Logical expressions (and, or, not, comparisons)
  evaluateLogical,
  type LogicalExpression,
} from './expressions/logical/index.ts';

export {
  // Type conversion expressions (as keyword)
  evaluateConversion,
  type ConversionExpression,
} from './expressions/conversion/index.ts';

export {
  // Positional expressions (first, last, etc.)
  evaluatePositional,
  type PositionalExpression,
} from './expressions/positional/index.ts';

export {
  // Property expressions (possessive syntax)
  evaluateProperties,
  type PropertyExpression,
} from './expressions/properties/index.ts';

export {
  // Special expressions (literals, math)
  evaluateSpecial,
  type SpecialExpression,
} from './expressions/special/index.ts';

// ============================================================================
// Features - Top-level hyperscript features
// ============================================================================

export { BehaviorFeature } from './features/behavior.ts';
export { InitFeature } from './features/init.ts';
export { InstallFeature } from './features/install.ts';
export { WorkerFeature } from './features/worker.ts';
export { EverywhereFeature } from './features/everywhere.ts';
export { DefFeature } from './features/def.ts';
export { ClassFeature, type ClassFeatureOptions } from './features/class.ts';
export { JSFeature } from './features/js.ts';
export { SetFeature } from './features/set.ts';

// ============================================================================
// Extensions
// ============================================================================

export {
  TailwindExtension,
  type TailwindExtensionOptions,
  type TailwindStrategy,
} from './extensions/tailwind.ts';

// ============================================================================
// Core Runtime and Utilities
// ============================================================================

export { createContext } from './core/context.ts';
export { Parser } from './parser/parser.ts';
export { Tokenizer } from './parser/tokenizer.ts';

// ============================================================================
// Runtime Environment Detection
// ============================================================================

export {
  isDeno,
  isNode,
  isBrowser,
  getRuntimeInfo,
  getLLMRuntimeInfo,
  logger,
  performance,
  UniversalEventTarget,
} from './runtime/environment.ts';

/**
 * Get environment-specific information for LLM agents
 * @deprecated Use getLLMRuntimeInfo() instead
 */
export function getEnvironmentInfo() {
  const isDeno = typeof Deno !== 'undefined';
  const isNode = typeof process !== 'undefined' && process.versions?.node;
  const isBrowser = typeof window !== 'undefined';
  
  return {
    runtime: isDeno ? 'deno' : isNode ? 'node' : isBrowser ? 'browser' : 'unknown',
    hasDOM: typeof document !== 'undefined',
    hasWebAPIs: typeof fetch !== 'undefined',
    typescript: true, // HyperFixi is always TypeScript
    version: '1.0.0',
  };
}

// ============================================================================
// Factory Functions for Tree-shaking
// ============================================================================

/**
 * Create a minimal runtime with core functionality
 * @llm-bundle-size 5KB
 * @llm-description Basic expression evaluation and DOM commands
 */
export function createMinimalRuntime() {
  return {
    commands: new Map(),
    expressions: new Map(),
    features: new Map(),
    extensions: new Map(),
    
    addCommand(command: any) {
      this.commands.set(command.name, command);
      return this;
    },
    
    addExpression(expression: any) {
      this.expressions.set(expression.name, expression);
      return this;
    },
    
    environment: getEnvironmentInfo(),
  };
}

/**
 * Create a full-featured runtime
 * @llm-bundle-size 25KB
 * @llm-description Complete hyperscript implementation
 */
export function createFullRuntime() {
  const runtime = createMinimalRuntime();
  
  // Add all commands
  runtime.addCommand(new HideCommand());
  runtime.addCommand(new ShowCommand());
  runtime.addCommand(new ToggleCommand());
  // ... etc
  
  return runtime;
}