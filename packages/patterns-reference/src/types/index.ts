/**
 * Patterns Reference Type Definitions
 */

import type { ActionType, SemanticRole } from '@hyperfixi/semantic';

// =============================================================================
// Pattern Types
// =============================================================================

/**
 * A pattern from the database (code_examples table).
 */
export interface Pattern {
  id: string;
  title: string;
  description: string | null;
  rawCode: string;
  category: string | null;
  primaryCommand: string | null;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

/**
 * Pattern with computed complexity classification.
 */
export interface ClassifiedPattern extends Pattern {
  complexity: ComplexityLevel;
  lineCount: number;
  commands: string[];
}

export type ComplexityLevel =
  | 'simple-command'
  | 'simple-event'
  | 'chained-command'
  | 'multi-line-event'
  | 'behavior-install'
  | 'behavior-def'
  | 'def-function'
  | 'complex';

// =============================================================================
// Translation Types
// =============================================================================

export type WordOrder = 'SVO' | 'SOV' | 'VSO' | 'V2';
export type TranslationMethod = 'auto-generated' | 'hand-crafted' | 'verified';

/**
 * A translation of a pattern to a specific language.
 */
export interface Translation {
  id: number;
  codeExampleId: string;
  language: string;
  hyperscript: string;
  wordOrder: WordOrder;
  translationMethod: TranslationMethod;
  confidence: number;
  verifiedParses: boolean;
  verifiedExecutes: boolean;
  roleAlignmentScore: number | null; // Semantic role alignment with English (0-1)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Result of translation verification.
 */
export interface VerificationResult {
  translation: Translation;
  parseSuccess: boolean;
  executeSuccess: boolean;
  errorMessage: string | null;
  confidence: number;
  testedAt: Date;
}

// =============================================================================
// LLM Types
// =============================================================================

/**
 * An LLM example (prompt/completion pair).
 */
export interface LLMExample {
  id: number;
  patternId: string;
  language: string;
  prompt: string;
  completion: string;
  qualityScore: number;
  usageCount: number;
  createdAt: Date;
}

// =============================================================================
// Semantic Role Types
// =============================================================================

/**
 * Semantic roles from @hyperfixi/i18n.
 */
export type SemanticRole =
  | 'action'
  | 'agent'
  | 'patient'
  | 'source'
  | 'destination'
  | 'goal'
  | 'event'
  | 'condition'
  | 'quantity'
  | 'duration'
  | 'responseType'
  | 'method'
  | 'style'
  | 'loopType';

/**
 * Role type classification.
 */
export type RoleType = 'selector' | 'literal' | 'reference' | 'expression' | 'keyword';

/**
 * A semantic role extracted from a pattern.
 */
export interface PatternRole {
  id: number;
  codeExampleId: string;
  commandIndex: number;
  role: SemanticRole;
  roleValue: string | null;
  roleType: RoleType | null;
  required: boolean;
}

/**
 * Result of role alignment validation for translations.
 */
export interface RoleAlignmentResult {
  translationId: number;
  patternId: string;
  language: string;
  alignmentScore: number;
  matchedRoles: SemanticRole[];
  missingRoles: SemanticRole[];
  extraRoles: SemanticRole[];
}

// =============================================================================
// API Types
// =============================================================================

export interface SearchOptions {
  language?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  limit?: number;
  offset?: number;
}

export interface TestOptions {
  language?: string;
  browsers?: string[];
  runtimeVersion?: string;
}

export interface PatternStats {
  totalPatterns: number;
  totalTranslations: number;
  byLanguage: Record<string, { count: number; verifiedCount: number }>;
  byCategory: Record<string, number>;
  avgConfidence: number;
}

// =============================================================================
// Sync Types
// =============================================================================

export interface SyncOptions {
  dryRun?: boolean;
  verbose?: boolean;
  limit?: number;
  languages?: string[];
}

export interface SyncResult {
  totalExamples: number;
  successfulExamples: number;
  skippedExamples: number;
  totalTranslations: number;
  byLanguage: Record<string, number>;
}

export interface ValidationOptions {
  verbose?: boolean;
  languages?: string[];
}

export interface ValidationResult {
  total: number;
  passed: number;
  failed: number;
  byLanguage: Record<string, { passed: number; failed: number }>;
  failures: Array<{ language: string; hyperscript: string; error: string }>;
}

export interface DiscoveryResult {
  totalExamples: number;
  byComplexity: Record<ComplexityLevel, number>;
  parseable: number;
  notParseable: number;
  commandCoverage: Record<string, { total: number; parseable: number }>;
  gaps: string[];
}

// =============================================================================
// Connection Types
// =============================================================================

export interface ConnectionOptions {
  dbPath?: string;
  readonly?: boolean;
}

// =============================================================================
// Main API Interface
// =============================================================================

/**
 * Main API interface for the Patterns Reference system.
 */
export interface PatternsReference {
  // Query patterns
  getPatternById(id: string): Promise<Pattern | null>;
  getPatternsByCategory(category: string): Promise<Pattern[]>;
  getPatternsByCommand(command: string): Promise<Pattern[]>;
  searchPatterns(query: string, options?: SearchOptions): Promise<Pattern[]>;

  // Translations
  getTranslation(patternId: string, language: string): Promise<Translation | null>;
  getAllTranslations(patternId: string): Promise<Translation[]>;
  verifyTranslation(translation: Translation): Promise<VerificationResult>;

  // LLM support
  getLLMExamples(prompt: string, language?: string, limit?: number): Promise<LLMExample[]>;

  // Statistics
  getStats(): Promise<PatternStats>;

  // Connection
  close(): void;
}
