/**
 * Accessor - Zero-copy field access for binary tree format
 *
 * This is the KEY FEATURE of the Lite³-inspired format: accessing specific
 * fields without deserializing the entire structure. Uses binary search on
 * sorted keys for O(log n) lookup time.
 *
 * Example:
 *   const buffer = serialize({ user: { name: "Alice", age: 30 } });
 *   const name = getString(buffer, ['user', 'name']); // "Alice" - no full parse!
 */

import {
  ReadCursor,
  ValueType,
  HEADER_SIZE,
  TYPE_TAG_SIZE,
  LENGTH_SIZE,
  OBJECT_ENTRY_SIZE,
  ARRAY_ENTRY_SIZE,
} from './types';

import {
  createReadCursor,
  readHeader,
  readUint8,
  readUint32,
  readFloat64,
  readString,
  binarySearchKey,
} from './buffer-context';

// =============================================================================
// Path-Based Access API
// =============================================================================

/** Path type for accessor functions - can mix string keys and numeric indices */
export type AccessPath = (string | number)[];

/**
 * Gets a value at the specified path without deserializing the entire buffer.
 * Returns undefined if the path doesn't exist.
 *
 * @param buffer - The serialized binary tree buffer
 * @param path - Array of keys/indices to traverse
 * @returns The value at the path, or undefined if not found
 */
export function get(buffer: ArrayBuffer, path: AccessPath): unknown {
  const offset = getValueOffset(buffer, path);
  if (offset === null) {
    return undefined;
  }

  const cursor = createReadCursor(buffer);
  return readValueAtOffset(cursor, offset);
}

/**
 * Gets a string value at the specified path.
 * Returns null if not found or not a string.
 */
export function getString(buffer: ArrayBuffer, path: AccessPath): string | null {
  const offset = getValueOffset(buffer, path);
  if (offset === null) {
    return null;
  }

  const cursor = createReadCursor(buffer);
  const type = readUint8(cursor, offset);

  if (type !== ValueType.String) {
    return null;
  }

  const length = readUint32(cursor, offset + TYPE_TAG_SIZE);
  return readString(cursor, offset + TYPE_TAG_SIZE + LENGTH_SIZE, length);
}

/**
 * Gets a number value at the specified path.
 * Returns null if not found or not a number.
 */
export function getNumber(buffer: ArrayBuffer, path: AccessPath): number | null {
  const offset = getValueOffset(buffer, path);
  if (offset === null) {
    return null;
  }

  const cursor = createReadCursor(buffer);
  const type = readUint8(cursor, offset);

  if (type !== ValueType.Number) {
    return null;
  }

  return readFloat64(cursor, offset + TYPE_TAG_SIZE);
}

/**
 * Gets a boolean value at the specified path.
 * Returns null if not found or not a boolean.
 */
export function getBoolean(buffer: ArrayBuffer, path: AccessPath): boolean | null {
  const offset = getValueOffset(buffer, path);
  if (offset === null) {
    return null;
  }

  const cursor = createReadCursor(buffer);
  const type = readUint8(cursor, offset);

  if (type !== ValueType.Boolean) {
    return null;
  }

  return readUint8(cursor, offset + TYPE_TAG_SIZE) !== 0;
}

/**
 * Checks if a path exists in the buffer.
 */
export function has(buffer: ArrayBuffer, path: AccessPath): boolean {
  return getValueOffset(buffer, path) !== null;
}

/**
 * Gets the type of value at the specified path.
 * Returns null if the path doesn't exist.
 */
export function getType(
  buffer: ArrayBuffer,
  path: AccessPath
): 'null' | 'undefined' | 'boolean' | 'number' | 'string' | 'array' | 'object' | null {
  const offset = getValueOffset(buffer, path);
  if (offset === null) {
    return null;
  }

  const cursor = createReadCursor(buffer);
  const type = readUint8(cursor, offset);

  switch (type) {
    case ValueType.Null:
      return 'null';
    case ValueType.Undefined:
      return 'undefined';
    case ValueType.Boolean:
      return 'boolean';
    case ValueType.Number:
      return 'number';
    case ValueType.String:
      return 'string';
    case ValueType.Array:
      return 'array';
    case ValueType.Object:
      return 'object';
    default:
      return null;
  }
}

/**
 * Gets the length of an array or object at the specified path.
 * Returns null if not found or not an array/object.
 */
export function getLength(buffer: ArrayBuffer, path: AccessPath): number | null {
  const offset = getValueOffset(buffer, path);
  if (offset === null) {
    return null;
  }

  const cursor = createReadCursor(buffer);
  const type = readUint8(cursor, offset);

  if (type !== ValueType.Array && type !== ValueType.Object) {
    return null;
  }

  return readUint32(cursor, offset + TYPE_TAG_SIZE);
}

/**
 * Gets all keys of an object at the specified path.
 * Returns null if not found or not an object.
 */
export function getKeys(buffer: ArrayBuffer, path: AccessPath): string[] | null {
  const offset = getValueOffset(buffer, path);
  if (offset === null) {
    return null;
  }

  const cursor = createReadCursor(buffer);
  const type = readUint8(cursor, offset);

  if (type !== ValueType.Object) {
    return null;
  }

  const keyCount = readUint32(cursor, offset + TYPE_TAG_SIZE);
  const tableOffset = offset + TYPE_TAG_SIZE + LENGTH_SIZE;

  const keys: string[] = new Array(keyCount);
  for (let i = 0; i < keyCount; i++) {
    const entryOffset = tableOffset + i * OBJECT_ENTRY_SIZE;
    const keyOffset = readUint32(cursor, entryOffset);
    const keyLength = readUint32(cursor, entryOffset + 4);
    keys[i] = readString(cursor, keyOffset, keyLength);
  }

  return keys;
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Gets the byte offset of a value at the specified path.
 * Returns null if the path doesn't exist.
 */
function getValueOffset(buffer: ArrayBuffer, path: (string | number)[]): number | null {
  if (buffer.byteLength < HEADER_SIZE) {
    return null;
  }

  const cursor = createReadCursor(buffer);
  const header = readHeader(cursor);

  if (!header) {
    return null;
  }

  let currentOffset = header.rootOffset;

  for (const segment of path) {
    const type = readUint8(cursor, currentOffset);

    if (typeof segment === 'string') {
      // Object key lookup
      if (type !== ValueType.Object) {
        return null;
      }
      const nextOffset = lookupObjectKey(cursor, currentOffset, segment);
      if (nextOffset === null) {
        return null;
      }
      currentOffset = nextOffset;
    } else {
      // Array index lookup
      if (type !== ValueType.Array) {
        return null;
      }
      const nextOffset = lookupArrayIndex(cursor, currentOffset, segment);
      if (nextOffset === null) {
        return null;
      }
      currentOffset = nextOffset;
    }
  }

  return currentOffset;
}

/**
 * Looks up a key in an object using binary search.
 * Returns the value offset, or null if not found.
 */
function lookupObjectKey(cursor: ReadCursor, objectOffset: number, key: string): number | null {
  const keyCount = readUint32(cursor, objectOffset + TYPE_TAG_SIZE);
  if (keyCount === 0) {
    return null;
  }

  const tableOffset = objectOffset + TYPE_TAG_SIZE + LENGTH_SIZE;
  const index = binarySearchKey(cursor, tableOffset, keyCount, key);

  if (index === -1) {
    return null;
  }

  // Read value offset from entry
  const entryOffset = tableOffset + index * OBJECT_ENTRY_SIZE;
  return readUint32(cursor, entryOffset + 8); // valueOffset is at +8
}

/**
 * Looks up an index in an array.
 * Returns the value offset, or null if out of bounds.
 */
function lookupArrayIndex(cursor: ReadCursor, arrayOffset: number, index: number): number | null {
  const count = readUint32(cursor, arrayOffset + TYPE_TAG_SIZE);

  // Handle negative indices (Python-style)
  let actualIndex = index;
  if (index < 0) {
    actualIndex = count + index;
  }

  if (actualIndex < 0 || actualIndex >= count) {
    return null;
  }

  const tableOffset = arrayOffset + TYPE_TAG_SIZE + LENGTH_SIZE;
  return readUint32(cursor, tableOffset + actualIndex * ARRAY_ENTRY_SIZE);
}

/**
 * Reads a value at the given offset without full deserialization.
 * This is used by the generic get() function.
 */
function readValueAtOffset(cursor: ReadCursor, offset: number): unknown {
  const type = readUint8(cursor, offset);

  switch (type) {
    case ValueType.Null:
      return null;

    case ValueType.Undefined:
      return undefined;

    case ValueType.Boolean:
      return readUint8(cursor, offset + TYPE_TAG_SIZE) !== 0;

    case ValueType.Number:
      return readFloat64(cursor, offset + TYPE_TAG_SIZE);

    case ValueType.String: {
      const length = readUint32(cursor, offset + TYPE_TAG_SIZE);
      return readString(cursor, offset + TYPE_TAG_SIZE + LENGTH_SIZE, length);
    }

    case ValueType.Array: {
      const count = readUint32(cursor, offset + TYPE_TAG_SIZE);
      const tableOffset = offset + TYPE_TAG_SIZE + LENGTH_SIZE;
      const result: unknown[] = new Array(count);
      for (let i = 0; i < count; i++) {
        const valueOffset = readUint32(cursor, tableOffset + i * ARRAY_ENTRY_SIZE);
        result[i] = readValueAtOffset(cursor, valueOffset);
      }
      return result;
    }

    case ValueType.Object: {
      const keyCount = readUint32(cursor, offset + TYPE_TAG_SIZE);
      const tableOffset = offset + TYPE_TAG_SIZE + LENGTH_SIZE;
      const result: Record<string, unknown> = {};
      for (let i = 0; i < keyCount; i++) {
        const entryOffset = tableOffset + i * OBJECT_ENTRY_SIZE;
        const keyOffset = readUint32(cursor, entryOffset);
        const keyLength = readUint32(cursor, entryOffset + 4);
        const valueOffset = readUint32(cursor, entryOffset + 8);
        const key = readString(cursor, keyOffset, keyLength);
        result[key] = readValueAtOffset(cursor, valueOffset);
      }
      return result;
    }

    default:
      return undefined;
  }
}
