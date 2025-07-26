/**
 * Enhanced Command Registry
 * Central registry for all TypedCommandImplementation commands
 * Provides factory functions and type-safe command registration
 */

// Data Commands
import { createEnhancedIncrementCommand, EnhancedIncrementCommand } from './data/enhanced-increment.js';
import { createEnhancedDecrementCommand, EnhancedDecrementCommand } from './data/enhanced-decrement.js';
import { createEnhancedSetCommand, EnhancedSetCommand } from './data/enhanced-set.js';
import { createEnhancedDefaultCommand, EnhancedDefaultCommand } from './data/enhanced-default.js';

// Creation Commands
import { createEnhancedMakeCommand, EnhancedMakeCommand } from './creation/enhanced-make.js';

// Content Commands
import { createEnhancedAppendCommand, EnhancedAppendCommand } from './content/enhanced-append.js';

// Execution Commands
import { createEnhancedCallCommand, createEnhancedGetCommand, EnhancedCallCommand, EnhancedGetCommand } from './execution/enhanced-call.js';

// Control Flow Commands
import { createEnhancedIfCommand, EnhancedIfCommand } from './control-flow/enhanced-if.js';
import { createEnhancedHaltCommand, EnhancedHaltCommand } from './control-flow/enhanced-halt.js';
import { createEnhancedReturnCommand, EnhancedReturnCommand } from './control-flow/enhanced-return.js';
import { createEnhancedThrowCommand, EnhancedThrowCommand } from './control-flow/enhanced-throw.js';
import { createEnhancedRepeatCommand, EnhancedRepeatCommand } from './control-flow/enhanced-repeat.js';
import { createEnhancedUnlessCommand, EnhancedUnlessCommand } from './control-flow/enhanced-unless.js';
import { createEnhancedContinueCommand, EnhancedContinueCommand } from './control-flow/enhanced-continue.js';
import { createEnhancedBreakCommand, EnhancedBreakCommand } from './control-flow/enhanced-break.js';

// Utility Commands
import { createEnhancedPickCommand, EnhancedPickCommand } from './utility/enhanced-pick.js';

// Advanced Commands
import { createEnhancedTellCommand, EnhancedTellCommand } from './advanced/enhanced-tell.js';
import { createEnhancedJSCommand, EnhancedJSCommand } from './advanced/enhanced-js.js';
import { createEnhancedBeepCommand, EnhancedBeepCommand } from './advanced/enhanced-beep.js';
import { createEnhancedAsyncCommand, EnhancedAsyncCommand } from './advanced/enhanced-async.js';

// Animation Commands
import { createEnhancedSettleCommand, EnhancedSettleCommand } from './animation/enhanced-settle.js';
import { createEnhancedMeasureCommand, EnhancedMeasureCommand } from './animation/enhanced-measure.js';
import { createEnhancedTransitionCommand, EnhancedTransitionCommand } from './animation/enhanced-transition.js';

// Template Commands
import { createEnhancedRenderCommand, EnhancedRenderCommand } from './templates/enhanced-render.js';

// Re-export everything
export {
  // Data Commands
  createEnhancedIncrementCommand, EnhancedIncrementCommand,
  createEnhancedDecrementCommand, EnhancedDecrementCommand,
  createEnhancedSetCommand, EnhancedSetCommand,
  createEnhancedDefaultCommand, EnhancedDefaultCommand,
  
  // Creation Commands
  createEnhancedMakeCommand, EnhancedMakeCommand,
  
  // Content Commands
  createEnhancedAppendCommand, EnhancedAppendCommand,
  
  // Execution Commands
  createEnhancedCallCommand, createEnhancedGetCommand, EnhancedCallCommand, EnhancedGetCommand,
  
  // Control Flow Commands
  createEnhancedIfCommand, EnhancedIfCommand,
  createEnhancedHaltCommand, EnhancedHaltCommand,
  createEnhancedReturnCommand, EnhancedReturnCommand,
  createEnhancedThrowCommand, EnhancedThrowCommand,
  createEnhancedRepeatCommand, EnhancedRepeatCommand,
  createEnhancedUnlessCommand, EnhancedUnlessCommand,
  createEnhancedContinueCommand, EnhancedContinueCommand,
  createEnhancedBreakCommand, EnhancedBreakCommand,
  
  // Utility Commands
  createEnhancedPickCommand, EnhancedPickCommand,
  
  // Advanced Commands
  createEnhancedTellCommand, EnhancedTellCommand,
  createEnhancedJSCommand, EnhancedJSCommand,
  createEnhancedBeepCommand, EnhancedBeepCommand,
  createEnhancedAsyncCommand, EnhancedAsyncCommand,
  
  // Animation Commands
  createEnhancedSettleCommand, EnhancedSettleCommand,
  createEnhancedMeasureCommand, EnhancedMeasureCommand,
  createEnhancedTransitionCommand, EnhancedTransitionCommand,
  
  // Template Commands
  createEnhancedRenderCommand, EnhancedRenderCommand,
};

import type { TypedCommandImplementation } from '../types/core.js';
import type { TypedExecutionContext } from '../types/enhanced-core.js';

/**
 * Enhanced Command Factory Registry
 * Maps command names to their factory functions
 */
export const ENHANCED_COMMAND_FACTORIES = {
  // Data Commands
  increment: createEnhancedIncrementCommand,
  decrement: createEnhancedDecrementCommand,
  set: createEnhancedSetCommand,
  default: createEnhancedDefaultCommand,

  // Creation Commands
  make: createEnhancedMakeCommand,

  // Content Commands
  append: createEnhancedAppendCommand,

  // Execution Commands
  call: createEnhancedCallCommand,
  get: createEnhancedGetCommand,

  // Control Flow Commands
  if: createEnhancedIfCommand,
  halt: createEnhancedHaltCommand,
  return: createEnhancedReturnCommand,
  throw: createEnhancedThrowCommand,
  repeat: createEnhancedRepeatCommand,
  unless: createEnhancedUnlessCommand,
  continue: createEnhancedContinueCommand,
  break: createEnhancedBreakCommand,

  // Utility Commands
  pick: createEnhancedPickCommand,

  // Advanced Commands
  tell: createEnhancedTellCommand,
  js: createEnhancedJSCommand,
  beep: createEnhancedBeepCommand,
  async: createEnhancedAsyncCommand,

  // Animation Commands
  settle: createEnhancedSettleCommand,
  measure: createEnhancedMeasureCommand,
  transition: createEnhancedTransitionCommand,

  // Template Commands
  render: createEnhancedRenderCommand,
} as const;

/**
 * Get all enhanced command names
 */
export function getEnhancedCommandNames(): string[] {
  return Object.keys(ENHANCED_COMMAND_FACTORIES);
}

/**
 * Create an enhanced command by name
 */
export function createEnhancedCommand(name: string): TypedCommandImplementation<any, any, TypedExecutionContext> | null {
  const factory = ENHANCED_COMMAND_FACTORIES[name as keyof typeof ENHANCED_COMMAND_FACTORIES];
  return factory ? factory() : null;
}

/**
 * Create all enhanced commands and return as a Map
 */
export function createAllEnhancedCommands(): Map<string, TypedCommandImplementation<any, any, TypedExecutionContext>> {
  const commands = new Map();
  
  for (const [name, factory] of Object.entries(ENHANCED_COMMAND_FACTORIES)) {
    commands.set(name, factory());
  }
  
  return commands;
}

/**
 * Command categories for organization
 */
export const ENHANCED_COMMAND_CATEGORIES = {
  data: ['increment', 'decrement', 'set', 'default'],
  creation: ['make'],
  content: ['append'],
  execution: ['call', 'get'],
  flow: ['if', 'halt', 'return', 'throw', 'repeat', 'unless', 'continue', 'break'],
  utility: ['pick'],
  advanced: ['tell', 'js', 'beep', 'async'],
  animation: ['settle', 'measure', 'transition'],
  templates: ['render'],
} as const;

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: keyof typeof ENHANCED_COMMAND_CATEGORIES): string[] {
  return ENHANCED_COMMAND_CATEGORIES[category] || [];
}

/**
 * Enhanced command metadata for documentation
 */
export interface CommandMetadata {
  name: string;
  description: string;
  examples: string[];
  syntax: string;
  category: string;
  version: string;
}

/**
 * Get metadata for all enhanced commands
 */
export function getAllCommandMetadata(): CommandMetadata[] {
  const metadata: CommandMetadata[] = [];
  
  for (const [name, factory] of Object.entries(ENHANCED_COMMAND_FACTORIES)) {
    const command = factory();
    metadata.push(command.metadata);
  }
  
  return metadata;
}

/**
 * Get metadata for a specific command
 */
export function getCommandMetadata(name: string): CommandMetadata | null {
  const command = createEnhancedCommand(name);
  return command ? command.metadata : null;
}