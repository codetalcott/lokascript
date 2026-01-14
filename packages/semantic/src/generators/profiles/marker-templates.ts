/**
 * Marker Templates
 *
 * Shared role marker configurations for language families.
 * These templates reduce duplication across language profiles.
 *
 * Usage:
 *   import { SVO_PREPOSITION_MARKERS } from './marker-templates';
 *   roleMarkers: { ...SVO_PREPOSITION_MARKERS, destination: { ...custom } }
 */

import type { RoleMarker, VerbConfig, PossessiveConfig, MarkingStrategy } from './types';
import type { SemanticRole } from '../../types';

// =============================================================================
// Role Marker Templates by Word Order
// =============================================================================

/**
 * Common role markers for SVO languages with prepositions.
 * Used by: English, Spanish, French, German, Portuguese, Italian, Russian, Indonesian
 */
export const SVO_PREPOSITION_MARKERS: Partial<Record<SemanticRole, RoleMarker>> = {
  patient: { primary: '', position: 'before' },
  destination: { primary: 'on', position: 'before' },
  source: { primary: 'from', position: 'before' },
  style: { primary: 'with', position: 'before' },
};

/**
 * Common role markers for SOV languages with particles/postpositions.
 * Used by: Japanese, Korean, Turkish, Quechua
 */
export const SOV_PARTICLE_MARKERS: Partial<Record<SemanticRole, RoleMarker>> = {
  patient: { primary: 'を', position: 'after' },
  destination: { primary: 'に', position: 'after' },
  source: { primary: 'から', position: 'after' },
  style: { primary: 'で', position: 'after' },
};

/**
 * Korean-specific role markers (vowel harmony variants).
 */
export const KOREAN_PARTICLE_MARKERS: Partial<Record<SemanticRole, RoleMarker>> = {
  patient: { primary: '을', alternatives: ['를'], position: 'after' },
  destination: { primary: '에', alternatives: ['에게', '한테'], position: 'after' },
  source: { primary: '에서', alternatives: ['로부터'], position: 'after' },
  style: { primary: '로', alternatives: ['으로'], position: 'after' },
};

/**
 * Turkish-specific role markers (vowel harmony).
 */
export const TURKISH_SUFFIX_MARKERS: Partial<Record<SemanticRole, RoleMarker>> = {
  patient: { primary: 'i', alternatives: ['ı', 'u', 'ü'], position: 'after' },
  destination: { primary: 'e', alternatives: ['a', 'de', 'da'], position: 'after' },
  source: { primary: 'den', alternatives: ['dan'], position: 'after' },
  style: { primary: 'le', alternatives: ['la', 'ile'], position: 'after' },
};

/**
 * Arabic role markers (VSO, RTL).
 */
export const ARABIC_PREPOSITION_MARKERS: Partial<Record<SemanticRole, RoleMarker>> = {
  patient: { primary: '', position: 'before' },
  destination: { primary: 'على', alternatives: ['إلى', 'في'], position: 'before' },
  source: { primary: 'من', position: 'before' },
  style: { primary: 'بـ', alternatives: ['مع'], position: 'before' },
};

// =============================================================================
// Verb Configuration Templates
// =============================================================================

/**
 * SVO verb configuration (verb at start, optional subject drop).
 */
export const SVO_VERB_CONFIG: VerbConfig = {
  position: 'start',
  subjectDrop: false,
};

/**
 * SVO verb configuration for pro-drop languages (Spanish, Italian, Portuguese).
 */
export const SVO_PRODROP_VERB_CONFIG: VerbConfig = {
  position: 'start',
  subjectDrop: true,
};

/**
 * SOV verb configuration (verb at end, usually subject drop).
 */
export const SOV_VERB_CONFIG: VerbConfig = {
  position: 'end',
  subjectDrop: true,
};

/**
 * VSO verb configuration (Arabic).
 */
export const VSO_VERB_CONFIG: VerbConfig = {
  position: 'start',
  subjectDrop: true,
};

/**
 * German V2 verb configuration.
 */
export const V2_VERB_CONFIG: VerbConfig = {
  position: 'second',
  subjectDrop: false,
};

// =============================================================================
// Possessive Configuration Templates
// =============================================================================

/**
 * English possessive configuration ('s marker).
 */
export const ENGLISH_POSSESSIVE: PossessiveConfig = {
  marker: "'s",
  markerPosition: 'after-object',
  specialForms: { me: 'my', it: 'its', you: 'your' },
  keywords: { my: 'me', your: 'you', its: 'it' },
};

/**
 * Romance language possessive configuration (de + adjectives).
 * Used by: Spanish, French, Portuguese, Italian
 */
export const ROMANCE_POSSESSIVE_BASE: Omit<PossessiveConfig, 'specialForms' | 'keywords'> = {
  marker: 'de',
  markerPosition: 'before-property',
  usePossessiveAdjectives: true,
};

/**
 * Japanese possessive configuration (の particle).
 */
export const JAPANESE_POSSESSIVE: PossessiveConfig = {
  marker: 'の',
  markerPosition: 'between',
  keywords: {
    私の: 'me',
    あなたの: 'you',
    その: 'it',
  },
};

/**
 * Korean possessive configuration (의 particle).
 */
export const KOREAN_POSSESSIVE: PossessiveConfig = {
  marker: '의',
  markerPosition: 'between',
  keywords: {
    내: 'me',
    나의: 'me',
    너의: 'you',
    그것의: 'it',
  },
};

/**
 * German possessive configuration.
 */
export const GERMAN_POSSESSIVE: PossessiveConfig = {
  marker: 'von',
  markerPosition: 'before-property',
  usePossessiveAdjectives: true,
  specialForms: { me: 'mein', it: 'sein', you: 'dein' },
  keywords: {
    mein: 'me',
    meine: 'me',
    meinen: 'me',
    dein: 'you',
    deine: 'you',
    sein: 'it',
    seine: 'it',
  },
};

// =============================================================================
// Language Family Base Configurations
// =============================================================================

/**
 * Base configuration for SVO languages with prepositions.
 */
export interface SVOBaseConfig {
  wordOrder: 'SVO';
  markingStrategy: 'preposition';
  usesSpaces: true;
  direction: 'ltr';
}

export const SVO_BASE_CONFIG: SVOBaseConfig = {
  wordOrder: 'SVO',
  markingStrategy: 'preposition',
  usesSpaces: true,
  direction: 'ltr',
};

/**
 * Base configuration for SOV languages with particles.
 */
export interface SOVBaseConfig {
  wordOrder: 'SOV';
  markingStrategy: MarkingStrategy;
  usesSpaces: boolean;
  direction: 'ltr';
}

export const SOV_PARTICLE_CONFIG: SOVBaseConfig = {
  wordOrder: 'SOV',
  markingStrategy: 'particle',
  usesSpaces: false,
  direction: 'ltr',
};

export const SOV_SPACE_CONFIG: SOVBaseConfig = {
  wordOrder: 'SOV',
  markingStrategy: 'postposition',
  usesSpaces: true,
  direction: 'ltr',
};

/**
 * Base configuration for VSO languages.
 */
export interface VSOBaseConfig {
  wordOrder: 'VSO';
  markingStrategy: 'preposition';
  usesSpaces: boolean;
  direction: 'ltr' | 'rtl';
}

export const VSO_BASE_CONFIG: VSOBaseConfig = {
  wordOrder: 'VSO',
  markingStrategy: 'preposition',
  usesSpaces: true,
  direction: 'rtl',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create role markers by translating from a base template.
 * Useful for creating language-specific markers from SVO_PREPOSITION_MARKERS.
 */
export function createRoleMarkers(
  translations: Partial<Record<SemanticRole, string | { primary: string; alternatives?: string[] }>>
): Partial<Record<SemanticRole, RoleMarker>> {
  const markers: Partial<Record<SemanticRole, RoleMarker>> = {};

  for (const [role, value] of Object.entries(translations)) {
    if (typeof value === 'string') {
      markers[role as SemanticRole] = { primary: value, position: 'before' };
    } else {
      markers[role as SemanticRole] = { ...value, position: 'before' };
    }
  }

  // Patient is always empty with position before
  if (!markers.patient) {
    markers.patient = { primary: '', position: 'before' };
  }

  return markers;
}

/**
 * Create Romance possessive config with language-specific overrides.
 */
export function createRomancePossessive(
  specialForms: Record<string, string>,
  keywords: Record<string, string>
): PossessiveConfig {
  return {
    ...ROMANCE_POSSESSIVE_BASE,
    specialForms,
    keywords,
  };
}
