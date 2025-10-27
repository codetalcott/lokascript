/**
 * Execution Commands Export Module
 * Provides all execution commands for hyperscript
 */

import { CallCommand } from './call';

export { CallCommand as CallCommand } from './call';

// Create instances with default options for easy access
export const executionCommands = {
  call: new CallCommand(),
} as const;