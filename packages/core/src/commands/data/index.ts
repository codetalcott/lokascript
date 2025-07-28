/**
 * Data Commands Export Module
 * Provides all data manipulation commands for hyperscript
 */

import { EnhancedSetCommand } from './enhanced-set';
import { EnhancedDefaultCommand } from './enhanced-default';
import { EnhancedIncrementCommand } from './enhanced-increment';
import { EnhancedDecrementCommand } from './enhanced-decrement';

export { EnhancedSetCommand as SetCommand } from './enhanced-set';
export { EnhancedDefaultCommand as DefaultCommand } from './enhanced-default';
export { EnhancedIncrementCommand as IncrementCommand } from './enhanced-increment';
export { EnhancedDecrementCommand as DecrementCommand } from './enhanced-decrement';

// Create instances with default options for easy access
export const dataCommands = {
  set: new EnhancedSetCommand(),
  default: new EnhancedDefaultCommand(),
  increment: new EnhancedIncrementCommand(),
  decrement: new EnhancedDecrementCommand(),
} as const;