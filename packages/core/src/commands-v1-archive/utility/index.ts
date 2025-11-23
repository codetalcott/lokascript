/**
 * Utility Commands Export Module
 * Provides all utility commands for hyperscript
 */

import { PickCommand as PickCommand } from './pick';
import { CopyCommand } from './copy';

export { PickCommand as PickCommand } from './pick';
export { CopyCommand, createCopyCommand, enhancedCopyCommand } from './copy';

// Create instances with default options for easy access
export const utilityCommands = {
  pick: new PickCommand(),
  copy: new CopyCommand(),
} as const;
