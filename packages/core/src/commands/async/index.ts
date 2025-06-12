/**
 * Async Commands Export Module
 * Provides asynchronous commands with event integration
 */

export { FetchCommand } from './fetch';
export type { FetchCommandOptions } from './fetch';

// Create instances with default options for easy access
export const asyncCommands = {
  fetch: new FetchCommand(),
} as const;