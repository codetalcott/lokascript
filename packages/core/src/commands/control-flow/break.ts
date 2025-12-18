/**
 * BreakCommand - Decorated Implementation
 *
 * Exits from the current loop. Uses Stage 3 decorators.
 * Extends ControlFlowSignalBase for shared logic.
 *
 * Syntax: break
 */

import { command, meta, createFactory } from '../decorators';
import { ControlFlowSignalBase } from './signal-base';

// Re-export for backward compatibility
export interface BreakCommandInput {}
export interface BreakCommandOutput {
  broken: true;
  timestamp: number;
}

/**
 * BreakCommand - Exits from the current loop
 */
@meta({
  description: 'Exit from the current loop (repeat, for, while, until)',
  syntax: ['break'],
  examples: [
    'break',
    'if found then break',
    'repeat for item in items { if item == target then break }',
  ],
  sideEffects: ['control-flow'],
})
@command({ name: 'break', category: 'control-flow' })
export class BreakCommand extends ControlFlowSignalBase {
  protected readonly signalType = 'break' as const;
  protected readonly errorMessage = 'BREAK_LOOP';
  protected readonly errorFlag = 'isBreak';
}

export const createBreakCommand = createFactory(BreakCommand);
export default BreakCommand;
