/**
 * ExitCommand - Decorated Implementation
 *
 * Exits early from an event handler or behavior without returning a value.
 * Uses Stage 3 decorators. Extends ControlFlowSignalBase for shared logic.
 *
 * Syntax:
 *   exit
 */

import { command, meta, createFactory } from '../decorators';
import { ControlFlowSignalBase } from './signal-base';

/**
 * Typed input for ExitCommand
 */
export interface ExitCommandInput {}

/**
 * Output from Exit command execution
 */
export interface ExitCommandOutput {
  exited: boolean;
  timestamp: number;
}

/**
 * ExitCommand - Exits from event handler
 */
@meta({
  description: 'Immediately terminate execution of the current event handler or behavior',
  syntax: ['exit'],
  examples: ['exit', 'if no draggedItem exit', 'on click if disabled exit'],
  sideEffects: ['control-flow'],
})
@command({ name: 'exit', category: 'control-flow' })
export class ExitCommand extends ControlFlowSignalBase {
  protected readonly signalType = 'exit' as const;
  protected readonly errorMessage = 'EXIT_COMMAND';
  protected readonly errorFlag = 'isExit';
}

export const createExitCommand = createFactory(ExitCommand);
export default ExitCommand;
