/**
 * Advanced Commands Export Module
 * Provides advanced hyperscript commands for complex interactions
 */

import { TellCommand } from './tell';
import { AsyncCommand } from './async';
import { BeepCommand } from './beep';
import { JSCommand } from './js';

export { TellCommand } from './tell';
export { AsyncCommand } from './async';
export { BeepCommand } from './beep';
export { JSCommand } from './js';

// Create instances with default options for easy access
export const advancedCommands = {
  tell: new TellCommand(),
  async: new AsyncCommand(),
  beep: new BeepCommand(),
  js: new JSCommand(),
} as const;