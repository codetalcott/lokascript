/**
 * Derive English SYNTAX table from CommandSchema definitions.
 *
 * Instead of maintaining a hand-coded SYNTAX table that can drift from
 * the canonical schemas, this module generates it from the semantic
 * package's command-schemas + English profile.
 *
 * The generated table maps each command to ordered [role, preposition]
 * tuples for English rendering.
 */

import type { CommandSchema, RoleSpec, LanguageProfile } from '@lokascript/semantic';
import type { RoleMarker } from '@lokascript/semantic/core';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyntaxEntry = readonly [string, string][];
export type SyntaxTable = Record<string, SyntaxEntry>;

// ---------------------------------------------------------------------------
// Overrides for commands whose English rendering doesn't cleanly
// derive from schema roles (different role names, simplified structure, etc.)
// ---------------------------------------------------------------------------

/**
 * Commands where the SYNTAX rendering uses a different mapping
 * than what derives from schema roles + English profile.
 *
 * - repeat: Schema has loopType/quantity/event/source, but English renders
 *           as "repeat N" or "repeat until <condition>" using simplified roles
 * - go:     Schema uses 'to' marker for parsing ("go to /home"), but the
 *           adapter renders without preposition ("go /home")
 * - fetch:  Schema uses profile-default 'from' for parsing ("fetch from /api"),
 *           but the adapter renders without preposition ("fetch /api")
 */
const RENDER_OVERRIDES: SyntaxTable = {
  repeat: [
    ['quantity', ''],
    ['condition', 'until'],
  ],
  go: [['destination', '']],
  fetch: [
    ['source', ''],
    ['responseType', 'as'],
    ['method', 'via'],
    ['destination', 'on'],
  ],
};

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

/**
 * Resolve the English preposition for a role in a specific command.
 *
 * Priority:
 * 1. Command-specific markerOverride.en (highest)
 * 2. English profile's default roleMarker for this role
 * 3. '' (no preposition)
 */
function resolveEnglishPreposition(roleSpec: RoleSpec, profile: LanguageProfile): string {
  // 1. Command-specific override for English
  if (roleSpec.markerOverride?.en !== undefined) {
    return roleSpec.markerOverride.en;
  }

  // 2. Profile default for this role
  const roleMarker = (profile.roleMarkers as Record<string, RoleMarker | undefined>)[roleSpec.role];
  if (roleMarker) {
    return roleMarker.primary;
  }

  // 3. No preposition
  return '';
}

/**
 * Derive the SYNTAX table from command schemas and the English profile.
 *
 * For each command:
 * - Sort roles by svoPosition (English word order)
 * - Resolve each role's English preposition
 * - Return [role, preposition] tuples
 *
 * Commands in RENDER_OVERRIDES use their manual entry instead.
 */
export function deriveEnglishSyntax(
  schemas: Record<string, CommandSchema>,
  englishProfile: LanguageProfile
): SyntaxTable {
  const syntax: Record<string, [string, string][]> = {};

  for (const [action, schema] of Object.entries(schemas)) {
    // Use manual override for commands that don't derive cleanly
    if (RENDER_OVERRIDES[action]) {
      syntax[action] = RENDER_OVERRIDES[action] as [string, string][];
      continue;
    }

    // Sort roles by SVO position (English word order)
    const sortedRoles = [...schema.roles].sort(
      (a, b) => (a.svoPosition ?? 99) - (b.svoPosition ?? 99)
    );

    // Derive [role, preposition] tuples
    syntax[action] = sortedRoles.map(roleSpec => [
      roleSpec.role,
      resolveEnglishPreposition(roleSpec, englishProfile),
    ]);
  }

  return syntax;
}
