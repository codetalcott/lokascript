/**
 * Language Profiles Index
 *
 * Re-exports all profile types and individual profiles.
 * For tree-shaking, import specific profiles directly:
 *   import { englishProfile } from './profiles/english';
 *
 * @generated This file is auto-generated. Do not edit manually.
 */

// Types
export type {
  LanguageProfile,
  WordOrder,
  MarkingStrategy,
  RoleMarker,
  VerbConfig,
  PossessiveConfig,
  KeywordTranslation,
  TokenizationConfig,
} from './types';

// Marker templates for reducing profile duplication
export {
  // Role marker templates
  SVO_PREPOSITION_MARKERS,
  SOV_PARTICLE_MARKERS,
  KOREAN_PARTICLE_MARKERS,
  TURKISH_SUFFIX_MARKERS,
  ARABIC_PREPOSITION_MARKERS,
  // Verb configuration templates
  SVO_VERB_CONFIG,
  SVO_PRODROP_VERB_CONFIG,
  SOV_VERB_CONFIG,
  VSO_VERB_CONFIG,
  V2_VERB_CONFIG,
  // Possessive templates
  ENGLISH_POSSESSIVE,
  ROMANCE_POSSESSIVE_BASE,
  JAPANESE_POSSESSIVE,
  KOREAN_POSSESSIVE,
  GERMAN_POSSESSIVE,
  // Base configurations
  SVO_BASE_CONFIG,
  SOV_PARTICLE_CONFIG,
  SOV_SPACE_CONFIG,
  VSO_BASE_CONFIG,
  // Helper functions
  createRoleMarkers,
  createRomancePossessive,
} from './marker-templates';

// Individual profiles - import individually for tree-shaking
export { arabicProfile } from './arabic';
export { bengaliProfile } from './bengali';
export { chineseProfile } from './chinese';
export { englishProfile } from './english';
export { frenchProfile } from './french';
export { germanProfile } from './german';
export { hindiProfile } from './hindi';
export { indonesianProfile } from './indonesian';
export { italianProfile } from './italian';
export { japaneseProfile } from './japanese';
export { koreanProfile } from './korean';
export { malayProfile } from './ms';
export { polishProfile } from './polish';
export { portugueseProfile } from './portuguese';
export { quechuaProfile } from './quechua';
export { russianProfile } from './russian';
export { spanishProfile } from './spanish';
export { swahiliProfile } from './swahili';
export { thaiProfile } from './thai';
export { tagalogProfile } from './tl';
export { turkishProfile } from './turkish';
export { ukrainianProfile } from './ukrainian';
export { vietnameseProfile } from './vietnamese';
