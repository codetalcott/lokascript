/**
 * Arabic Temporal Marker Extractor (Context-Aware)
 *
 * Handles Arabic temporal markers (event trigger keywords) with formality and confidence tracking.
 *
 * Formality levels:
 * - 'formal': Modern Standard Arabic (MSA) - preferred in written/formal contexts
 * - 'neutral': Common in both MSA and dialects
 * - 'dialectal': Informal/colloquial - common in spoken Arabic
 *
 * Confidence reflects how reliably the marker indicates an event trigger ("on" event).
 * Formal markers have higher confidence due to standardization.
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';
import { createUnicodeRangeClassifier } from '../base';

/** Check if character is Arabic (includes all Arabic Unicode blocks). */
const isArabic = createUnicodeRangeClassifier([
  [0x0600, 0x06ff], // Arabic
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
]);

/**
 * Temporal marker metadata for semantic role assignment.
 */
interface TemporalMarkerMetadata {
  readonly normalized: string;
  readonly formality: 'formal' | 'neutral' | 'dialectal';
  readonly confidence: number;
  readonly description: string;
}

/**
 * Arabic temporal markers (event trigger keywords) with formality and confidence tracking.
 */
const TEMPORAL_MARKERS = new Map<string, TemporalMarkerMetadata>([
  [
    'عندما',
    {
      normalized: 'on',
      formality: 'formal',
      confidence: 0.95,
      description: 'when (formal MSA)',
    },
  ],
  [
    'حينما',
    {
      normalized: 'on',
      formality: 'formal',
      confidence: 0.93,
      description: 'when/whenever (formal)',
    },
  ],
  [
    'عند',
    {
      normalized: 'on',
      formality: 'neutral',
      confidence: 0.88,
      description: 'at/when (neutral)',
    },
  ],
  [
    'حين',
    {
      normalized: 'on',
      formality: 'neutral',
      confidence: 0.85,
      description: 'when/time (neutral)',
    },
  ],
  [
    'لمّا',
    {
      normalized: 'on',
      formality: 'dialectal',
      confidence: 0.7,
      description: 'when (dialectal, with shadda)',
    },
  ],
  [
    'لما',
    {
      normalized: 'on',
      formality: 'dialectal',
      confidence: 0.68,
      description: 'when (dialectal, no diacritic)',
    },
  ],
  [
    'لدى',
    {
      normalized: 'on',
      formality: 'neutral',
      confidence: 0.82,
      description: 'at/with (temporal)',
    },
  ],
]);

/**
 * ArabicTemporalExtractor - Extracts Arabic temporal markers with formality metadata.
 */
export class ArabicTemporalExtractor implements ContextAwareExtractor {
  readonly name = 'arabic-temporal';

  // Context available for future use (e.g., keyword boundary detection)
  private _context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this._context = context;
    void this._context; // Satisfy noUnusedLocals
  }

  canExtract(input: string, position: number): boolean {
    // Check if any temporal marker starts at this position
    for (const [marker] of TEMPORAL_MARKERS) {
      if (input.startsWith(marker, position)) {
        return true;
      }
    }
    return false;
  }

  extract(input: string, position: number): ExtractionResult | null {
    // Try temporal markers (longest first for greedy matching)
    const sortedMarkers = Array.from(TEMPORAL_MARKERS.entries()).sort(
      ([a], [b]) => b.length - a.length
    );

    for (const [marker, metadata] of sortedMarkers) {
      if (input.startsWith(marker, position)) {
        // Check word boundary (must be followed by space or non-Arabic)
        const nextPos = position + marker.length;
        if (nextPos >= input.length || /\s/.test(input[nextPos]) || !isArabic(input[nextPos])) {
          return {
            value: marker,
            length: marker.length,
            metadata: {
              temporalFormality: metadata.formality,
              temporalConfidence: metadata.confidence,
              normalized: metadata.normalized,
              description: metadata.description,
            },
          };
        }
      }
    }

    return null;
  }
}

/**
 * Create Arabic temporal marker extractor.
 */
export function createArabicTemporalExtractor(): ContextAwareExtractor {
  return new ArabicTemporalExtractor();
}
