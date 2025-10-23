#!/bin/bash

# Script to fix ValidationError issues in expression files

# Fix enhanced-in/index.ts
sed -i '' 's/const issues: string\[\] = \[\]/const issues: ValidationError[] = []/g' packages/core/src/expressions/enhanced-in/index.ts
sed -i '' "s/issues\.push('\(.*\)')/issues.push({ type: 'invalid-argument', message: '\1', suggestions: [] })/g" packages/core/src/expressions/enhanced-in/index.ts
sed -i '' 's/errors: \[error instanceof Error ? error\.message : \(.*\)\]/errors: [{ type: "syntax-error", message: error instanceof Error ? error.message : \1, suggestions: [] }]/g' packages/core/src/expressions/enhanced-in/index.ts

# Fix enhanced-object/index.ts
sed -i '' 's/const issues: string\[\] = \[\]/const issues: ValidationError[] = []/g' packages/core/src/expressions/enhanced-object/index.ts
sed -i '' "s/issues\.push('\(.*\)')/issues.push({ type: 'invalid-argument', message: '\1', suggestions: [] })/g" packages/core/src/expressions/enhanced-object/index.ts
sed -i '' 's/errors: \[error instanceof Error ? error\.message : \(.*\)\]/errors: [{ type: "syntax-error", message: error instanceof Error ? error.message : \1, suggestions: [] }]/g' packages/core/src/expressions/enhanced-object/index.ts

# Fix enhanced-symbol/index.ts
sed -i '' 's/const issues: string\[\] = \[\]/const issues: ValidationError[] = []/g' packages/core/src/expressions/enhanced-symbol/index.ts
sed -i '' "s/issues\.push('\(.*\)')/issues.push({ type: 'invalid-argument', message: '\1', suggestions: [] })/g" packages/core/src/expressions/enhanced-symbol/index.ts
sed -i '' 's/errors: \[error instanceof Error ? error\.message : \(.*\)\]/errors: [{ type: "syntax-error", message: error instanceof Error ? error.message : \1, suggestions: [] }]/g' packages/core/src/expressions/enhanced-symbol/index.ts

echo "Fixed ValidationError issues in expression files"
