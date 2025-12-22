/**
 * Buffer Context - Low-level ArrayBuffer read/write utilities
 *
 * Provides cursor-based access to ArrayBuffer for serialization and
 * deserialization operations. Handles automatic buffer growth during writes.
 */

import {
  WriteCursor,
  ReadCursor,
  BinaryTreeOptions,
  HEADER_SIZE,
  MAGIC_NUMBER,
  FORMAT_VERSION,
} from './types';

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_INITIAL_SIZE = 4096;
const DEFAULT_GROWTH_FACTOR = 2;

// =============================================================================
// Write Context
// =============================================================================

/**
 * Creates a new write cursor with an initial buffer
 */
export function createWriteCursor(options: BinaryTreeOptions = {}): WriteCursor {
  const initialSize = options.initialSize ?? DEFAULT_INITIAL_SIZE;
  const buffer = new ArrayBuffer(initialSize);

  return {
    buffer,
    view: new DataView(buffer),
    uint8: new Uint8Array(buffer),
    offset: HEADER_SIZE, // Skip header, write data first
  };
}

/**
 * Ensures the buffer has enough space for the requested bytes.
 * Grows the buffer if necessary.
 */
export function ensureCapacity(
  cursor: WriteCursor,
  bytesNeeded: number,
  options: BinaryTreeOptions = {}
): WriteCursor {
  const requiredSize = cursor.offset + bytesNeeded;

  if (requiredSize <= cursor.buffer.byteLength) {
    return cursor;
  }

  // Calculate new size
  const growthFactor = options.growthFactor ?? DEFAULT_GROWTH_FACTOR;
  let newSize = cursor.buffer.byteLength;
  while (newSize < requiredSize) {
    newSize = Math.ceil(newSize * growthFactor);
  }

  // Create new buffer and copy data
  const newBuffer = new ArrayBuffer(newSize);
  const newUint8 = new Uint8Array(newBuffer);
  newUint8.set(cursor.uint8);

  return {
    buffer: newBuffer,
    view: new DataView(newBuffer),
    uint8: newUint8,
    offset: cursor.offset,
  };
}

// =============================================================================
// Write Operations
// =============================================================================

/**
 * Writes a uint8 value at the current cursor position
 */
export function writeUint8(cursor: WriteCursor, value: number): WriteCursor {
  const c = ensureCapacity(cursor, 1);
  c.view.setUint8(c.offset, value);
  c.offset += 1;
  return c;
}

/**
 * Writes a uint32 value at the current cursor position (little-endian)
 */
export function writeUint32(cursor: WriteCursor, value: number): WriteCursor {
  const c = ensureCapacity(cursor, 4);
  c.view.setUint32(c.offset, value, true); // little-endian
  c.offset += 4;
  return c;
}

/**
 * Writes a float64 value at the current cursor position (little-endian)
 */
export function writeFloat64(cursor: WriteCursor, value: number): WriteCursor {
  const c = ensureCapacity(cursor, 8);
  c.view.setFloat64(c.offset, value, true); // little-endian
  c.offset += 8;
  return c;
}

/**
 * Writes a UTF-8 encoded string at the current cursor position.
 * Returns the cursor and the byte length of the encoded string.
 */
export function writeString(
  cursor: WriteCursor,
  value: string
): { cursor: WriteCursor; byteLength: number } {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(value);
  const c = ensureCapacity(cursor, encoded.length);
  c.uint8.set(encoded, c.offset);
  c.offset += encoded.length;
  return { cursor: c, byteLength: encoded.length };
}

/**
 * Writes raw bytes at the current cursor position
 */
export function writeBytes(cursor: WriteCursor, bytes: Uint8Array): WriteCursor {
  const c = ensureCapacity(cursor, bytes.length);
  c.uint8.set(bytes, c.offset);
  c.offset += bytes.length;
  return c;
}

/**
 * Writes the file header at offset 0
 */
export function writeHeader(cursor: WriteCursor, rootOffset: number): WriteCursor {
  cursor.view.setUint32(0, MAGIC_NUMBER, true);
  cursor.view.setUint32(4, FORMAT_VERSION, true);
  cursor.view.setUint32(8, rootOffset, true);
  cursor.view.setUint32(12, cursor.offset, true); // totalSize
  return cursor;
}

/**
 * Finalizes the buffer, trimming to actual size used
 */
export function finalizeBuffer(cursor: WriteCursor): ArrayBuffer {
  if (cursor.offset === cursor.buffer.byteLength) {
    return cursor.buffer;
  }
  return cursor.buffer.slice(0, cursor.offset);
}

// =============================================================================
// Read Context
// =============================================================================

/**
 * Creates a read cursor for a buffer
 */
export function createReadCursor(buffer: ArrayBuffer, offset = 0): ReadCursor {
  return {
    view: new DataView(buffer),
    uint8: new Uint8Array(buffer),
    offset,
  };
}

// =============================================================================
// Read Operations
// =============================================================================

/**
 * Reads a uint8 value at the specified offset
 */
export function readUint8(cursor: ReadCursor, offset?: number): number {
  return cursor.view.getUint8(offset ?? cursor.offset);
}

/**
 * Reads a uint32 value at the specified offset (little-endian)
 */
export function readUint32(cursor: ReadCursor, offset?: number): number {
  return cursor.view.getUint32(offset ?? cursor.offset, true);
}

/**
 * Reads a float64 value at the specified offset (little-endian)
 */
export function readFloat64(cursor: ReadCursor, offset?: number): number {
  return cursor.view.getFloat64(offset ?? cursor.offset, true);
}

/**
 * Reads a UTF-8 encoded string at the specified offset with given length
 */
export function readString(cursor: ReadCursor, offset: number, length: number): string {
  const decoder = new TextDecoder();
  const bytes = cursor.uint8.subarray(offset, offset + length);
  return decoder.decode(bytes);
}

/**
 * Reads and validates the file header
 */
export function readHeader(
  cursor: ReadCursor
): { magic: number; version: number; rootOffset: number; totalSize: number } | null {
  if (cursor.uint8.length < HEADER_SIZE) {
    return null;
  }

  const magic = cursor.view.getUint32(0, true);
  if (magic !== MAGIC_NUMBER) {
    return null;
  }

  return {
    magic,
    version: cursor.view.getUint32(4, true),
    rootOffset: cursor.view.getUint32(8, true),
    totalSize: cursor.view.getUint32(12, true),
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Compares two strings for binary search ordering
 */
export function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Binary search for a key in a sorted array of object entries.
 * Returns the index if found, or -1 if not found.
 */
export function binarySearchKey(
  cursor: ReadCursor,
  entriesOffset: number,
  keyCount: number,
  targetKey: string
): number {
  let low = 0;
  let high = keyCount - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const entryOffset = entriesOffset + mid * 12; // 12 bytes per entry

    // Read key offset and length
    const keyOffset = cursor.view.getUint32(entryOffset, true);
    const keyLength = cursor.view.getUint32(entryOffset + 4, true);

    // Read the key string
    const key = readString(cursor, keyOffset, keyLength);

    const cmp = compareStrings(key, targetKey);
    if (cmp === 0) {
      return mid;
    } else if (cmp < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
