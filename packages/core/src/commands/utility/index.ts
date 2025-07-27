/**
 * Utility Commands Export Module
 * Provides all utility commands for hyperscript
 */

import { EnhancedPickCommand as PickCommand } from './enhanced-pick.js';

export { EnhancedPickCommand as PickCommand } from './enhanced-pick.js';

// Create instances with default options for easy access
export const utilityCommands = {
  pick: new PickCommand(),
} as const;