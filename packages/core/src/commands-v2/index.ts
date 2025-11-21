/**
 * Commands V2 - Enhanced with parseInput() for RuntimeBase
 *
 * This directory contains non-destructive wrappers for core commands,
 * adding parseInput() methods that enable tree-shakable RuntimeBase.
 *
 * These wrappers extend the original commands and move argument parsing
 * logic from Runtime to the commands themselves.
 */

// DOM Commands
export { HideCommand, createHideCommand } from './dom/hide';
export { ShowCommand, createShowCommand } from './dom/show';
export { AddCommand, createAddCommand } from './dom/add';
export { RemoveCommand, createRemoveCommand } from './dom/remove';
export { ToggleCommand, createToggleCommand } from './dom/toggle';

// Export raw input types for documentation
export type { HideCommandRawInput } from './dom/hide';
export type { ShowCommandRawInput } from './dom/show';
export type { AddCommandRawInput } from './dom/add';
export type { RemoveCommandRawInput } from './dom/remove';
export type { ToggleCommandRawInput } from './dom/toggle';
