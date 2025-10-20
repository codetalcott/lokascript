#!/usr/bin/env python3
"""
Script to fix TS2741 errors by adding missing 'type' property to ValidationError objects.
Only adds 'type', does NOT add 'suggestions'.
"""

import re
import sys
from pathlib import Path

def fix_error_object(content: str) -> str:
    """
    Fix error objects that are missing the 'type' property.
    """
    lines = content.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Check if this line contains "error: {"
        if re.search(r'error:\s*\{', line):
            # Check the next few lines for 'message:' without 'type:' appearing first
            has_type = False
            has_message = False
            message_line_idx = None

            # Look ahead up to 5 lines
            for j in range(i, min(i + 6, len(lines))):
                if 'type:' in lines[j] and j < len(lines):
                    has_type = True
                    break
                if 'message:' in lines[j]:
                    has_message = True
                    message_line_idx = j
                    break

            # If we found message without type, add type
            if has_message and not has_type and message_line_idx is not None:
                # Determine the appropriate type based on context
                error_type = determine_error_type(lines, i, message_line_idx)

                # Get the indentation of the message line
                message_line = lines[message_line_idx]
                indent = len(message_line) - len(message_line.lstrip())
                indent_str = ' ' * indent

                # Insert type line before message
                type_line = f"{indent_str}type: '{error_type}',"
                result.append(line)  # Add the error: { line

                # Add lines between error: { and message:
                for k in range(i + 1, message_line_idx):
                    result.append(lines[k])

                # Add type line
                result.append(type_line)
                # Add message line
                result.append(lines[message_line_idx])

                # Skip to after message line
                i = message_line_idx + 1
                continue

        result.append(line)
        i += 1

    return '\n'.join(result)

def determine_error_type(lines: list, error_line_idx: int, message_line_idx: int) -> str:
    """
    Determine the appropriate error type based on context.
    """
    # Look at the message content to determine type
    message_line = lines[message_line_idx]
    message_lower = message_line.lower()

    # Check code field if present
    for j in range(message_line_idx, min(message_line_idx + 3, len(lines))):
        if 'code:' in lines[j]:
            code_line = lines[j].lower()
            if 'validation' in code_line:
                return 'validation-error'
            if 'missing' in code_line or 'no_' in code_line or 'required' in code_line:
                return 'missing-argument'
            if 'invalid' in code_line or 'bad' in code_line:
                return 'invalid-argument'
            if 'syntax' in code_line or 'parse' in code_line:
                return 'syntax-error'
            if 'type' in code_line or 'mismatch' in code_line:
                return 'type-mismatch'
            if 'execution' in code_line or 'failed' in code_line or 'runtime' in code_line:
                return 'runtime-error'
            if 'context' in code_line:
                return 'context-error'

    # Check message content
    if 'validation' in message_lower or 'validate' in message_lower:
        return 'validation-error'
    if 'missing' in message_lower or 'required' in message_lower or 'no ' in message_lower:
        return 'missing-argument'
    if 'invalid' in message_lower or 'bad' in message_lower:
        return 'invalid-argument'
    if 'syntax' in message_lower or 'parse' in message_lower:
        return 'syntax-error'
    if 'type' in message_lower or 'not a' in message_lower or 'not an' in message_lower:
        return 'type-mismatch'
    if 'context' in message_lower:
        return 'context-error'

    # Default to runtime-error for execution failures
    return 'runtime-error'

def process_file(file_path: Path) -> bool:
    """Process a single file and fix validation errors."""
    try:
        content = file_path.read_text()
        original_content = content

        # Fix error objects
        fixed_content = fix_error_object(content)

        if fixed_content != original_content:
            file_path.write_text(fixed_content)
            print(f"Fixed: {file_path}")
            return True
        else:
            return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}", file=sys.stderr)
        return False

def main():
    """Main function."""
    # Get the source directory
    src_dir = Path(__file__).parent / 'src'

    if not src_dir.exists():
        print(f"Error: Source directory not found: {src_dir}", file=sys.stderr)
        sys.exit(1)

    # Find all TypeScript files (excluding tests)
    ts_files = [
        f for f in src_dir.rglob('*.ts')
        if f.is_file() and not str(f).endswith('.test.ts')
    ]

    fixed_count = 0
    for file_path in ts_files:
        if process_file(file_path):
            fixed_count += 1

    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
