#!/bin/bash
#

 Script to fix all remaining ValidationError and TypedResult issues

set -e

echo "Fixing remaining ValidationError and TypedResult issues..."

# Function to add error field before errors field in TypedResult
add_error_field() {
    local file=$1
    # This uses perl for multi-line regex replacement
    perl -i -0pe 's/(\s+return \{\s+success: false,)\s+(errors: \[)/$1\n        error: {\n          name: "EvaluationError",\n          message: "Evaluation failed",\n          code: "EVALUATION_ERROR",\n          suggestions: []\n        },\n        $2/g' "$file"
}

# Fix enhanced-special/index.ts
echo "Fixing enhanced-special/index.ts..."
add_error_field "packages/core/src/expressions/enhanced-special/index.ts"

echo "Done! Please run typecheck to verify."
