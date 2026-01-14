#!/usr/bin/env npx tsx
/**
 * Migrate Tokenizers to O(1) Map-based Lookups
 *
 * This script updates tokenizers to use the new lookupKeyword() and isKeyword()
 * methods instead of iterating through profileKeywords array.
 *
 * Patterns migrated:
 * 1. classifyToken() loops → isKeyword()
 * 2. Simple exact match loops → lookupKeyword()
 *
 * Patterns NOT migrated (must iterate):
 * - Multi-word phrase matching (tryMultiWordPhrase)
 * - Prefix matching (isKeywordStart)
 *
 * Usage:
 *   npx tsx scripts/migrate-to-map-lookup.ts          # Preview changes
 *   npx tsx scripts/migrate-to-map-lookup.ts --apply  # Apply changes
 */

import * as fs from 'fs';
import * as path from 'path';

const TOKENIZERS_DIR = path.join(__dirname, '..', 'src', 'tokenizers');

// Files to skip (already migrated or special)
const SKIP_FILES = ['base.ts', 'index.ts', 'hindi.ts', 'bengali.ts'];

interface Migration {
  file: string;
  line: number;
  before: string;
  after: string;
  type: 'classifyToken' | 'exactMatch' | 'morphMatch';
}

function findMigrations(content: string, filename: string): Migration[] {
  const migrations: Migration[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Pattern 1: classifyToken check - for loop returning 'keyword'
    // Before: for (const entry of this.profileKeywords) { if (lower === entry.native.toLowerCase()) return 'keyword'; }
    // After: if (this.isKeyword(token)) return 'keyword';
    if (
      line.includes('for (const entry of this.profileKeywords)') &&
      i + 1 < lines.length &&
      lines[i + 1].includes("return 'keyword'")
    ) {
      // Check if this is in classifyToken context (simple return 'keyword')
      const nextLine = lines[i + 1];
      if (
        nextLine.includes('=== entry.native') &&
        nextLine.includes("return 'keyword'")
      ) {
        // Find the variable being compared
        const varMatch = line.match(/const (\w+) = .*\.toLowerCase\(\)/);
        const prevLines = lines.slice(Math.max(0, i - 5), i).join('\n');
        const tokenVar = prevLines.match(/const (\w+) = (\w+)\.toLowerCase\(\)/)?.[2] || 'token';

        migrations.push({
          file: filename,
          line: lineNum,
          before: `for (const entry of this.profileKeywords) {
      if (... === entry.native.toLowerCase()) return 'keyword';
    }`,
          after: `if (this.isKeyword(${tokenVar})) return 'keyword';`,
          type: 'classifyToken',
        });
      }
    }

    // Pattern 2: Simple exact match lookup
    // Before: for (const entry of this.profileKeywords) { if (lower === entry.native.toLowerCase()) { return createToken(..., entry.normalized); } }
    // After: const entry = this.lookupKeyword(lower); if (entry) { return createToken(..., entry.normalized); }
    if (
      line.includes('for (const entry of this.profileKeywords)') &&
      i + 1 < lines.length &&
      lines[i + 1].includes('=== entry.native') &&
      !lines[i + 1].includes("return 'keyword'") // Not a classifyToken pattern
    ) {
      const nextLines = lines.slice(i, i + 5).join('\n');
      if (
        nextLines.includes('entry.normalized') &&
        !nextLines.includes('entry.native.includes')
      ) {
        // This is a simple exact match that can be optimized
        migrations.push({
          file: filename,
          line: lineNum,
          before: 'for (const entry of this.profileKeywords) { if (... === entry.native...) }',
          after: 'const keywordEntry = this.lookupKeyword(...); if (keywordEntry) { ... }',
          type: 'exactMatch',
        });
      }
    }
  }

  return migrations;
}

function applyClassifyTokenMigration(content: string): string {
  // Pattern: Replace classifyToken loop with isKeyword call
  // This regex matches the specific pattern in classifyToken methods
  const pattern =
    /\/\/ Check profile keywords \(case-insensitive\)\n(\s*)for \(const entry of this\.profileKeywords\) \{\n\s*if \((\w+) === entry\.native\.toLowerCase\(\)\) return 'keyword';\n\s*\}/g;

  return content.replace(pattern, (match, indent, varName) => {
    return `// O(1) Map lookup instead of O(n) array search\n${indent}if (this.isKeyword(${varName})) return 'keyword';`;
  });
}

function applyExactMatchMigration(content: string): string {
  // Pattern: Replace simple exact match loops with lookupKeyword
  // This is more complex - we need to handle multiple variations

  // Pattern for extractWord methods - exact match with createToken
  const extractPattern =
    /\/\/ Check if this is a known keyword \(exact match via profile keywords\)\n(\s*)for \(const entry of this\.profileKeywords\) \{\n\s*if \((\w+) === entry\.native\.toLowerCase\(\)\) \{\n\s*return createToken\((\w+), 'keyword', createPosition\((\w+), (\w+)\), entry\.normalized\);\n\s*\}\n\s*\}/g;

  content = content.replace(
    extractPattern,
    (match, indent, varName, wordVar, startVar, posVar) => {
      return `// O(1) Map lookup instead of O(n) array search
${indent}const keywordEntry = this.lookupKeyword(${varName});
${indent}if (keywordEntry) {
${indent}  return createToken(${wordVar}, 'keyword', createPosition(${startVar}, ${posVar}), keywordEntry.normalized);
${indent}}`;
    }
  );

  return content;
}

function migrateFile(filepath: string, apply: boolean): Migration[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const filename = path.basename(filepath);

  const migrations = findMigrations(content, filename);

  if (apply && migrations.length > 0) {
    let newContent = content;
    newContent = applyClassifyTokenMigration(newContent);
    newContent = applyExactMatchMigration(newContent);

    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf-8');
      console.log(`  [UPDATED] ${filename}`);
    }
  }

  return migrations;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');

  console.log('='.repeat(60));
  console.log('Tokenizer Migration to O(1) Map-based Lookups');
  console.log('='.repeat(60));
  console.log('');

  if (!apply) {
    console.log('Preview mode - use --apply to make changes\n');
  }

  const files = fs
    .readdirSync(TOKENIZERS_DIR)
    .filter(f => f.endsWith('.ts') && !SKIP_FILES.includes(f));

  let totalMigrations = 0;

  for (const file of files) {
    const filepath = path.join(TOKENIZERS_DIR, file);
    const migrations = migrateFile(filepath, apply);

    if (migrations.length > 0) {
      console.log(`${file}:`);
      for (const m of migrations) {
        console.log(`  Line ${m.line}: ${m.type}`);
        totalMigrations++;
      }
    }
  }

  console.log('');
  console.log(`Total migrations: ${totalMigrations}`);

  if (!apply && totalMigrations > 0) {
    console.log('\nRun with --apply to make changes');
  }
}

main().catch(console.error);
