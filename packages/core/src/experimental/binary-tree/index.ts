/**
 * Binary Tree Serialization - Lite³-Inspired Zero-Copy Format
 *
 * This module provides a binary serialization format inspired by Lite³/TRON
 * that enables O(log n) field access without full deserialization.
 *
 * Key Features:
 * - Zero-copy field access via binary search on sorted keys
 * - Full round-trip serialization/deserialization
 * - Compact binary format (typically 20-40% smaller than JSON)
 * - Suitable for ArrayBuffer transfer to Web Workers
 *
 * Usage:
 * ```typescript
 * import { BinaryTree } from './experimental/binary-tree';
 *
 * // Serialize
 * const buffer = BinaryTree.serialize({ user: { name: "Alice", age: 30 } });
 *
 * // Zero-copy access (THE KEY FEATURE)
 * const name = BinaryTree.getString(buffer, ['user', 'name']); // "Alice"
 * const age = BinaryTree.getNumber(buffer, ['user', 'age']); // 30
 *
 * // Full deserialization when needed
 * const obj = BinaryTree.deserialize(buffer);
 * ```
 *
 * @module experimental/binary-tree
 */

// Re-export types
export {
  BinaryTreeOptions,
  SerializableValue,
  SerializablePrimitive,
  ValueType,
  MAGIC_NUMBER,
  FORMAT_VERSION,
  HEADER_SIZE,
} from './types';

// Import implementations
import { serialize, estimateSize } from './serializer';
import { deserialize, validate, inspect } from './deserializer';
import {
  get,
  getString,
  getNumber,
  getBoolean,
  has,
  getType,
  getLength,
  getKeys,
  type AccessPath,
} from './accessor';

// =============================================================================
// Main API Class
// =============================================================================

/**
 * BinaryTree provides a unified API for binary tree serialization operations.
 *
 * All methods are static - no instance needed.
 */
export class BinaryTree {
  // ===========================================================================
  // Serialization
  // ===========================================================================

  /**
   * Serializes a JavaScript value to an ArrayBuffer in binary tree format.
   *
   * @param value - The value to serialize (object, array, primitive)
   * @returns ArrayBuffer containing the serialized data
   */
  static serialize = serialize;

  /**
   * Estimates the size of a serialized value (for buffer pre-allocation).
   */
  static estimateSize = estimateSize;

  // ===========================================================================
  // Deserialization
  // ===========================================================================

  /**
   * Deserializes an ArrayBuffer back to a JavaScript value.
   *
   * @param buffer - The serialized buffer
   * @returns The deserialized JavaScript value
   * @throws Error if the buffer is invalid
   */
  static deserialize = deserialize;

  /**
   * Validates a buffer without deserializing.
   */
  static validate = validate;

  /**
   * Inspects a buffer's structure without deserializing values.
   */
  static inspect = inspect;

  // ===========================================================================
  // Zero-Copy Access (THE KEY FEATURE)
  // ===========================================================================

  /**
   * Gets a value at the specified path without deserializing the entire buffer.
   *
   * This is the primary benefit of the binary tree format - accessing specific
   * fields uses O(log n) binary search on sorted keys, avoiding the O(n) cost
   * of JSON.parse().
   *
   * @param buffer - The serialized buffer
   * @param path - Array of keys/indices to traverse
   * @returns The value at the path, or undefined if not found
   *
   * @example
   * const name = BinaryTree.get(buffer, ['user', 'profile', 'name']);
   * const firstItem = BinaryTree.get(buffer, ['items', 0]);
   */
  static get = get;

  /**
   * Gets a string value at the specified path.
   * Returns null if not found or not a string.
   */
  static getString = getString;

  /**
   * Gets a number value at the specified path.
   * Returns null if not found or not a number.
   */
  static getNumber = getNumber;

  /**
   * Gets a boolean value at the specified path.
   * Returns null if not found or not a boolean.
   */
  static getBoolean = getBoolean;

  /**
   * Checks if a path exists in the buffer.
   */
  static has = has;

  /**
   * Gets the type of value at the specified path.
   */
  static getType = getType;

  /**
   * Gets the length of an array or object at the specified path.
   */
  static getLength = getLength;

  /**
   * Gets all keys of an object at the specified path.
   */
  static getKeys = getKeys;
}

// =============================================================================
// Direct Function Exports
// =============================================================================

// Also export functions directly for tree-shaking
export {
  serialize,
  estimateSize,
  deserialize,
  validate,
  inspect,
  get,
  getString,
  getNumber,
  getBoolean,
  has,
  getType,
  getLength,
  getKeys,
};

// Export types
export type { AccessPath };
