/**
 * Extract Semantic Roles Script
 *
 * Parses all patterns in the database using the @lokascript/semantic parser
 * and extracts semantic roles into the pattern_roles table.
 *
 * Usage: npx tsx scripts/extract-roles.ts [--db-path <path>] [--verbose] [--clear]
 *
 * Options:
 *   --db-path <path>  Path to database file (default: ./data/patterns.db)
 *   --verbose         Show detailed extraction info
 *   --clear           Clear existing roles before extraction
 */

import Database from 'better-sqlite3';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { parse, canParse } from '@lokascript/semantic';
import type { SemanticNode, SemanticValue, SemanticRole } from '@lokascript/semantic';

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_DB_PATH = resolve(__dirname, '../data/patterns.db');

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const clearFirst = args.includes('--clear');
const dbPathIndex = args.indexOf('--db-path');
const dbPath = dbPathIndex >= 0 && args[dbPathIndex + 1] ? args[dbPathIndex + 1] : DEFAULT_DB_PATH;

// =============================================================================
// Types
// =============================================================================

interface CodeExampleRow {
  id: string;
  title: string;
  raw_code: string;
}

type RoleType = 'selector' | 'literal' | 'reference' | 'expression' | 'keyword';

interface ExtractedRole {
  codeExampleId: string;
  commandIndex: number;
  role: string;
  roleValue: string | null;
  roleType: RoleType | null;
  required: boolean;
}

// =============================================================================
// Role Extraction
// =============================================================================

/**
 * Determine the role type from a SemanticValue.
 */
function getRoleType(value: SemanticValue): RoleType {
  if (typeof value === 'string') {
    if (value.startsWith('.') || value.startsWith('#') || value.includes('[')) {
      return 'selector';
    }
    return 'literal';
  }

  if (typeof value === 'object' && value !== null) {
    if ('kind' in value) {
      switch (value.kind) {
        case 'selector':
          return 'selector';
        case 'literal':
          return 'literal';
        case 'reference':
          return 'reference';
        case 'property-path':
          return 'expression';
        case 'expression':
          return 'expression';
      }
    }
  }

  return 'literal';
}

/**
 * Extract a string representation of a SemanticValue.
 */
function getValueString(value: SemanticValue): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object' && value !== null) {
    // Handle objects with 'kind' property (typed semantic values)
    if ('kind' in value) {
      const v = value as any;
      switch (v.kind) {
        case 'selector':
          return v.selector || v.value || '';
        case 'literal':
          return String(v.value ?? '');
        case 'reference':
          return v.name || v.value || '';
        case 'property-path':
          return Array.isArray(v.path) ? v.path.join('.') : (v.value || '');
        case 'expression':
          return v.expression || v.value || '';
      }
    }

    // Try common property names for value extraction
    if ('value' in value) {
      return String((value as any).value);
    }
    if ('selector' in value) {
      return (value as any).selector;
    }
    if ('name' in value) {
      return (value as any).name;
    }

    // Last resort: try to serialize
    try {
      const str = JSON.stringify(value);
      // If it's a simple object, return a meaningful representation
      if (str.length < 100) {
        return str;
      }
    } catch {
      // Fall through
    }
  }

  return String(value);
}

/**
 * Extract roles from a semantic node.
 */
function extractRolesFromNode(
  node: SemanticNode,
  patternId: string,
  commandIndex: number
): ExtractedRole[] {
  const roles: ExtractedRole[] = [];

  // Add the action as an 'action' role
  roles.push({
    codeExampleId: patternId,
    commandIndex,
    role: 'action',
    roleValue: node.action,
    roleType: 'keyword',
    required: true,
  });

  // Extract all roles from the node
  for (const [role, value] of node.roles) {
    roles.push({
      codeExampleId: patternId,
      commandIndex,
      role,
      roleValue: getValueString(value),
      roleType: getRoleType(value),
      required: isRoleRequired(node.action, role),
    });
  }

  // Handle compound nodes (event handlers with body)
  if (node.kind === 'event-handler' && 'body' in node) {
    const eventNode = node as any;
    if (Array.isArray(eventNode.body)) {
      for (let i = 0; i < eventNode.body.length; i++) {
        const childRoles = extractRolesFromNode(
          eventNode.body[i],
          patternId,
          commandIndex + 1 + i
        );
        roles.push(...childRoles);
      }
    }
  }

  return roles;
}

/**
 * Determine if a role is required for a given action.
 */
function isRoleRequired(action: string, role: SemanticRole): boolean {
  const requiredRoles: Record<string, SemanticRole[]> = {
    toggle: ['patient'],
    add: ['patient'],
    remove: ['patient'],
    put: ['patient', 'destination'],
    set: ['destination', 'patient'],
    show: ['patient'],
    hide: ['patient'],
    fetch: ['source'],
    increment: ['patient'],
    decrement: ['patient'],
    wait: ['duration'],
    on: ['event'],
    send: ['event'],
    trigger: ['event'],
    focus: ['patient'],
    blur: [],
    log: ['patient'],
    go: ['destination'],
  };

  return requiredRoles[action]?.includes(role) || false;
}

/**
 * Parse a pattern and extract roles.
 */
function extractRolesFromPattern(
  patternId: string,
  code: string
): { roles: ExtractedRole[]; success: boolean; error?: string } {
  try {
    // Try to parse with the semantic parser
    if (!canParse(code, 'en')) {
      return { roles: [], success: false, error: 'Cannot parse with semantic parser' };
    }

    const result = parse(code, 'en');
    if (!result) {
      return { roles: [], success: false, error: 'Parse returned null' };
    }

    const roles = extractRolesFromNode(result, patternId, 0);
    return { roles, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { roles: [], success: false, error: message };
  }
}

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log('Extracting semantic roles from patterns...');
  console.log(`Database path: ${dbPath}`);

  // Check database exists
  if (!existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    console.log('Run init-db.ts first to create the database.');
    process.exit(1);
  }

  const db = new Database(dbPath);

  try {
    // Clear existing roles if requested
    if (clearFirst) {
      console.log('Clearing existing roles...');
      db.prepare('DELETE FROM pattern_roles').run();
    }

    // Get all patterns
    const patterns = db
      .prepare('SELECT id, title, raw_code FROM code_examples')
      .all() as CodeExampleRow[];

    console.log(`Found ${patterns.length} patterns to process`);

    // Prepare insert statement
    const insertRole = db.prepare(`
      INSERT OR REPLACE INTO pattern_roles
        (code_example_id, command_index, role, role_value, role_type, required)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Stats
    let successCount = 0;
    let failCount = 0;
    let totalRoles = 0;
    const roleStats: Record<string, number> = {};

    // Process each pattern
    for (const pattern of patterns) {
      const { roles, success, error } = extractRolesFromPattern(pattern.id, pattern.raw_code);

      if (success && roles.length > 0) {
        successCount++;
        totalRoles += roles.length;

        // Insert roles
        const transaction = db.transaction(() => {
          for (const role of roles) {
            insertRole.run(
              role.codeExampleId,
              role.commandIndex,
              role.role,
              role.roleValue,
              role.roleType,
              role.required ? 1 : 0
            );

            // Track stats
            roleStats[role.role] = (roleStats[role.role] || 0) + 1;
          }
        });
        transaction();

        if (verbose) {
          console.log(`  ✓ ${pattern.id}: ${roles.length} roles extracted`);
          for (const role of roles) {
            console.log(`      ${role.role}: ${role.roleValue} (${role.roleType})`);
          }
        }
      } else {
        failCount++;
        if (verbose) {
          console.log(`  ✗ ${pattern.id}: ${error || 'No roles extracted'}`);
        }
      }
    }

    // Print summary
    console.log('\n=== Extraction Summary ===');
    console.log(`Patterns processed: ${patterns.length}`);
    console.log(`  - Successful: ${successCount}`);
    console.log(`  - Failed: ${failCount}`);
    console.log(`Total roles extracted: ${totalRoles}`);

    console.log('\nRoles by type:');
    const sortedRoles = Object.entries(roleStats).sort((a, b) => b[1] - a[1]);
    for (const [role, count] of sortedRoles) {
      console.log(`  ${role}: ${count}`);
    }

    // Verify insertion
    const countResult = db.prepare('SELECT COUNT(*) as count FROM pattern_roles').get() as {
      count: number;
    };
    console.log(`\nDatabase now contains ${countResult.count} role records`);
  } finally {
    db.close();
  }
}

// Run
main();
