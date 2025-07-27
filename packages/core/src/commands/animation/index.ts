/**
 * Animation Commands Export Module
 * Provides all animation commands for hyperscript
 */

import { EnhancedMeasureCommand } from './enhanced-measure.js';
import { EnhancedSettleCommand } from './enhanced-settle.js';
import { EnhancedTakeCommand } from './enhanced-take.js';
import { EnhancedTransitionCommand } from './enhanced-transition.js';

export { EnhancedMeasureCommand as MeasureCommand } from './enhanced-measure.js';
export { EnhancedSettleCommand as SettleCommand } from './enhanced-settle.js';
export { EnhancedTakeCommand as TakeCommand } from './enhanced-take.js';
export { EnhancedTransitionCommand as TransitionCommand } from './enhanced-transition.js';

// Create instances with default options for easy access
export const animationCommands = {
  measure: new EnhancedMeasureCommand(),
  settle: new EnhancedSettleCommand(),
  take: new EnhancedTakeCommand(),
  transition: new EnhancedTransitionCommand(),
} as const;