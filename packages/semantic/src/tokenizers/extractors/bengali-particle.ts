/**
 * Bengali Particle Extractor (Context-Aware)
 *
 * Handles Bengali postpositions with role metadata:
 * - Single-word postpositions: কে (patient), তে (destination), থেকে (source)
 * - Particle metadata includes role and confidence scores
 *
 * Note: Bengali has simpler postposition system than Hindi (no compound forms).
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

/**
 * Particle metadata for semantic role assignment.
 */
interface ParticleMetadata {
  readonly role: string;
  readonly confidence: number;
  readonly variant?: string;
}

/**
 * Single-word Bengali postpositions with role metadata.
 */
const SINGLE_POSTPOSITIONS = new Map<string, ParticleMetadata>([
  ['কে', { role: 'patient', confidence: 0.95 }], // Direct object marker
  ['তে', { role: 'destination', confidence: 0.9 }], // Location/destination (also event marker)
  ['এ', { role: 'event', confidence: 0.85 }], // Locative "at/on/in" (marks events: ক্লিক এ = "on click")
  ['থেকে', { role: 'source', confidence: 0.95 }], // From (source)
  ['র', { role: 'possessive', confidence: 0.95 }], // Possessive marker
  ['এর', { role: 'possessive', confidence: 0.95 }], // Possessive marker (proximal)
  ['দিয়ে', { role: 'instrument', confidence: 0.9 }], // By/with (instrument)
  ['জন্য', { role: 'purpose', confidence: 0.9 }], // For (purpose)
  ['পর্যন্ত', { role: 'until', confidence: 0.9 }], // Until/up to
  ['মধ্যে', { role: 'location', confidence: 0.85 }], // In/within
]);

/**
 * BengaliParticleExtractor - Extracts Bengali postpositions with role metadata.
 */
export class BengaliParticleExtractor implements ContextAwareExtractor {
  readonly name = 'bengali-particle';

  // Context available for future use (e.g., particle boundary detection)
  private _context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this._context = context;
    void this._context; // Satisfy noUnusedLocals
  }

  canExtract(input: string, position: number): boolean {
    // Extract the word at position to check against the map
    let word = '';
    let pos = position;
    while (pos < input.length && this.isBengali(input[pos])) {
      word += input[pos];
      pos++;
    }

    return SINGLE_POSTPOSITIONS.has(word);
  }

  extract(input: string, position: number): ExtractionResult | null {
    // Extract Bengali word
    let word = '';
    let pos = position;
    while (pos < input.length && this.isBengali(input[pos])) {
      word += input[pos];
      pos++;
    }

    const metadata = SINGLE_POSTPOSITIONS.get(word);
    if (metadata) {
      return {
        value: word,
        length: word.length,
        metadata: {
          role: metadata.role,
          confidence: metadata.confidence,
          variant: word,
        },
      };
    }

    return null;
  }

  private isBengali(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 0x0980 && code <= 0x09ff;
  }
}

/**
 * Create Bengali-specific extractors.
 */
export function createBengaliExtractors(): ContextAwareExtractor[] {
  return [new BengaliParticleExtractor()];
}
