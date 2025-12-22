/**
 * AST Serializer - Binary format wrapper for HyperFixi AST nodes
 *
 * Provides a convenient API for serializing and accessing HyperFixi AST
 * nodes using the binary tree format. Optimized for common access patterns
 * like checking node type and name without full deserialization.
 */

import type { ASTNode } from '../../types/base-types';
import { BinaryTree, getString, getNumber, getBoolean, get, has, getType } from './index';

// =============================================================================
// BinaryAST Class
// =============================================================================

/**
 * Wrapper class for binary-serialized AST nodes.
 *
 * Provides zero-copy access to common AST fields without deserializing
 * the entire structure.
 *
 * @example
 * ```typescript
 * const ast = compile('toggle .active').ast;
 * const binary = new BinaryAST(ast);
 *
 * // Zero-copy access to fields
 * console.log(binary.getNodeType()); // 'command'
 * console.log(binary.getName());     // 'toggle'
 *
 * // Transfer to worker
 * worker.postMessage(binary.getBuffer(), [binary.getBuffer()]);
 * ```
 */
export class BinaryAST {
  private buffer: ArrayBuffer;

  /**
   * Creates a BinaryAST by serializing an AST node.
   */
  constructor(ast: ASTNode) {
    this.buffer = BinaryTree.serialize(ast);
  }

  // ===========================================================================
  // Common AST Field Accessors (Zero-Copy)
  // ===========================================================================

  /**
   * Gets the node type (e.g., 'command', 'expression', 'feature').
   */
  getNodeType(): string {
    return getString(this.buffer, ['type']) ?? '';
  }

  /**
   * Gets the command/feature name (e.g., 'toggle', 'add', 'on').
   */
  getName(): string | null {
    return getString(this.buffer, ['name']);
  }

  /**
   * Checks if the command is blocking.
   */
  isBlocking(): boolean {
    return getBoolean(this.buffer, ['isBlocking']) ?? false;
  }

  /**
   * Gets the line number of the node (if available).
   */
  getLine(): number | null {
    return getNumber(this.buffer, ['line']);
  }

  /**
   * Gets the column number of the node (if available).
   */
  getColumn(): number | null {
    return getNumber(this.buffer, ['column']);
  }

  /**
   * Gets the raw source text (if available).
   */
  getRaw(): string | null {
    return getString(this.buffer, ['raw']);
  }

  // ===========================================================================
  // Path-Based Access
  // ===========================================================================

  /**
   * Gets any value at the specified path.
   */
  get(path: string[]): unknown {
    return get(this.buffer, path);
  }

  /**
   * Gets a string value at the specified path.
   */
  getString(path: string[]): string | null {
    return getString(this.buffer, path);
  }

  /**
   * Gets a number value at the specified path.
   */
  getNumber(path: string[]): number | null {
    return getNumber(this.buffer, path);
  }

  /**
   * Gets a boolean value at the specified path.
   */
  getBoolean(path: string[]): boolean | null {
    return getBoolean(this.buffer, path);
  }

  /**
   * Checks if a path exists.
   */
  has(path: string[]): boolean {
    return has(this.buffer, path);
  }

  /**
   * Gets the type of value at the specified path.
   */
  getType(path: string[]): string | null {
    return getType(this.buffer, path);
  }

  // ===========================================================================
  // Deserialization
  // ===========================================================================

  /**
   * Fully deserializes the buffer back to an AST node.
   * Use this when you need the complete structure.
   */
  toAST(): ASTNode {
    return BinaryTree.deserialize(this.buffer) as ASTNode;
  }

  // ===========================================================================
  // Buffer Access (for transfer)
  // ===========================================================================

  /**
   * Gets the underlying ArrayBuffer for transfer to workers.
   *
   * Note: After transferring, this BinaryAST instance becomes invalid.
   *
   * @example
   * ```typescript
   * const buffer = binary.getBuffer();
   * worker.postMessage(buffer, [buffer]);
   * ```
   */
  getBuffer(): ArrayBuffer {
    return this.buffer;
  }

  /**
   * Gets the size of the serialized buffer in bytes.
   */
  getByteLength(): number {
    return this.buffer.byteLength;
  }

  // ===========================================================================
  // Static Factory Methods
  // ===========================================================================

  /**
   * Creates a BinaryAST from a received ArrayBuffer.
   * Use this after receiving a buffer from a worker.
   */
  static fromBuffer(buffer: ArrayBuffer): BinaryAST {
    const instance = Object.create(BinaryAST.prototype) as BinaryAST;
    instance.buffer = buffer;
    return instance;
  }

  /**
   * Creates a copy of a BinaryAST with its own buffer.
   * Use this if you need to transfer the original and keep a copy.
   */
  clone(): BinaryAST {
    const copy = this.buffer.slice(0);
    return BinaryAST.fromBuffer(copy);
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Checks if a value is a command node by examining its type field.
 */
export function isCommandNode(buffer: ArrayBuffer): boolean {
  return getString(buffer, ['type']) === 'command';
}

/**
 * Checks if a value is an expression node.
 */
export function isExpressionNode(buffer: ArrayBuffer): boolean {
  const type = getString(buffer, ['type']);
  return (
    type === 'identifier' ||
    type === 'literal' ||
    type === 'binary' ||
    type === 'unary' ||
    type === 'call' ||
    type === 'member' ||
    type === 'selector'
  );
}

/**
 * Gets the command name from a serialized buffer.
 */
export function getCommandName(buffer: ArrayBuffer): string | null {
  if (!isCommandNode(buffer)) {
    return null;
  }
  return getString(buffer, ['name']);
}
