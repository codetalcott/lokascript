/**
 * Serializer - Converts JavaScript objects to binary format
 *
 * The serialization strategy:
 * 1. Traverse the value tree recursively
 * 2. For objects, sort keys alphabetically for binary search
 * 3. Write values depth-first, recording offsets
 * 4. Write object/array entry tables after values
 *
 * Binary layout for each type:
 * - Null:      [type:1]
 * - Undefined: [type:1]
 * - Boolean:   [type:1][value:1]
 * - Number:    [type:1][float64:8]
 * - String:    [type:1][length:4][utf8-data:length]
 * - Array:     [type:1][count:4][entries:count*4][...values]
 * - Object:    [type:1][keyCount:4][entries:keyCount*12][...keys][...values]
 */

import {
  WriteCursor,
  BinaryTreeOptions,
  SerializableValue,
  ValueType,
  TYPE_TAG_SIZE,
  LENGTH_SIZE,
  NUMBER_SIZE,
  BOOLEAN_SIZE,
  OBJECT_ENTRY_SIZE,
  ARRAY_ENTRY_SIZE,
} from './types';

import {
  createWriteCursor,
  writeUint8,
  writeUint32,
  writeFloat64,
  writeString,
  writeHeader,
  finalizeBuffer,
  ensureCapacity,
} from './buffer-context';

// =============================================================================
// Main Serialization API
// =============================================================================

/**
 * Serializes a JavaScript value to an ArrayBuffer in binary tree format.
 */
export function serialize(value: unknown, options: BinaryTreeOptions = {}): ArrayBuffer {
  const cursor = createWriteCursor(options);

  // Serialize the root value
  const { cursor: finalCursor, offset: rootOffset } = serializeValue(
    cursor,
    value as SerializableValue,
    options
  );

  // Write header with root offset
  writeHeader(finalCursor, rootOffset);

  // Return trimmed buffer
  return finalizeBuffer(finalCursor);
}

// =============================================================================
// Value Serialization
// =============================================================================

interface SerializeResult {
  cursor: WriteCursor;
  offset: number; // Offset where this value starts
}

/**
 * Serializes any supported JavaScript value
 */
function serializeValue(
  cursor: WriteCursor,
  value: SerializableValue,
  options: BinaryTreeOptions
): SerializeResult {
  if (value === null) {
    return serializeNull(cursor);
  }

  if (value === undefined) {
    return serializeUndefined(cursor);
  }

  const type = typeof value;

  if (type === 'boolean') {
    return serializeBoolean(cursor, value as boolean);
  }

  if (type === 'number') {
    return serializeNumber(cursor, value as number);
  }

  if (type === 'string') {
    return serializeString(cursor, value as string);
  }

  if (Array.isArray(value)) {
    return serializeArray(cursor, value, options);
  }

  if (type === 'object') {
    return serializeObject(cursor, value as Record<string, SerializableValue>, options);
  }

  // Unsupported type - serialize as null
  return serializeNull(cursor);
}

/**
 * Serializes null
 */
function serializeNull(cursor: WriteCursor): SerializeResult {
  const offset = cursor.offset;
  cursor = writeUint8(cursor, ValueType.Null);
  return { cursor, offset };
}

/**
 * Serializes undefined
 */
function serializeUndefined(cursor: WriteCursor): SerializeResult {
  const offset = cursor.offset;
  cursor = writeUint8(cursor, ValueType.Undefined);
  return { cursor, offset };
}

/**
 * Serializes a boolean
 */
function serializeBoolean(cursor: WriteCursor, value: boolean): SerializeResult {
  const offset = cursor.offset;
  cursor = writeUint8(cursor, ValueType.Boolean);
  cursor = writeUint8(cursor, value ? 1 : 0);
  return { cursor, offset };
}

/**
 * Serializes a number (float64)
 */
function serializeNumber(cursor: WriteCursor, value: number): SerializeResult {
  const offset = cursor.offset;
  cursor = writeUint8(cursor, ValueType.Number);
  cursor = writeFloat64(cursor, value);
  return { cursor, offset };
}

/**
 * Serializes a string
 */
function serializeString(cursor: WriteCursor, value: string): SerializeResult {
  const offset = cursor.offset;
  cursor = writeUint8(cursor, ValueType.String);

  // Encode the string to get its byte length
  const encoder = new TextEncoder();
  const encoded = encoder.encode(value);

  // Write length
  cursor = writeUint32(cursor, encoded.length);

  // Write string data
  cursor = ensureCapacity(cursor, encoded.length);
  cursor.uint8.set(encoded, cursor.offset);
  cursor.offset += encoded.length;

  return { cursor, offset };
}

/**
 * Serializes an array
 *
 * Layout:
 * [type:1][count:4][valueOffset0:4][valueOffset1:4]...[values...]
 */
function serializeArray(
  cursor: WriteCursor,
  value: SerializableValue[],
  options: BinaryTreeOptions
): SerializeResult {
  const offset = cursor.offset;

  // Write type tag
  cursor = writeUint8(cursor, ValueType.Array);

  // Write element count
  cursor = writeUint32(cursor, value.length);

  // Reserve space for offset table
  const tableOffset = cursor.offset;
  const tableSize = value.length * ARRAY_ENTRY_SIZE;
  cursor = ensureCapacity(cursor, tableSize);
  cursor.offset += tableSize;

  // Serialize each element and record offsets
  const offsets: number[] = [];
  for (const element of value) {
    const result = serializeValue(cursor, element, options);
    cursor = result.cursor;
    offsets.push(result.offset);
  }

  // Write offsets back to the table
  for (let i = 0; i < offsets.length; i++) {
    cursor.view.setUint32(tableOffset + i * ARRAY_ENTRY_SIZE, offsets[i], true);
  }

  return { cursor, offset };
}

/**
 * Serializes an object with sorted keys for binary search
 *
 * Layout:
 * [type:1][keyCount:4]
 * [keyOffset0:4][keyLen0:4][valueOffset0:4]  <- sorted by key
 * [keyOffset1:4][keyLen1:4][valueOffset1:4]
 * ...
 * [key0-data][key1-data]...
 * [value0-data][value1-data]...
 */
function serializeObject(
  cursor: WriteCursor,
  value: Record<string, SerializableValue>,
  options: BinaryTreeOptions
): SerializeResult {
  const offset = cursor.offset;

  // Get and sort keys
  const keys = Object.keys(value).sort();

  // Write type tag
  cursor = writeUint8(cursor, ValueType.Object);

  // Write key count
  cursor = writeUint32(cursor, keys.length);

  // Reserve space for entry table
  const tableOffset = cursor.offset;
  const tableSize = keys.length * OBJECT_ENTRY_SIZE;
  cursor = ensureCapacity(cursor, tableSize);
  cursor.offset += tableSize;

  // Encode keys and serialize values
  const entries: Array<{ keyOffset: number; keyLength: number; valueOffset: number }> = [];
  const encoder = new TextEncoder();

  // First pass: write all keys
  const keyData: Array<{ encoded: Uint8Array; offset: number }> = [];
  for (const key of keys) {
    const encoded = encoder.encode(key);
    const keyOffset = cursor.offset;
    cursor = ensureCapacity(cursor, encoded.length);
    cursor.uint8.set(encoded, cursor.offset);
    cursor.offset += encoded.length;
    keyData.push({ encoded, offset: keyOffset });
  }

  // Second pass: serialize all values
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const result = serializeValue(cursor, value[key], options);
    cursor = result.cursor;
    entries.push({
      keyOffset: keyData[i].offset,
      keyLength: keyData[i].encoded.length,
      valueOffset: result.offset,
    });
  }

  // Write entries back to the table (in sorted key order)
  for (let i = 0; i < entries.length; i++) {
    const entryOffset = tableOffset + i * OBJECT_ENTRY_SIZE;
    cursor.view.setUint32(entryOffset, entries[i].keyOffset, true);
    cursor.view.setUint32(entryOffset + 4, entries[i].keyLength, true);
    cursor.view.setUint32(entryOffset + 8, entries[i].valueOffset, true);
  }

  return { cursor, offset };
}

// =============================================================================
// Size Estimation (for pre-allocation optimization)
// =============================================================================

/**
 * Estimates the serialized size of a value (for buffer pre-allocation).
 * This is a rough estimate and may be smaller than actual due to string encoding.
 */
export function estimateSize(value: unknown): number {
  if (value === null || value === undefined) {
    return TYPE_TAG_SIZE;
  }

  const type = typeof value;

  if (type === 'boolean') {
    return TYPE_TAG_SIZE + BOOLEAN_SIZE;
  }

  if (type === 'number') {
    return TYPE_TAG_SIZE + NUMBER_SIZE;
  }

  if (type === 'string') {
    // Rough estimate: assume 1.5 bytes per character for UTF-8
    return TYPE_TAG_SIZE + LENGTH_SIZE + Math.ceil((value as string).length * 1.5);
  }

  if (Array.isArray(value)) {
    let size = TYPE_TAG_SIZE + LENGTH_SIZE + value.length * ARRAY_ENTRY_SIZE;
    for (const element of value) {
      size += estimateSize(element);
    }
    return size;
  }

  if (type === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    let size = TYPE_TAG_SIZE + LENGTH_SIZE + keys.length * OBJECT_ENTRY_SIZE;
    for (const key of keys) {
      // Key size estimate
      size += Math.ceil(key.length * 1.5);
      // Value size
      size += estimateSize(obj[key]);
    }
    return size;
  }

  return TYPE_TAG_SIZE; // Unknown type, serialize as null
}
