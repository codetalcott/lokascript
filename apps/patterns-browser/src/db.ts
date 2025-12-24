/**
 * Database wrapper for patterns-browser using Bun's native SQLite.
 *
 * This is a Bun-specific implementation that directly queries the patterns.db
 * rather than going through @hyperfixi/patterns-reference which uses better-sqlite3.
 */

import { Database } from 'bun:sqlite';
import { resolve } from 'path';

// Path to the patterns database (relative to this file)
const DB_PATH = resolve(import.meta.dir, '../../../packages/patterns-reference/data/patterns.db');

// Create database connection
const db = new Database(DB_PATH, { readonly: true });

// =============================================================================
// Types
// =============================================================================

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

export interface Translation {
  id: number;
  codeExampleId: string;
  language: string;
  hyperscript: string;
  wordOrder: 'SVO' | 'SOV' | 'VSO' | 'V2';
  translationMethod: string;
  confidence: number;
  verifiedParses: boolean;
  verifiedExecutes: boolean;
  roleAlignmentScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface PatternStats {
  totalPatterns: number;
  totalTranslations: number;
  byLanguage: Record<string, { count: number; verifiedCount: number }>;
  byCategory: Record<string, number>;
  avgConfidence: number;
}

export interface SearchOptions {
  language?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  limit?: number;
  offset?: number;
}

// =============================================================================
// Row Mappers
// =============================================================================

interface PatternRow {
  id: string;
  title: string;
  raw_code: string;
  description: string | null;
  feature: string | null;
  source_url: string | null;
  created_at: string;
}

function mapPatternRow(row: PatternRow): Pattern {
  // Extract primary command from raw_code (first word after 'on <event>')
  let primaryCommand: string | null = null;
  const match = row.raw_code.match(/^on\s+\w+\s+(\w+)/);
  if (match) {
    primaryCommand = match[1];
  }

  // Determine difficulty based on code complexity
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  const lines = row.raw_code.split('\n').length;
  if (lines > 5 || row.raw_code.includes('repeat') || row.raw_code.includes('def ')) {
    difficulty = 'advanced';
  } else if (lines > 2 || row.raw_code.includes('if') || row.raw_code.includes('wait')) {
    difficulty = 'intermediate';
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    rawCode: row.raw_code,
    category: row.feature,
    primaryCommand,
    tags: row.feature ? [row.feature] : [],
    difficulty,
    createdAt: new Date(row.created_at),
  };
}

interface TranslationRow {
  id: number;
  code_example_id: string;
  language: string;
  hyperscript: string;
  word_order: string;
  translation_method: string;
  confidence: number;
  verified_parses: number;
  verified_executes: number;
  role_alignment_score: number | null;
  created_at: string;
  updated_at: string;
}

function mapTranslationRow(row: TranslationRow): Translation {
  return {
    id: row.id,
    codeExampleId: row.code_example_id,
    language: row.language,
    hyperscript: row.hyperscript,
    wordOrder: row.word_order as Translation['wordOrder'],
    translationMethod: row.translation_method,
    confidence: row.confidence,
    verifiedParses: Boolean(row.verified_parses),
    verifiedExecutes: Boolean(row.verified_executes),
    roleAlignmentScore: row.role_alignment_score,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

interface LLMExampleRow {
  id: number;
  code_example_id: string;
  language: string;
  prompt: string;
  completion: string;
  quality_score: number;
  usage_count: number;
  created_at: string;
}

function mapLLMExampleRow(row: LLMExampleRow): LLMExample {
  return {
    id: row.id,
    patternId: row.code_example_id,
    language: row.language,
    prompt: row.prompt,
    completion: row.completion,
    qualityScore: row.quality_score,
    usageCount: row.usage_count,
    createdAt: new Date(row.created_at),
  };
}

// =============================================================================
// Patterns API
// =============================================================================

export async function getPatterns(options?: SearchOptions): Promise<Pattern[]> {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  let query = 'SELECT * FROM code_examples';
  const params: any[] = [];

  if (options?.category) {
    query += ' WHERE feature = ?';
    params.push(options.category);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.query<PatternRow, any[]>(query).all(...params);
  return rows.map(mapPatternRow);
}

export async function getPatternsByFeature(category: string): Promise<Pattern[]> {
  const rows = db
    .query<PatternRow, [string]>('SELECT * FROM code_examples WHERE feature = ? ORDER BY title')
    .all(category);
  return rows.map(mapPatternRow);
}

export async function getPattern(id: string): Promise<Pattern | null> {
  const row = db.query<PatternRow, [string]>('SELECT * FROM code_examples WHERE id = ?').get(id);
  return row ? mapPatternRow(row) : null;
}

export async function search(query: string, options?: SearchOptions): Promise<Pattern[]> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  // Simple LIKE search on title, raw_code, and description
  const searchPattern = `%${query}%`;
  const rows = db
    .query<PatternRow, [string, string, string, string, number, number]>(
      `SELECT * FROM code_examples
       WHERE title LIKE ? OR raw_code LIKE ? OR description LIKE ?
       ORDER BY
         CASE WHEN title LIKE ? THEN 0 ELSE 1 END,
         title
       LIMIT ? OFFSET ?`
    )
    .all(searchPattern, searchPattern, searchPattern, searchPattern, limit, offset);

  return rows.map(mapPatternRow);
}

export async function getStats(): Promise<PatternStats> {
  // Total patterns
  const patternCount = db.query<{ count: number }, []>('SELECT COUNT(*) as count FROM code_examples').get();
  const totalPatterns = patternCount?.count ?? 0;

  // Total translations
  const translationCount = db.query<{ count: number }, []>('SELECT COUNT(*) as count FROM pattern_translations').get();
  const totalTranslations = translationCount?.count ?? 0;

  // By category
  const categoryRows = db.query<{ feature: string; count: number }, []>(
    'SELECT feature, COUNT(*) as count FROM code_examples WHERE feature IS NOT NULL GROUP BY feature'
  ).all();
  const byCategory: Record<string, number> = {};
  for (const row of categoryRows) {
    byCategory[row.feature] = row.count;
  }

  // By language
  const languageRows = db.query<{ language: string; count: number; verified: number }, []>(
    `SELECT language, COUNT(*) as count, SUM(verified_parses) as verified
     FROM pattern_translations
     GROUP BY language`
  ).all();
  const byLanguage: Record<string, { count: number; verifiedCount: number }> = {};
  for (const row of languageRows) {
    byLanguage[row.language] = { count: row.count, verifiedCount: row.verified || 0 };
  }

  // Average confidence
  const avgRow = db.query<{ avg: number }, []>('SELECT AVG(confidence) as avg FROM pattern_translations').get();
  const avgConfidence = avgRow?.avg ?? 0;

  return {
    totalPatterns,
    totalTranslations,
    byCategory,
    byLanguage,
    avgConfidence,
  };
}

// =============================================================================
// Translations API
// =============================================================================

export async function getPatternTranslations(patternId: string): Promise<Translation[]> {
  const rows = db
    .query<TranslationRow, [string]>(
      'SELECT * FROM pattern_translations WHERE code_example_id = ? ORDER BY language'
    )
    .all(patternId);
  return rows.map(mapTranslationRow);
}

export async function getPatternTranslation(
  patternId: string,
  language: string
): Promise<Translation | null> {
  const row = db
    .query<TranslationRow, [string, string]>(
      'SELECT * FROM pattern_translations WHERE code_example_id = ? AND language = ?'
    )
    .get(patternId, language);
  return row ? mapTranslationRow(row) : null;
}

export async function getTranslationsStats() {
  const rows = db.query<{ language: string; count: number; avgConfidence: number }, []>(
    `SELECT language, COUNT(*) as count, AVG(confidence) as avgConfidence
     FROM pattern_translations
     GROUP BY language`
  ).all();

  return {
    byLanguage: Object.fromEntries(
      rows.map(r => [r.language, { count: r.count, avgConfidence: r.avgConfidence }])
    ),
  };
}

// =============================================================================
// LLM API
// =============================================================================

export async function getLLMExamplesForPrompt(
  prompt: string,
  language?: string,
  limit: number = 10
): Promise<LLMExample[]> {
  const searchPattern = `%${prompt}%`;

  let query = 'SELECT * FROM llm_examples WHERE prompt LIKE ?';
  const params: any[] = [searchPattern];

  if (language) {
    query += ' AND language = ?';
    params.push(language);
  }

  query += ' ORDER BY quality_score DESC LIMIT ?';
  params.push(limit);

  const rows = db.query<LLMExampleRow, any[]>(query).all(...params);
  return rows.map(mapLLMExampleRow);
}

export async function getLLMExamplesForCommand(
  command: string,
  language?: string,
  limit: number = 10
): Promise<LLMExample[]> {
  const searchPattern = `%${command}%`;

  let query = 'SELECT * FROM llm_examples WHERE completion LIKE ?';
  const params: any[] = [searchPattern];

  if (language) {
    query += ' AND language = ?';
    params.push(language);
  }

  query += ' ORDER BY quality_score DESC LIMIT ?';
  params.push(limit);

  const rows = db.query<LLMExampleRow, any[]>(query).all(...params);
  return rows.map(mapLLMExampleRow);
}

export async function getLLMExamplesStats() {
  const totalRow = db.query<{ count: number }, []>('SELECT COUNT(*) as count FROM llm_examples').get();
  const total = totalRow?.count ?? 0;

  const avgRow = db.query<{ avg: number }, []>('SELECT AVG(quality_score) as avg FROM llm_examples').get();
  const avgQuality = avgRow?.avg ?? 0;

  const usageRow = db.query<{ total: number }, []>('SELECT SUM(usage_count) as total FROM llm_examples').get();
  const totalUsage = usageRow?.total ?? 0;

  const languageRows = db.query<{ language: string; count: number }, []>(
    'SELECT language, COUNT(*) as count FROM llm_examples GROUP BY language'
  ).all();
  const byLanguage: Record<string, number> = {};
  for (const row of languageRows) {
    byLanguage[row.language] = row.count;
  }

  return { total, avgQuality, totalUsage, byLanguage };
}

// =============================================================================
// Categories
// =============================================================================

const CATEGORIES = [
  'class-manipulation',
  'visibility',
  'event-handling',
  'dom-manipulation',
  'data-binding',
  'forms',
  'animation',
  'async',
  'conditional',
  'loops',
  'variables',
  'functions',
  'behaviors',
  'workers',
  'eventsource',
  'websocket',
  'http',
  'navigation',
  'debugging',
  'misc',
] as const;

export function getCategories(): string[] {
  return [...CATEGORIES];
}

// =============================================================================
// Languages
// =============================================================================

const LANGUAGES = [
  { code: 'en', name: 'English', wordOrder: 'SVO' as const },
  { code: 'es', name: 'Spanish', wordOrder: 'SVO' as const },
  { code: 'fr', name: 'French', wordOrder: 'SVO' as const },
  { code: 'pt', name: 'Portuguese', wordOrder: 'SVO' as const },
  { code: 'id', name: 'Indonesian', wordOrder: 'SVO' as const },
  { code: 'sw', name: 'Swahili', wordOrder: 'SVO' as const },
  { code: 'zh', name: 'Chinese', wordOrder: 'SVO' as const },
  { code: 'ja', name: 'Japanese', wordOrder: 'SOV' as const },
  { code: 'ko', name: 'Korean', wordOrder: 'SOV' as const },
  { code: 'tr', name: 'Turkish', wordOrder: 'SOV' as const },
  { code: 'qu', name: 'Quechua', wordOrder: 'SOV' as const },
  { code: 'ar', name: 'Arabic', wordOrder: 'VSO' as const },
  { code: 'de', name: 'German', wordOrder: 'V2' as const },
];

export function getLanguages() {
  return [...LANGUAGES];
}

// =============================================================================
// Pattern Roles
// =============================================================================

export interface PatternRole {
  id: number;
  codeExampleId: string;
  commandIndex: number;
  role: string;
  roleValue: string | null;
  roleType: string | null;
  required: boolean;
}

interface PatternRoleRow {
  id: number;
  code_example_id: string;
  command_index: number;
  role: string;
  role_value: string | null;
  role_type: string | null;
  required: number;
}

function mapPatternRoleRow(row: PatternRoleRow): PatternRole {
  return {
    id: row.id,
    codeExampleId: row.code_example_id,
    commandIndex: row.command_index,
    role: row.role,
    roleValue: row.role_value,
    roleType: row.role_type,
    required: Boolean(row.required),
  };
}

export async function getPatternRoles(patternId: string): Promise<PatternRole[]> {
  const rows = db
    .query<PatternRoleRow, [string]>(
      'SELECT * FROM pattern_roles WHERE code_example_id = ? ORDER BY command_index, role'
    )
    .all(patternId);
  return rows.map(mapPatternRoleRow);
}

export async function getRoleStats(): Promise<Record<string, number>> {
  const rows = db
    .query<{ role: string; count: number }, []>(
      'SELECT role, COUNT(*) as count FROM pattern_roles GROUP BY role ORDER BY count DESC'
    )
    .all();

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.role] = row.count;
  }
  return result;
}

export async function getPatternsByRole(role: string): Promise<Pattern[]> {
  const rows = db
    .query<PatternRow, [string]>(
      `SELECT DISTINCT ce.id, ce.title, ce.raw_code, ce.description, ce.feature, ce.source_url, ce.created_at
       FROM code_examples ce
       INNER JOIN pattern_roles pr ON ce.id = pr.code_example_id
       WHERE pr.role = ?
       ORDER BY ce.title`
    )
    .all(role);
  return rows.map(mapPatternRow);
}

// =============================================================================
// Cleanup
// =============================================================================

export function closeDatabase() {
  db.close();
}
