/**
 * Semantic to AST Builder
 *
 * Converts SemanticNodes directly to AST nodes, bypassing the English text
 * generation and re-parsing step.
 *
 * Flow:
 *   Japanese → Semantic Parser → SemanticNode → AST Builder → AST
 *
 * Instead of:
 *   Japanese → Semantic Parser → SemanticNode → English Text → Parser → AST
 */

import type {
  SemanticNode,
  CommandSemanticNode,
  EventHandlerSemanticNode,
  ConditionalSemanticNode,
  CompoundSemanticNode,
} from '../types';

import type { SemanticRole } from '@hyperfixi/i18n/src/grammar/types';

import { convertValue } from './value-converters';
import { getCommandMapper } from './command-mappers';
import type { ExpressionNode } from '@hyperfixi/expression-parser';

// =============================================================================
// AST Types (compatible with @hyperfixi/core)
// =============================================================================

/**
 * Base AST node interface
 */
export interface ASTNode {
  readonly type: string;
  readonly start?: number;
  readonly end?: number;
  readonly line?: number;
  readonly column?: number;
  [key: string]: unknown;
}

/**
 * Command AST node
 */
export interface CommandNode extends ASTNode {
  readonly type: 'command';
  readonly name: string;
  readonly args: ExpressionNode[];
  readonly modifiers?: Record<string, ExpressionNode>;
  readonly isBlocking?: boolean;
  readonly implicitTarget?: ExpressionNode;
}

/**
 * Event handler AST node (compatible with @hyperfixi/core)
 */
export interface EventHandlerNode extends ASTNode {
  readonly type: 'eventHandler';
  /** Primary event name */
  readonly event: string;
  /** All event names when using "on event1 or event2" syntax */
  readonly events?: string[];
  /** CSS selector for event delegation ("from" keyword) */
  readonly selector?: string;
  /** Target for "from" clause (as string or expression) */
  readonly target?: string;
  /** Optional event condition ("[condition]" syntax) */
  readonly condition?: ASTNode;
  /** Attribute name for mutation events ("of @attribute" syntax) */
  readonly attributeName?: string;
  /** Target element to watch for changes ("in <target>" syntax) */
  readonly watchTarget?: ExpressionNode;
  /** Event parameter names to destructure (e.g., ['clientX', 'clientY']) */
  readonly args?: string[];
  /** Event parameters (alias for args) */
  readonly params?: string[];
  /** Handler commands */
  readonly commands: ASTNode[];
}

/**
 * Conditional AST node (if/else)
 */
export interface ConditionalNode extends ASTNode {
  readonly type: 'if';
  readonly condition: ExpressionNode;
  readonly thenBranch: ASTNode[];
  readonly elseBranch?: ASTNode[];
}

/**
 * Compound statement node (command chains)
 */
export interface CompoundNode extends ASTNode {
  readonly type: 'compound';
  /** Chain type: 'then' for sequential, 'and' for parallel-like, 'async' for async */
  readonly chainType: 'then' | 'and' | 'async';
  /** Statements in the compound */
  readonly statements: ASTNode[];
}

/**
 * Block node (for grouping commands)
 */
export interface BlockNode extends ASTNode {
  readonly type: 'block';
  readonly commands: ASTNode[];
}

// =============================================================================
// AST Builder
// =============================================================================

export interface ASTBuilderOptions {
  /**
   * Fallback function to parse complex expressions that can't be handled
   * directly by the AST builder. Uses the expression-parser by default.
   */
  parseExpression?: (input: string) => ExpressionNode | null;
}

/**
 * Builds AST nodes directly from SemanticNodes.
 */
export class ASTBuilder {
  constructor(_options: ASTBuilderOptions = {}) {
    // Options reserved for future use (e.g., custom expression parser)
  }

  /**
   * Build an AST from a SemanticNode.
   *
   * @param node - The semantic node to convert
   * @returns The corresponding AST node
   */
  build(node: SemanticNode): ASTNode {
    switch (node.kind) {
      case 'command':
        return this.buildCommand(node as CommandSemanticNode);
      case 'event-handler':
        return this.buildEventHandler(node as EventHandlerSemanticNode);
      case 'conditional':
        return this.buildConditional(node as ConditionalSemanticNode);
      case 'compound':
        return this.buildCompound(node as CompoundSemanticNode);
      default:
        throw new Error(`Unknown semantic node kind: ${(node as SemanticNode).kind}`);
    }
  }

  /**
   * Build a CommandNode from a CommandSemanticNode.
   */
  private buildCommand(node: CommandSemanticNode): CommandNode {
    const mapper = getCommandMapper(node.action);

    if (mapper) {
      // Use command-specific mapper
      return mapper.toAST(node, this);
    }

    // Fallback: generic command mapping
    return this.buildGenericCommand(node);
  }

  /**
   * Generic command builder when no specific mapper is available.
   * Maps roles to args in a predictable order.
   */
  private buildGenericCommand(node: CommandSemanticNode): CommandNode {
    const args: ExpressionNode[] = [];
    const modifiers: Record<string, ExpressionNode> = {};

    // Standard role-to-position mapping
    // Note: Using only valid SemanticRoles from the type definition
    const argRoles: SemanticRole[] = ['patient', 'source', 'quantity'];
    const modifierRoles: SemanticRole[] = ['destination', 'duration', 'method', 'style'];

    // Convert argument roles
    for (const role of argRoles) {
      const value = node.roles.get(role);
      if (value) {
        args.push(convertValue(value));
      }
    }

    // Convert modifier roles
    for (const role of modifierRoles) {
      const value = node.roles.get(role);
      if (value) {
        // Map semantic roles to hyperscript modifier keywords
        const modifierKey = this.roleToModifierKey(role);
        modifiers[modifierKey] = convertValue(value);
      }
    }

    const result: CommandNode = {
      type: 'command',
      name: node.action,
      args,
    };

    // Only add modifiers if there are any (avoid exactOptionalPropertyTypes issue)
    if (Object.keys(modifiers).length > 0) {
      return { ...result, modifiers };
    }

    return result;
  }

  /**
   * Map semantic roles to hyperscript modifier keywords.
   */
  private roleToModifierKey(role: SemanticRole): string {
    const mapping: Partial<Record<SemanticRole, string>> = {
      destination: 'on',
      duration: 'for',
      source: 'from',
      condition: 'if',
      method: 'via',
      style: 'with',
    };
    return mapping[role] ?? role;
  }

  /**
   * Build an EventHandlerNode from an EventHandlerSemanticNode.
   */
  private buildEventHandler(node: EventHandlerSemanticNode): EventHandlerNode {
    // Extract event name(s)
    const eventValue = node.roles.get('event');
    let event: string;
    let events: string[] | undefined;

    if (eventValue?.type === 'literal') {
      const eventStr = String(eventValue.value);
      // Handle "click or keydown" syntax
      if (eventStr.includes('|') || eventStr.includes(' or ')) {
        events = eventStr.split(/\s+or\s+|\|/).map(e => e.trim());
        event = events[0];
      } else {
        event = eventStr;
      }
    } else if (eventValue?.type === 'reference') {
      event = eventValue.value;
    } else {
      event = 'click'; // Default event
    }

    // Build body commands recursively
    const commands = node.body.map(child => this.build(child));

    // Get selector/target from 'source' role if present
    const fromValue = node.roles.get('source');
    let selector: string | undefined;
    let target: string | undefined;

    if (fromValue?.type === 'selector') {
      selector = fromValue.value;
      target = fromValue.value;
    } else if (fromValue?.type === 'reference') {
      target = fromValue.value;
    } else if (fromValue?.type === 'literal') {
      target = String(fromValue.value);
    }

    // Get condition from 'condition' role if present
    const conditionValue = node.roles.get('condition');
    const condition = conditionValue ? convertValue(conditionValue) : undefined;

    // Get destination (watchTarget) if present
    const destinationValue = node.roles.get('destination');
    const watchTarget = destinationValue ? convertValue(destinationValue) : undefined;

    // Extract event modifiers
    const modifiers = node.eventModifiers;

    // Handle queue modifier (debounce, throttle, etc. are runtime concerns)
    let finalSelector = selector;
    if (modifiers?.from) {
      const fromMod = modifiers.from;
      if (fromMod.type === 'selector' && !selector) {
        finalSelector = fromMod.value;
      }
    }

    // Build result with spread for optional properties (exactOptionalPropertyTypes compliant)
    return {
      type: 'eventHandler' as const,
      event,
      commands,
      ...(events && events.length > 1 ? { events } : {}),
      ...(finalSelector ? { selector: finalSelector } : {}),
      ...(target ? { target } : {}),
      ...(condition ? { condition: condition as ASTNode } : {}),
      ...(watchTarget ? { watchTarget } : {}),
    };
  }

  /**
   * Build a ConditionalNode from a ConditionalSemanticNode.
   */
  private buildConditional(node: ConditionalSemanticNode): ConditionalNode {
    const conditionValue = node.roles.get('condition');
    if (!conditionValue) {
      throw new Error('Conditional node missing condition');
    }

    const condition = convertValue(conditionValue);
    const thenBranch = node.thenBranch.map(child => this.build(child));
    const elseBranch = node.elseBranch?.map(child => this.build(child));

    const result: ConditionalNode = {
      type: 'if',
      condition,
      thenBranch,
    };

    // Only add elseBranch if present (avoid exactOptionalPropertyTypes issue)
    if (elseBranch && elseBranch.length > 0) {
      return { ...result, elseBranch };
    }

    return result;
  }

  /**
   * Build AST nodes from a CompoundSemanticNode.
   *
   * Handles different chain types:
   * - 'then': Sequential execution (default for hyperscript)
   * - 'and': Parallel-like execution (both actions happen)
   * - 'async': Async execution (commands run asynchronously)
   */
  private buildCompound(node: CompoundSemanticNode): ASTNode {
    // Build all statements recursively
    const statements = node.statements.map(child => this.build(child));

    // Single statement: unwrap and return directly
    if (statements.length === 1) {
      return statements[0];
    }

    // Empty: return a no-op block
    if (statements.length === 0) {
      return {
        type: 'block',
        commands: [],
      };
    }

    // For 'then' chains, we can either:
    // 1. Return a compound node (for explicit chain handling)
    // 2. Attach 'next' pointers to create linked commands (like core parser)
    //
    // We use option 1 for now as it's more explicit and easier to process
    const result: CompoundNode = {
      type: 'compound',
      chainType: node.chainType,
      statements,
    };

    return result;
  }

  /**
   * Build a BlockNode from an array of semantic nodes.
   * Useful for grouping commands in if/else branches.
   */
  buildBlock(nodes: SemanticNode[]): BlockNode {
    const commands = nodes.map(child => this.build(child));
    return {
      type: 'block',
      commands,
    };
  }
}

// =============================================================================
// Convenience Function
// =============================================================================

/**
 * Build an AST from a SemanticNode using default options.
 *
 * @param node - The semantic node to convert
 * @returns The corresponding AST node
 */
export function buildAST(node: SemanticNode): ASTNode {
  const builder = new ASTBuilder();
  return builder.build(node);
}

// Re-exports from value-converters
export {
  convertValue,
  convertLiteral,
  convertSelector,
  convertReference,
  convertPropertyPath,
  convertExpression,
} from './value-converters';

// Re-exports from command-mappers
export {
  getCommandMapper,
  registerCommandMapper,
  getRegisteredMappers,
  type CommandMapper,
} from './command-mappers';
