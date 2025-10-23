#!/usr/bin/env python3
"""
Script to fix TypedResult errors missing 'error' field.
Adds error field to all TypedResult objects that have success: false.
"""

import re
from pathlib import Path

def fix_typed_result_errors(filepath):
    """Fix TypedResult errors in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changes_made = 0

        # Pattern: Find { success: false, errors: [...], suggestions: [...] }
        # And add error field before errors

        # This is complex, so we'll use a more sophisticated approach
        lines = content.split('\n')
        new_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]

            # Check if this line contains "success: false,"
            if 'success: false,' in line:
                # Look ahead to see if there's an errors field but no error field
                j = i
                has_error_field = False
                has_errors_field = False
                indent = len(line) - len(line.lstrip())

                # Look at the next 10 lines for context
                for k in range(i, min(i + 10, len(lines))):
                    if 'error:' in lines[k] and 'errors:' not in lines[k]:
                        has_error_field = True
                        break
                    if 'errors:' in lines[k]:
                        has_errors_field = True
                        break

                # If we have errors but no error, we need to add it
                if has_errors_field and not has_error_field:
                    # Add the line
                    new_lines.append(line)

                    # Add error field before errors
                    error_line = ' ' * (indent + 2) + 'error: {'
                    new_lines.append(error_line)
                    new_lines.append(' ' * (indent + 4) + "name: 'EvaluationError',")
                    new_lines.append(' ' * (indent + 4) + "message: 'Evaluation failed',")
                    new_lines.append(' ' * (indent + 4) + "code: 'EVALUATION_ERROR',")
                    new_lines.append(' ' * (indent + 4) + "suggestions: []")
                    new_lines.append(' ' * (indent + 2) + '},')

                    changes_made += 1
                    i += 1
                    continue

            new_lines.append(line)
            i += 1

        content = '\n'.join(new_lines)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return changes_made

        return 0

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0

def main():
    """Main function."""
    file_path = Path('/Users/williamtalcott/projects/hyperfixi/packages/core/src/expressions/enhanced-special/index.ts')

    if file_path.exists():
        changes = fix_typed_result_errors(str(file_path))
        print(f"Fixed {changes} TypedResult errors in enhanced-special/index.ts")
    else:
        print(f"File not found: {file_path}")

if __name__ == '__main__':
    main()
