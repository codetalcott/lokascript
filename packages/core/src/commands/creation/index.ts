/**
 * Creation Commands Export Module
 * Provides all creation commands for hyperscript
 */

import { EnhancedMakeCommand } from './enhanced-make.js';

export { EnhancedMakeCommand as MakeCommand } from './enhanced-make.js';

// Create instances with default options for easy access
export const creationCommands = {
  make: new EnhancedMakeCommand(),
} as const;