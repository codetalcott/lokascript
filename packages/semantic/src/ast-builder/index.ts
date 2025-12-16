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
 * Event handler AST node
 */
export interface EventHandlerNode extends ASTNode {
  readonly type: 'eventHandler';
  readonly event: string;
  readonly events?: string[];
  readonly selector?: string;
  readonly condition?: ASTNode;
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
    const eventValue = node.roles.get('event');
    const event = eventValue?.type === 'literal'
      ? String(eventValue.value)
      : eventValue?.type === 'reference'
        ? eventValue.value
        : 'click'; // Default event

    // Build body commands recursively
    const commands = node.body.map(child => this.build(child));

    // Get selector from 'source' role if present
    const fromValue = node.roles.get('source');
    const selector = fromValue?.type === 'selector' ? fromValue.value : null;

    const result: EventHandlerNode = {
      type: 'eventHandler',
      event,
      commands,
    };

    // Only add selector if present (avoid exactOptionalPropertyTypes issue)
    if (selector) {
      return { ...result, selector };
    }

    return result;
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
   * Returns the first command wrapped appropriately.
   */
  private buildCompound(node: CompoundSemanticNode): ASTNode {
    // Build all statements
    const statements = node.statements.map(child => this.build(child));

    // For now, return the first statement
    // TODO: Handle compound statements properly (then chains, etc.)
    if (statements.length === 1) {
      return statements[0];
    }

    // Multiple statements: wrap in a compound node
    return {
      type: 'compound',
      statements,
      chainType: node.chainType,
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
