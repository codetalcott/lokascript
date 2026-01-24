#!/usr/bin/env tsx
/**
 * Run SQL File Script
 *
 * Executes a SQL file against the patterns database.
 *
 * Usage:
 *   npm run db:fix-translations
 *   tsx scripts/run-sql.ts scripts/fix-translations.sql
 */

import { readFileSync } from 'fs';
import { join, basename } from 'path';
import Database from 'better-sqlite3';

const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'patterns.db');

function main() {
  const sqlFile = process.argv[2];

  if (!sqlFile) {
    console.error('Usage: tsx scripts/run-sql.ts <sql-file>');
    console.error('Example: tsx scripts/run-sql.ts scripts/fix-translations.sql');
    process.exit(1);
  }

  const sqlPath = join(__dirname, '..', sqlFile);
  const sqlContent = readFileSync(sqlPath, 'utf-8');

  console.log(`\nRunning SQL file: ${basename(sqlFile)}`);
  console.log(`Database: ${DB_PATH}\n`);

  const db = new Database(DB_PATH);

  // Remove comment lines and split by semicolons
  const cleanedContent = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanedContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let executed = 0;
  let updated = 0;

  for (const stmt of statements) {
    try {
      const result = db.prepare(stmt + ';').run();
      executed++;
      if (result.changes > 0) {
        updated += result.changes;
      }
    } catch (error) {
      console.error(`Error executing statement:\n${stmt.slice(0, 100)}...`);
      console.error((error as Error).message);
      process.exit(1);
    }
  }

  console.log(`Executed ${executed} statements`);
  console.log(`Updated ${updated} rows`);
  console.log('Done.\n');

  db.close();
}

main();
