/**
 * Japanese Particle Extractor (Context-Aware)
 *
 * Handles Japanese particles with role metadata:
 * - Single-character particles: を (patient), に (destination), が (subject)
 * - Multi-character particles: から (source), まで (until), より (comparison)
 * - Particle metadata includes role and confidence scores
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
 * Single-character Japanese particles with role metadata.
 */
const SINGLE_CHAR_PARTICLES = new Map<string, ParticleMetadata>([
  ['を', { role: 'patient', confidence: 0.95 }],
  ['に', { role: 'destination', confidence: 0.85 }],
  ['が', { role: 'subject', confidence: 0.9 }],
  ['の', { role: 'possessive', confidence: 0.9 }],
  ['と', { role: 'conjunction', confidence: 0.8 }],
  ['で', { role: 'instrument', confidence: 0.85 }],
  ['へ', { role: 'direction', confidence: 0.85 }],
  ['や', { role: 'listing', confidence: 0.8 }],
  ['か', { role: 'question', confidence: 0.85 }],
  ['も', { role: 'also', confidence: 0.85 }],
  ['は', { role: 'topic', confidence: 0.9 }],
]);

/**
 * Multi-character Japanese particles with role metadata.
 */
const MULTI_CHAR_PARTICLES = new Map<string, ParticleMetadata>([
  ['から', { role: 'source', confidence: 0.95 }],
  ['まで', { role: 'until', confidence: 0.95 }],
  ['より', { role: 'comparison', confidence: 0.9 }],
  ['として', { role: 'as', confidence: 0.9 }],
  ['について', { role: 'about', confidence: 0.9 }],
  ['によって', { role: 'by-means', confidence: 0.9 }],
  ['にて', { role: 'at-location', confidence: 0.85 }],
]);

/**
 * JapaneseParticleExtractor - Extracts Japanese particles with role metadata.
 */
export class JapaneseParticleExtractor implements ContextAwareExtractor {
  readonly name = 'japanese-particle';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    const char = input[position];

    // Check single-character particles
    if (SINGLE_CHAR_PARTICLES.has(char)) {
      return true;
    }

    // Check multi-character particles (greedy longest-first)
    for (const [particle] of MULTI_CHAR_PARTICLES) {
      if (input.startsWith(particle, position)) {
        return true;
      }
    }

    return false;
  }

  extract(input: string, position: number): ExtractionResult | null {
    // Try multi-character particles first (longest match)
    for (const [particle, metadata] of MULTI_CHAR_PARTICLES) {
      if (input.startsWith(particle, position)) {
        return {
          value: particle,
          length: particle.length,
          metadata: {
            role: metadata.role,
            confidence: metadata.confidence,
            variant: particle,
          },
        };
      }
    }

    // Try single-character particles
    const char = input[position];
    const metadata = SINGLE_CHAR_PARTICLES.get(char);
    if (metadata) {
      return {
        value: char,
        length: 1,
        metadata: {
          role: metadata.role,
          confidence: metadata.confidence,
          variant: char,
        },
      };
    }

    return null;
  }
}

/**
 * Create Japanese-specific extractors.
 */
export function createJapaneseExtractors(): ContextAwareExtractor[] {
  return [new JapaneseParticleExtractor()];
}
