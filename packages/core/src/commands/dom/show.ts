/**
 * ShowCommand - Decorated Implementation
 *
 * Shows HTML elements by restoring display property. Uses Stage 3 decorators.
 * Extends VisibilityCommandBase for shared logic with HideCommand.
 *
 * Syntax:
 *   show                    # Show current element (me)
 *   show <target>           # Show specified element(s)
 */

import type { TypedExecutionContext } from '../../types/core';
import { command, meta, createFactory } from '../decorators';
import { isHTMLElement } from '../../utils/element-check';
import { VisibilityCommandBase, type VisibilityCommandInput } from './visibility-base';

// Re-export for backward compatibility
export interface ShowCommandInput extends VisibilityCommandInput {
  defaultDisplay: string;
}

/**
 * ShowCommand - Restores element visibility
 */
@meta({
  description: 'Show elements by restoring display property',
  syntax: 'show [<target>]',
  examples: ['show me', 'show #modal', 'show .hidden', 'show <button/>'],
  sideEffects: ['dom-mutation'],
})
@command({ name: 'show', category: 'dom' })
export class ShowCommand extends VisibilityCommandBase {
  protected readonly mode = 'show' as const;

  async execute(input: VisibilityCommandInput, _context: TypedExecutionContext): Promise<void> {
    const defaultDisplay = input.defaultDisplay || 'block';
    for (const element of input.targets) {
      this.showElement(element, defaultDisplay);
    }
  }

  // Override for backward compatibility - mode is optional for show
  validate(input: unknown): input is ShowCommandInput {
    if (typeof input !== 'object' || input === null) return false;
    const typed = input as Partial<ShowCommandInput>;
    if (!Array.isArray(typed.targets)) return false;
    if (!typed.targets.every(t => isHTMLElement(t))) return false;
    if (typeof typed.defaultDisplay !== 'string') return false;
    return true;
  }
}

export const createShowCommand = createFactory(ShowCommand);
export default ShowCommand;
