/**
 * Value Extractor Types (Semantic Package Copy)
 *
 * This is a minimal copy of the ValueExtractor interface for the semantic package.
 * The canonical version is in @lokascript/framework/interfaces/value-extractor.ts
 *
 * We maintain this copy to avoid circular dependencies between framework and semantic.
 */

/**
 * Extraction result with value and consumed length.
 */
export interface ExtractionResult {
  /** The extracted value */
  readonly value: string;

  /** Number of characters consumed */
  readonly length: number;

  /** Optional metadata about the extraction */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Value extractor - identifies and extracts typed values from input.
 */
export interface ValueExtractor {
  /** Name of this extractor (for debugging) */
  readonly name: string;

  /**
   * Check if this extractor can handle input at position.
   */
  canExtract(input: string, position: number): boolean;

  /**
   * Extract value from input at position.
   */
  extract(input: string, position: number): ExtractionResult | null;
}
