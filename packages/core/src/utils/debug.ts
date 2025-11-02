/**
 * Debug logging utility with environment-based control
 *
 * Usage:
 * - Browser: Set window.__HYPERFIXI_DEBUG__ = true in console, then reload
 * - Node.js: Set HYPERFIXI_DEBUG=true environment variable
 * - Build time: Dead code elimination removes all debug code in production
 *
 * @example
 * import { debug } from './utils/debug';
 * debug.command('SET command executing with:', input);
 * debug.event('pointerdown event fired on:', element);
 */

// Check both browser and Node.js environments
const isDebugEnabled =
  (typeof window !== 'undefined' && (window as any).__HYPERFIXI_DEBUG__) ||
  (typeof process !== 'undefined' && process.env?.HYPERFIXI_DEBUG === 'true');

/**
 * Debug flags for different subsystems
 * Set individual flags to false to disable specific debug categories
 */
export const DEBUG = {
  /** Command execution logs (🔧) */
  commands: isDebugEnabled,

  /** Event handler logs (🎯) */
  events: isDebugEnabled,

  /** Parser/tokenizer logs (📝) */
  parsing: isDebugEnabled,

  /** Expression evaluation logs (🔍) */
  expressions: isDebugEnabled,

  /** CSS/Style application logs (🎨) */
  styles: isDebugEnabled,

  /** Runtime internals (🚀) */
  runtime: isDebugEnabled,

  /** Repeat/loop command logs (🔁) */
  loops: isDebugEnabled,

  /** Wait/async command logs (⏳) */
  async: isDebugEnabled,
};

/**
 * Debug logging helpers with emoji prefixes
 * Only logs when corresponding DEBUG flag is enabled
 */
export const debug = {
  /** Log command execution details */
  command: (...args: any[]) => {
    if (DEBUG.commands) console.log('🔧', ...args);
  },

  /** Log event handler execution */
  event: (...args: any[]) => {
    if (DEBUG.events) console.log('🎯', ...args);
  },

  /** Log parsing operations */
  parse: (...args: any[]) => {
    if (DEBUG.parsing) console.log('📝', ...args);
  },

  /** Log expression evaluation */
  expr: (...args: any[]) => {
    if (DEBUG.expressions) console.log('🔍', ...args);
  },

  /** Log expression evaluation (alias for expr) */
  expressions: (...args: any[]) => {
    if (DEBUG.expressions) console.log('🔍', ...args);
  },

  /** Log CSS/style operations */
  style: (...args: any[]) => {
    if (DEBUG.styles) console.log('🎨', ...args);
  },

  /** Log runtime internals */
  runtime: (...args: any[]) => {
    if (DEBUG.runtime) console.log('🚀', ...args);
  },

  /** Log loop/repeat operations */
  loop: (...args: any[]) => {
    if (DEBUG.loops) console.log('🔁', ...args);
  },

  /** Log async/wait operations */
  async: (...args: any[]) => {
    if (DEBUG.async) console.log('⏳', ...args);
  },
};

/**
 * Group logging for hierarchical debug output
 */
export const debugGroup = {
  start: (label: string) => {
    if (isDebugEnabled) console.group(label);
  },

  end: () => {
    if (isDebugEnabled) console.groupEnd();
  },
};
