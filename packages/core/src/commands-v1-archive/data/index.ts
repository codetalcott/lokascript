/**
 * Data Commands Export Module
 * Provides all data manipulation commands for hyperscript
 */

import { SetCommand } from './set';
import { DefaultCommand } from './default';
import { IncrementCommand } from './increment';
import { DecrementCommand } from './decrement';
import { PersistCommand } from './persist';
import { BindCommand } from './bind';

export { SetCommand as SetCommand } from './set';
export { DefaultCommand as DefaultCommand } from './default';
export { IncrementCommand as IncrementCommand } from './increment';
export { DecrementCommand as DecrementCommand } from './decrement';
export { PersistCommand, createPersistCommand, enhancedPersistCommand } from './persist';
export { BindCommand, createBindCommand, enhancedBindCommand, unbind, unbindVariable, getActiveBindings } from './bind';

// Create instances with default options for easy access
export const dataCommands = {
  set: new SetCommand(),
  default: new DefaultCommand(),
  increment: new IncrementCommand(),
  decrement: new DecrementCommand(),
  persist: new PersistCommand(),
  bind: new BindCommand(),
} as const;
