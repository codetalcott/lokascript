#!/usr/bin/env python3
"""
Script to fix ValidationError issues across the codebase.
Adds missing 'suggestions' field to all ValidationError objects.
"""

import re
import os
from pathlib import Path

def fix_validation_errors_in_file(filepath):
    """Fix ValidationError issues in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changes_made = 0

        # Pattern 1: Fix issues: string[] to ValidationError[]
        pattern1 = r'const (issues|errors): string\[\]'
        replacement1 = r'const \1: ValidationError[]'
        content, count1 = re.subn(pattern1, replacement1, content)
        changes_made += count1

        # Pattern 2: Fix issues.push('message') to issues.push({ type: ..., message: ..., suggestions: [] })
        pattern2 = r"issues\.push\('([^']+)'\)"
        replacement2 = r"issues.push({ type: 'invalid-argument', message: '\1', suggestions: [] })"
        content, count2 = re.subn(pattern2, replacement2, content)
        changes_made += count2

        # Pattern 3: Fix issues.push(`message`) to issues.push({ type: ..., message: ..., suggestions: [] })
        pattern3 = r'issues\.push\(`([^`]+)`\)'
        replacement3 = r"issues.push({ type: 'invalid-argument', message: `\1`, suggestions: [] })"
        content, count3 = re.subn(pattern3, replacement3, content)
        changes_made += count3

        # Pattern 4: Fix errors: [error.message] to errors: [{ type: 'syntax-error', message: error.message, suggestions: [] }]
        pattern4 = r'errors: \[error instanceof Error \? error\.message : ([^\]]+)\]'
        replacement4 = r"errors: [{ type: 'syntax-error', message: error instanceof Error ? error.message : \1, suggestions: [] }]"
        content, count4 = re.subn(pattern4, replacement4, content)
        changes_made += count4

        # Pattern 5: Fix objects missing suggestions field
        # Match: { type: '...', message: '...' } (without suggestions)
        # But not already having suggestions
        pattern5 = r'\{\s*type:\s*([\'"][^\'"]+[\'"]|\'[^\']+\'|"[^"]+"),\s*message:\s*([\'"`][^\'"` }]+[\'"`]|`[^`]+`)\s*\}'
        def add_suggestions(match):
            type_val = match.group(1)
            message_val = match.group(2)
            # Check if the original match already has suggestions
            return f'{{ type: {type_val}, message: {message_val}, suggestions: [] }}'

        # Be careful not to replace objects that already have suggestions
        # First mark objects that already have suggestions
        content_with_markers = re.sub(
            r'\{\s*type:\s*[^\}]+,\s*message:\s*[^\}]+,\s*suggestions:\s*\[[^\]]*\]\s*\}',
            lambda m: f'__ALREADY_HAS_SUGGESTIONS__{m.group(0)}__END_MARKER__',
            content
        )

        # Now fix objects without suggestions
        content_fixed = re.sub(pattern5, add_suggestions, content_with_markers)

        # Remove markers
        content_fixed = content_fixed.replace('__ALREADY_HAS_SUGGESTIONS__', '').replace('__END_MARKER__', '')

        if content_fixed != content:
            content = content_fixed
            changes_made += 1

        # Write back if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return changes_made

        return 0

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0

def main():
    """Main function to fix all files."""
    base_dir = Path('/Users/williamtalcott/projects/hyperfixi/packages/core/src')

    # Files to fix
    files_to_fix = [
        # Expression files
        'expressions/enhanced-object/index.ts',
        'expressions/enhanced-symbol/index.ts',
        'expressions/enhanced-special/index.ts',
        'expressions/enhanced-comparison/index.ts',

        # Command files
        'commands/animation/enhanced-take.ts',
        'commands/dom/put.ts',
        'commands/utility/enhanced-log.ts',
    ]

    total_changes = 0
    files_changed = 0

    for file_path in files_to_fix:
        full_path = base_dir / file_path
        if full_path.exists():
            changes = fix_validation_errors_in_file(str(full_path))
            if changes > 0:
                files_changed += 1
                total_changes += changes
                print(f"Fixed {changes} issues in {file_path}")
        else:
            print(f"File not found: {full_path}")

    print(f"\nTotal: Fixed {total_changes} issues in {files_changed} files")

if __name__ == '__main__':
    main()
