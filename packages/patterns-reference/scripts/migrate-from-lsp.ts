/**
 * Database Migration Script
 *
 * Migrates language documentation from hyperscript-lsp to patterns-reference.
 * Copies: commands, expressions, keywords, features, special_symbols, expression_operators
 *
 * Usage: npx tsx scripts/migrate-from-lsp.ts [--source <path>] [--target <path>] [--dry-run]
 *
 * Options:
 *   --source <path>  Path to hyperscript-lsp database (default: ~/projects/hyperscript-lsp/data/hyperscript.db)
 *   --target <path>  Path to patterns-reference database (default: ./data/patterns.db)
 *   --dry-run        Show what would be migrated without making changes
 */

import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

// =============================================================================
// Configuration
// =============================================================================

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const sourceIndex = args.indexOf('--source');
const SOURCE_DB_PATH =
  sourceIndex >= 0 && args[sourceIndex + 1]
    ? args[sourceIndex + 1]
    : resolve(homedir(), 'projects/hyperscript-lsp/data/hyperscript.db');

const targetIndex = args.indexOf('--target');
const TARGET_DB_PATH =
  targetIndex >= 0 && args[targetIndex + 1]
    ? args[targetIndex + 1]
    : resolve(__dirname, '../data/patterns.db');

// =============================================================================
// New Schema for Language Documentation
// =============================================================================

const LANGUAGE_DOCS_SCHEMA = `
-- Commands documentation
CREATE TABLE IF NOT EXISTS commands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  syntax TEXT,
  purpose TEXT,
  implicit_target TEXT,
  implicit_result_target TEXT,
  is_blocking INTEGER DEFAULT 0,
  has_body INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Expressions documentation
CREATE TABLE IF NOT EXISTS expressions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  evaluates_to_type TEXT,
  precedence INTEGER,
  associativity TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Expression operators
CREATE TABLE IF NOT EXISTS expression_operators (
  id TEXT PRIMARY KEY,
  expression_id TEXT NOT NULL REFERENCES expressions(id),
  operator TEXT NOT NULL
);

-- Keywords documentation
CREATE TABLE IF NOT EXISTS keywords (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  context_of_use TEXT,
  is_optional INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Features (top-level constructs)
CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  syntax TEXT,
  trigger TEXT,
  structure_description TEXT,
  scope_impact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Special symbols (me, it, my, you, your)
CREATE TABLE IF NOT EXISTS special_symbols (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  symbol_type TEXT NOT NULL,
  description TEXT,
  typical_value TEXT,
  scope_implications TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for language docs
CREATE INDEX IF NOT EXISTS idx_commands_name ON commands(name);
CREATE INDEX IF NOT EXISTS idx_expressions_name ON expressions(name);
CREATE INDEX IF NOT EXISTS idx_expressions_category ON expressions(category);
CREATE INDEX IF NOT EXISTS idx_keywords_name ON keywords(name);
CREATE INDEX IF NOT EXISTS idx_features_name ON features(name);
CREATE INDEX IF NOT EXISTS idx_special_symbols_name ON special_symbols(name);
CREATE INDEX IF NOT EXISTS idx_expression_operators_expr ON expression_operators(expression_id);
`;

// =============================================================================
// Migration Logic
// =============================================================================

function migrate(): void {
  console.log('Database Migration: hyperscript-lsp -> patterns-reference');
  console.log('='.repeat(60));
  console.log(`Source: ${SOURCE_DB_PATH}`);
  console.log(`Target: ${TARGET_DB_PATH}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  // Verify source exists
  if (!existsSync(SOURCE_DB_PATH)) {
    console.error(`ERROR: Source database not found: ${SOURCE_DB_PATH}`);
    process.exit(1);
  }

  // Verify target exists
  if (!existsSync(TARGET_DB_PATH)) {
    console.error(`ERROR: Target database not found: ${TARGET_DB_PATH}`);
    console.error('Run: npx tsx scripts/init-db.ts first');
    process.exit(1);
  }

  // Open databases
  const sourceDb = new Database(SOURCE_DB_PATH, { readonly: true });
  const targetDb = dryRun
    ? new Database(':memory:')
    : new Database(TARGET_DB_PATH);

  // For dry run, copy existing schema to memory (skip internal tables)
  if (dryRun) {
    const realTarget = new Database(TARGET_DB_PATH, { readonly: true });
    const schema = realTarget
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'")
      .all() as { sql: string }[];
    for (const { sql } of schema) {
      targetDb.exec(sql);
    }
    realTarget.close();
  }

  try {
    // Create new tables
    console.log('Creating language documentation tables...');
    targetDb.exec(LANGUAGE_DOCS_SCHEMA);

    // Migrate commands
    const commands = sourceDb
      .prepare(
        `SELECT id, name, description, syntax_canonical as syntax, purpose,
                implicit_target, implicit_result_target, is_blocking, has_body,
                created_at, updated_at
         FROM commands`
      )
      .all() as any[];
    console.log(`  Commands: ${commands.length} rows`);

    if (!dryRun && commands.length > 0) {
      const insertCmd = targetDb.prepare(`
        INSERT OR REPLACE INTO commands
        (id, name, description, syntax, purpose, implicit_target, implicit_result_target, is_blocking, has_body, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const cmd of commands) {
        insertCmd.run(
          cmd.id,
          cmd.name,
          cmd.description,
          cmd.syntax,
          cmd.purpose,
          cmd.implicit_target,
          cmd.implicit_result_target,
          cmd.is_blocking,
          cmd.has_body,
          cmd.created_at,
          cmd.updated_at
        );
      }
    }

    // Migrate expressions
    const expressions = sourceDb
      .prepare(
        `SELECT id, name, description, category, evaluates_to_type, precedence, associativity,
                created_at, updated_at
         FROM expressions`
      )
      .all() as any[];
    console.log(`  Expressions: ${expressions.length} rows`);

    if (!dryRun && expressions.length > 0) {
      const insertExpr = targetDb.prepare(`
        INSERT OR REPLACE INTO expressions
        (id, name, description, category, evaluates_to_type, precedence, associativity, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const expr of expressions) {
        insertExpr.run(
          expr.id,
          expr.name,
          expr.description,
          expr.category,
          expr.evaluates_to_type,
          expr.precedence,
          expr.associativity,
          expr.created_at,
          expr.updated_at
        );
      }
    }

    // Migrate expression operators
    const operators = sourceDb
      .prepare(`SELECT id, expression_id, operator FROM expression_operators`)
      .all() as any[];
    console.log(`  Expression operators: ${operators.length} rows`);

    if (!dryRun && operators.length > 0) {
      const insertOp = targetDb.prepare(`
        INSERT OR REPLACE INTO expression_operators (id, expression_id, operator)
        VALUES (?, ?, ?)
      `);
      for (const op of operators) {
        insertOp.run(op.id, op.expression_id, op.operator);
      }
    }

    // Migrate keywords
    const keywords = sourceDb
      .prepare(
        `SELECT id, name, description, context_of_use, is_optional_in_syntax as is_optional,
                created_at, updated_at
         FROM keywords`
      )
      .all() as any[];
    console.log(`  Keywords: ${keywords.length} rows`);

    if (!dryRun && keywords.length > 0) {
      const insertKw = targetDb.prepare(`
        INSERT OR REPLACE INTO keywords
        (id, name, description, context_of_use, is_optional, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const kw of keywords) {
        insertKw.run(
          kw.id,
          kw.name,
          kw.description,
          kw.context_of_use,
          kw.is_optional,
          kw.created_at,
          kw.updated_at
        );
      }
    }

    // Migrate features
    const features = sourceDb
      .prepare(
        `SELECT id, name, description, syntax_canonical as syntax, trigger,
                structure_description, scope_impact, created_at, updated_at
         FROM features`
      )
      .all() as any[];
    console.log(`  Features: ${features.length} rows`);

    if (!dryRun && features.length > 0) {
      const insertFeat = targetDb.prepare(`
        INSERT OR REPLACE INTO features
        (id, name, description, syntax, trigger, structure_description, scope_impact, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const feat of features) {
        insertFeat.run(
          feat.id,
          feat.name,
          feat.description,
          feat.syntax,
          feat.trigger,
          feat.structure_description,
          feat.scope_impact,
          feat.created_at,
          feat.updated_at
        );
      }
    }

    // Migrate special symbols
    const symbols = sourceDb
      .prepare(
        `SELECT id, name, symbol, symbol_type, description,
                typical_value_or_referent as typical_value, scope_implications,
                created_at, updated_at
         FROM special_symbols`
      )
      .all() as any[];
    console.log(`  Special symbols: ${symbols.length} rows`);

    if (!dryRun && symbols.length > 0) {
      const insertSym = targetDb.prepare(`
        INSERT OR REPLACE INTO special_symbols
        (id, name, symbol, symbol_type, description, typical_value, scope_implications, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const sym of symbols) {
        insertSym.run(
          sym.id,
          sym.name,
          sym.symbol,
          sym.symbol_type,
          sym.description,
          sym.typical_value,
          sym.scope_implications,
          sym.created_at,
          sym.updated_at
        );
      }
    }

    console.log('');
    console.log('Migration complete!');
    console.log('');

    // Verify counts
    if (!dryRun) {
      const counts = {
        commands: (targetDb.prepare('SELECT COUNT(*) as count FROM commands').get() as any).count,
        expressions: (targetDb.prepare('SELECT COUNT(*) as count FROM expressions').get() as any)
          .count,
        expression_operators: (
          targetDb.prepare('SELECT COUNT(*) as count FROM expression_operators').get() as any
        ).count,
        keywords: (targetDb.prepare('SELECT COUNT(*) as count FROM keywords').get() as any).count,
        features: (targetDb.prepare('SELECT COUNT(*) as count FROM features').get() as any).count,
        special_symbols: (
          targetDb.prepare('SELECT COUNT(*) as count FROM special_symbols').get() as any
        ).count,
      };
      console.log('Final counts in target database:');
      for (const [table, count] of Object.entries(counts)) {
        console.log(`  ${table}: ${count}`);
      }
    }
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

// Run migration
migrate();
