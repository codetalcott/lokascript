#!/usr/bin/env python3
"""
Script to add 'suggestions: []' to ValidationError objects that are missing it.
Handles both cases:
1. Need to add comma after previous property
2. Already has trailing comma
"""

import re
import sys
from pathlib import Path

def fix_validation_errors_in_file(file_path):
    """Fix ValidationError objects missing suggestions field in a file."""
    print(f"Processing {file_path}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes_made = 0

    # Pattern 1: Object with message as last property (no trailing comma)
    # Example: { type: "...", message: "..." }
    # Replace with: { type: "...", message: "...", suggestions: [] }
    pattern1 = re.compile(
        r'(\{\s*type:\s*[^,}]+,\s*message:\s*[^}]+)(\s*\})',
        re.MULTILINE | re.DOTALL
    )

    def replacement1(match):
        before = match.group(1)
        after = match.group(2)
        # Check if 'suggestions' is already present
        if 'suggestions' in before:
            return match.group(0)
        # Add comma and suggestions
        return before + ', suggestions: []' + after

    content = pattern1.sub(replacement1, content)

    # Pattern 2: Object with message followed by other properties but missing suggestions
    # Example: { type: "...", message: "...", path: "..." }
    # We need to find where to insert suggestions

    # Pattern 3: Multi-line ValidationError objects with message: ... on its own line
    # Example:
    #   {
    #     type: "...",
    #     message: "..."
    #   }
    pattern3 = re.compile(
        r'(\{\s*(?:(?:type|message|path|code|name|severity):\s*[^,\}]+,?\s*)+)(\s*\})',
        re.MULTILINE | re.DOTALL
    )

    def replacement3(match):
        before = match.group(1)
        after = match.group(2)

        # Check if suggestions is already present
        if 'suggestions' in before:
            return match.group(0)

        # Check if this looks like a ValidationError (has type and message)
        if 'type:' not in before or 'message:' not in before:
            return match.group(0)

        # Check if the last property has a trailing comma
        # Look for the pattern: property: value followed by optional whitespace and }
        last_prop_match = re.search(r':\s*([^,\}]+?)(\s*)$', before)
        if last_prop_match:
            # Check if there's already a comma
            value_part = last_prop_match.group(1).rstrip()
            whitespace = last_prop_match.group(2)

            if value_part.endswith(','):
                # Already has comma, just add suggestions with same indentation
                return before + '\n  suggestions: []' + after
            else:
                # Need to add comma
                return before + ', suggestions: []' + after

        return match.group(0)

    # Count changes
    if content != original_content:
        changes_made = content.count('suggestions: []') - original_content.count('suggestions: []')

        if changes_made > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Made {changes_made} fix(es)")
            return changes_made

    print(f"  - No changes needed")
    return 0

def main():
    # Files that need fixing based on typecheck output
    files_to_fix = [
        'packages/core/src/commands/animation/enhanced-take.ts',
        'packages/core/src/commands/dom/put.ts',
        'packages/core/src/context/backend-context.ts',
        'packages/core/src/context/enhanced-context-registry.ts',
        'packages/core/src/deno-mod.ts',
        'packages/core/src/expressions/enhanced-array/index.ts',
        'packages/core/src/expressions/enhanced-comparison/index.ts',
        'packages/core/src/expressions/enhanced-in/index.ts',
        'packages/core/src/expressions/enhanced-references/index.ts',
        'packages/core/src/expressions/enhanced-special/index.ts',
        'packages/core/src/features/enhanced-behaviors.ts',
        'packages/core/src/runtime/enhanced-command-adapter.ts',
        'packages/core/src/runtime/runtime.ts',
        'packages/core/src/types/enhanced-context.ts',
        'packages/core/src/types/unified-types.ts',
    ]

    base_path = Path(__file__).parent
    total_changes = 0

    for file_rel_path in files_to_fix:
        file_path = base_path / file_rel_path
        if file_path.exists():
            changes = fix_validation_errors_in_file(file_path)
            total_changes += changes
        else:
            print(f"Warning: File not found: {file_path}")

    print(f"\nTotal: {total_changes} fix(es) applied across {len(files_to_fix)} files")
    return 0 if total_changes > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
