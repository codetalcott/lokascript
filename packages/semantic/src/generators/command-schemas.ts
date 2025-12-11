/**
 * Command Schemas
 *
 * Defines the semantic structure of each hyperscript command.
 * Used by the pattern generator to create language-specific patterns.
 */

import type { SemanticRole, ActionType, SemanticValue } from '../types';

// =============================================================================
// Command Schema Types
// =============================================================================

/**
 * A role specification in a command schema.
 */
export interface RoleSpec {
  /** The semantic role */
  readonly role: SemanticRole;
  /** Description of what this role represents */
  readonly description: string;
  /** Whether this role is required */
  readonly required: boolean;
  /** Expected value types */
  readonly expectedTypes: Array<'selector' | 'literal' | 'reference' | 'expression'>;
  /** Default value if not provided */
  readonly default?: SemanticValue;
  /** Position hint for SVO languages (higher = earlier) */
  readonly svoPosition?: number;
  /** Position hint for SOV languages (higher = earlier) */
  readonly sovPosition?: number;
}

/**
 * A command schema defines the semantic structure of a command.
 */
export interface CommandSchema {
  /** The action type (command name) */
  readonly action: ActionType;
  /** Human-readable description */
  readonly description: string;
  /** Roles this command accepts */
  readonly roles: RoleSpec[];
  /** The primary role (what the command acts on) */
  readonly primaryRole: SemanticRole;
  /** Category for grouping */
  readonly category: CommandCategory;
  /** Whether this command typically has a body (like event handlers) */
  readonly hasBody?: boolean;
  /** Notes about special handling */
  readonly notes?: string;
}

/**
 * Command categories for organization.
 */
export type CommandCategory =
  | 'dom-class'      // Class/attribute manipulation
  | 'dom-content'    // Content manipulation
  | 'dom-visibility' // Show/hide
  | 'variable'       // Variable operations
  | 'event'          // Event handling
  | 'async'          // Async operations
  | 'navigation'     // URL/navigation
  | 'control-flow';  // Control flow

// =============================================================================
// Command Schema Definitions
// =============================================================================

/**
 * Toggle command: adds class/attribute if absent, removes if present.
 *
 * Patterns:
 * - EN: toggle .active on #button
 * - JA: #button の .active を 切り替え
 * - AR: بدّل .active على #button
 */
export const toggleSchema: CommandSchema = {
  action: 'toggle',
  description: 'Toggle a class or attribute on/off',
  category: 'dom-class',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The class or attribute to toggle',
      required: true,
      expectedTypes: ['selector'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'destination',
      description: 'The target element (defaults to me)',
      required: false,
      expectedTypes: ['selector', 'reference'],
      default: { type: 'reference', value: 'me' },
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

/**
 * Add command: adds a class or attribute.
 */
export const addSchema: CommandSchema = {
  action: 'add',
  description: 'Add a class or attribute to an element',
  category: 'dom-class',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The class or attribute to add',
      required: true,
      expectedTypes: ['selector'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'destination',
      description: 'The target element (defaults to me)',
      required: false,
      expectedTypes: ['selector', 'reference'],
      default: { type: 'reference', value: 'me' },
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

/**
 * Remove command: removes a class or attribute.
 */
export const removeSchema: CommandSchema = {
  action: 'remove',
  description: 'Remove a class or attribute from an element',
  category: 'dom-class',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The class or attribute to remove',
      required: true,
      expectedTypes: ['selector'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'source',
      description: 'The element to remove from (defaults to me)',
      required: false,
      expectedTypes: ['selector', 'reference'],
      default: { type: 'reference', value: 'me' },
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

/**
 * Put command: puts content into a target.
 *
 * Patterns:
 * - EN: put "hello" into #output
 * - JA: #output に "hello" を 置く
 * - AR: ضع "hello" في #output
 */
export const putSchema: CommandSchema = {
  action: 'put',
  description: 'Put content into a target element or variable',
  category: 'dom-content',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The content to put',
      required: true,
      expectedTypes: ['literal', 'selector', 'reference', 'expression'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'destination',
      description: 'Where to put the content',
      required: true,
      expectedTypes: ['selector', 'reference'],
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

/**
 * Set command: sets a property or variable.
 */
export const setSchema: CommandSchema = {
  action: 'set',
  description: 'Set a property or variable to a value',
  category: 'variable',
  primaryRole: 'destination',
  roles: [
    {
      role: 'destination',
      description: 'The property or variable to set',
      required: true,
      expectedTypes: ['selector', 'reference'],
      svoPosition: 1,
      sovPosition: 1,
    },
    {
      role: 'patient',
      description: 'The value to set',
      required: true,
      expectedTypes: ['literal', 'expression', 'reference'],
      svoPosition: 2,
      sovPosition: 2,
    },
  ],
};

/**
 * Show command: makes an element visible.
 */
export const showSchema: CommandSchema = {
  action: 'show',
  description: 'Make an element visible',
  category: 'dom-visibility',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The element to show',
      required: false,
      expectedTypes: ['selector', 'reference'],
      default: { type: 'reference', value: 'me' },
      svoPosition: 1,
      sovPosition: 1,
    },
    {
      role: 'manner',
      description: 'How to show (transition)',
      required: false,
      expectedTypes: ['literal'],
      svoPosition: 2,
      sovPosition: 2,
    },
  ],
};

/**
 * Hide command: makes an element invisible.
 */
export const hideSchema: CommandSchema = {
  action: 'hide',
  description: 'Make an element invisible',
  category: 'dom-visibility',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The element to hide',
      required: false,
      expectedTypes: ['selector', 'reference'],
      default: { type: 'reference', value: 'me' },
      svoPosition: 1,
      sovPosition: 1,
    },
    {
      role: 'manner',
      description: 'How to hide (transition)',
      required: false,
      expectedTypes: ['literal'],
      svoPosition: 2,
      sovPosition: 2,
    },
  ],
};

/**
 * On command: event handler.
 */
export const onSchema: CommandSchema = {
  action: 'on',
  description: 'Handle an event',
  category: 'event',
  primaryRole: 'event',
  hasBody: true,
  roles: [
    {
      role: 'event',
      description: 'The event to handle',
      required: true,
      expectedTypes: ['literal'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'source',
      description: 'The element to listen on (defaults to me)',
      required: false,
      expectedTypes: ['selector', 'reference'],
      default: { type: 'reference', value: 'me' },
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

/**
 * Trigger command: dispatches an event.
 */
export const triggerSchema: CommandSchema = {
  action: 'trigger',
  description: 'Trigger/dispatch an event',
  category: 'event',
  primaryRole: 'event',
  roles: [
    {
      role: 'event',
      description: 'The event to trigger',
      required: true,
      expectedTypes: ['literal'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'destination',
      description: 'The target element (defaults to me)',
      required: false,
      expectedTypes: ['selector', 'reference'],
      default: { type: 'reference', value: 'me' },
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

/**
 * Wait command: pauses execution.
 */
export const waitSchema: CommandSchema = {
  action: 'wait',
  description: 'Wait for a duration or event',
  category: 'async',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'Duration or event to wait for',
      required: true,
      expectedTypes: ['literal', 'expression'],
      svoPosition: 1,
      sovPosition: 1,
    },
  ],
};

/**
 * Fetch command: makes HTTP request.
 */
export const fetchSchema: CommandSchema = {
  action: 'fetch',
  description: 'Fetch data from a URL',
  category: 'async',
  primaryRole: 'source',
  roles: [
    {
      role: 'source',
      description: 'The URL to fetch from',
      required: true,
      expectedTypes: ['literal', 'expression'],
      svoPosition: 1,
      sovPosition: 1,
    },
    {
      role: 'manner',
      description: 'HTTP method and options',
      required: false,
      expectedTypes: ['literal'],
      svoPosition: 2,
      sovPosition: 2,
    },
  ],
};

/**
 * Increment command: increases a numeric value.
 */
export const incrementSchema: CommandSchema = {
  action: 'increment',
  description: 'Increment a numeric value',
  category: 'variable',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The value to increment',
      required: true,
      expectedTypes: ['selector', 'reference'],
      svoPosition: 1,
      sovPosition: 1,
    },
    {
      role: 'quantity',
      description: 'Amount to increment by (defaults to 1)',
      required: false,
      expectedTypes: ['literal'],
      default: { type: 'literal', value: 1, dataType: 'number' },
      svoPosition: 2,
      sovPosition: 2,
    },
  ],
};

/**
 * Decrement command: decreases a numeric value.
 */
export const decrementSchema: CommandSchema = {
  action: 'decrement',
  description: 'Decrement a numeric value',
  category: 'variable',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The value to decrement',
      required: true,
      expectedTypes: ['selector', 'reference'],
      svoPosition: 1,
      sovPosition: 1,
    },
    {
      role: 'quantity',
      description: 'Amount to decrement by (defaults to 1)',
      required: false,
      expectedTypes: ['literal'],
      default: { type: 'literal', value: 1, dataType: 'number' },
      svoPosition: 2,
      sovPosition: 2,
    },
  ],
};

/**
 * Append command: appends content to an element.
 */
export const appendSchema: CommandSchema = {
  action: 'append',
  description: 'Append content to an element',
  category: 'dom-content',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The content to append',
      required: true,
      expectedTypes: ['literal', 'selector', 'expression'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'destination',
      description: 'The element to append to',
      required: true,
      expectedTypes: ['selector', 'reference'],
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

/**
 * Prepend command: prepends content to an element.
 */
export const prependSchema: CommandSchema = {
  action: 'prepend',
  description: 'Prepend content to an element',
  category: 'dom-content',
  primaryRole: 'patient',
  roles: [
    {
      role: 'patient',
      description: 'The content to prepend',
      required: true,
      expectedTypes: ['literal', 'selector', 'expression'],
      svoPosition: 1,
      sovPosition: 2,
    },
    {
      role: 'destination',
      description: 'The element to prepend to',
      required: true,
      expectedTypes: ['selector', 'reference'],
      svoPosition: 2,
      sovPosition: 1,
    },
  ],
};

// =============================================================================
// Schema Registry
// =============================================================================

/**
 * All available command schemas.
 */
export const commandSchemas: Record<ActionType, CommandSchema> = {
  toggle: toggleSchema,
  add: addSchema,
  remove: removeSchema,
  put: putSchema,
  set: setSchema,
  show: showSchema,
  hide: hideSchema,
  on: onSchema,
  trigger: triggerSchema,
  wait: waitSchema,
  fetch: fetchSchema,
  increment: incrementSchema,
  decrement: decrementSchema,
  append: appendSchema,
  prepend: prependSchema,
  // Placeholders for commands not yet defined
  get: { action: 'get', description: 'Get a value', category: 'variable', primaryRole: 'patient', roles: [] },
  take: { action: 'take', description: 'Take a value', category: 'dom-content', primaryRole: 'patient', roles: [] },
  send: { action: 'send', description: 'Send an event', category: 'event', primaryRole: 'event', roles: [] },
  go: { action: 'go', description: 'Navigate to URL', category: 'navigation', primaryRole: 'destination', roles: [] },
  if: { action: 'if', description: 'Conditional', category: 'control-flow', primaryRole: 'condition', roles: [] },
  repeat: { action: 'repeat', description: 'Loop', category: 'control-flow', primaryRole: 'quantity', roles: [] },
  call: { action: 'call', description: 'Call a function', category: 'control-flow', primaryRole: 'patient', roles: [] },
  return: { action: 'return', description: 'Return a value', category: 'control-flow', primaryRole: 'patient', roles: [] },
  log: { action: 'log', description: 'Log to console', category: 'variable', primaryRole: 'patient', roles: [] },
};

/**
 * Get a command schema by action type.
 */
export function getSchema(action: ActionType): CommandSchema | undefined {
  return commandSchemas[action];
}

/**
 * Get all schemas for a category.
 */
export function getSchemasByCategory(category: CommandCategory): CommandSchema[] {
  return Object.values(commandSchemas).filter(s => s.category === category);
}

/**
 * Get all fully-defined schemas (with roles).
 */
export function getDefinedSchemas(): CommandSchema[] {
  return Object.values(commandSchemas).filter(s => s.roles.length > 0);
}
