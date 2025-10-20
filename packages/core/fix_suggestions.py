#!/usr/bin/env python3
"""
Add missing 'suggestions' field to ValidationError objects that have 'type' but no 'suggestions'.
"""

import re
from pathlib import Path

def fix_file(file_path: Path) -> bool:
    try:
        content = file_path.read_text()
        lines = content.split('\n')
        result = []
        modified = False
        i = 0

        while i < len(lines):
            line = lines[i]
            result.append(line)

            # Check if this line has 'type:' for an error object
            if re.match(r'\s*type:\s*["\']', line):
                # Check next lines for message: and check if suggestions: exists
                found_message = False
                found_suggestions = False
                found_closing_brace = False
                message_line_idx = None
                closing_brace_idx = None

                for j in range(i + 1, min(i + 10, len(lines))):
                    if 'message:' in lines[j]:
                        found_message = True
                        message_line_idx = j
                    if 'suggestions:' in lines[j]:
                        found_suggestions = True
                    if re.match(r'\s*\}\s*$', lines[j]) or re.match(r'\s*\},?\s*$', lines[j]):
                        found_closing_brace = True
                        closing_brace_idx = j
                        break

                # If we found type and message but no suggestions, add it
                if found_message and not found_suggestions and found_closing_brace:
                    # Add all lines up to closing brace
                    for k in range(i + 1, closing_brace_idx):
                        result.append(lines[k])

                    # Add suggestions line before closing brace
                    indent = len(lines[closing_brace_idx]) - len(lines[closing_brace_idx].lstrip())
                    result.append(' ' * indent + 'suggestions: []')

                    # Add closing brace
                    result.append(lines[closing_brace_idx])

                    i = closing_brace_idx + 1
                    modified = True
                    continue

            i += 1

        if modified:
            file_path.write_text('\n'.join(result))
            print(f'Fixed: {file_path}')
            return True
        return False

    except Exception as e:
        print(f'Error: {file_path}: {e}')
        return False

def main():
    src_dir = Path('src')

    # Files that need fixing based on error output
    files_to_fix = [
        'expressions/enhanced-advanced/index.ts',
        'expressions/enhanced-comparison/index.ts',
        'expressions/enhanced-logical/comparisons.ts',
        'expressions/enhanced-logical/index.ts',
        'expressions/enhanced-logical/pattern-matching.ts',
        'expressions/enhanced-mathematical/index.ts',
        'expressions/enhanced-positional/index.ts',
        'expressions/enhanced-properties/index.ts',
        'expressions/enhanced-property/index.ts',
        'expressions/enhanced-special/index.ts',
        'expressions/enhanced-array/index.ts',
        'expressions/enhanced-symbol/index.ts',
        'expressions/enhanced-object/index.ts',
        'expressions/enhanced-function-calls/index.ts',
        'expressions/enhanced-in/index.ts',
        'context/backend-context.ts',
        'context/frontend-context.ts',
        'context/llm-generation-context.ts',
        'context/enhanced-context-registry.ts',
        'features/enhanced-sockets.ts',
        'features/enhanced-behaviors.ts',
        'features/enhanced-def.ts',
        'features/on.ts',
        'features/enhanced-eventsource.ts',
        'features/enhanced-webworker.ts',
        'features/enhanced-init.ts',
        'legacy/commands/async/wait.ts',
        'legacy/commands/async/fetch.ts',
    ]

    fixed_count = 0
    for file_rel_path in files_to_fix:
        file_path = src_dir / file_rel_path
        if file_path.exists():
            if fix_file(file_path):
                fixed_count += 1

    print(f'\nFixed {fixed_count} files')

if __name__ == '__main__':
    main()
