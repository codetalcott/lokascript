# napi-rs Patterns Implementation: Next Steps Plan

## Overview

This plan outlines the implementation of remaining napi-rs-inspired patterns for LokaScript, building on the completed Expression Type Registry and Command Metadata System.

**Status**: Planning
**Estimated Effort**: 3-5 days total
**Priority**: Medium (incremental improvements, no blocking issues)

---

## Step 1: Expand Command Side Effects List

**Effort**: 2-4 hours
**Risk**: Very Low

### Current State

The audit reports 20 warnings for valid but unlisted side effects:

- `control-flow`, `console-output`, `clipboard-write`, `context-mutation`
- `data-binding`, `event-listeners`, `dom-observation`
- `property-transfer`, `event-dispatching`, `random-selection`
- `function-execution`, `method-execution`, `async-execution`
- `error-throwing`, `execution-termination`, `event-prevention`
- `dom-creation`, `template-execution`, `behavior-installation`, `element-modification`
- `debugging`, `custom-events`, `state-mutation`

### Implementation

**File**: `packages/core/src/types/command-metadata.ts`

```typescript
// Add to COMMAND_SIDE_EFFECTS array:
export const COMMAND_SIDE_EFFECTS = [
  // Existing effects
  'dom-mutation',
  'dom-query',
  'context-modification',
  'conditional-execution',
  'iteration',
  'time',
  'event-listening',
  'event-dispatch',
  'context-switching',
  'command-execution',
  'data-mutation',
  'code-execution',
  'network',
  'storage',
  'navigation',
  'animation',
  'focus',
  'scroll',
  'clipboard',
  'console',

  // New effects (from audit warnings)
  'control-flow',
  'console-output',
  'clipboard-write',
  'context-mutation',
  'data-binding',
  'event-listeners',
  'dom-observation',
  'property-transfer',
  'event-dispatching',
  'random-selection',
  'function-execution',
  'method-execution',
  'async-execution',
  'error-throwing',
  'execution-termination',
  'event-prevention',
  'dom-creation',
  'template-execution',
  'behavior-installation',
  'element-modification',
  'debugging',
  'custom-events',
  'state-mutation',
] as const;
```

### Validation

```bash
npx tsx scripts/audit-command-metadata.ts
# Expected: 0 errors, 0 warnings, 44 passed
```

---

## Step 2: Auto-Generate Command Documentation

**Effort**: 1-2 days
**Risk**: Low

### Objectives

1. Generate markdown reference documentation from metadata
2. Create JSON schema for IDE tooling
3. Build searchable command index

### Implementation Plan

#### 2.1 Create Documentation Generator Script

**File**: `packages/core/scripts/generate-command-docs.ts`

```typescript
#!/usr/bin/env npx tsx
/**
 * Command Documentation Generator
 *
 * Generates markdown documentation from command metadata.
 *
 * Usage:
 *   npx tsx scripts/generate-command-docs.ts
 *   npx tsx scripts/generate-command-docs.ts --format json
 *   npx tsx scripts/generate-command-docs.ts --output docs/commands/
 */

import {
  CommandMetadata,
  CommandCategory,
  COMMAND_CATEGORIES,
} from '../src/types/command-metadata';

// Import all commands (same as audit script)
// ... command imports ...

interface DocOptions {
  format: 'markdown' | 'json' | 'html';
  output: string;
  includeExamples: boolean;
  groupByCategory: boolean;
}

function generateMarkdown(commands: Map<string, CommandMetadata>): string {
  const lines: string[] = [];

  lines.push('# LokaScript Command Reference');
  lines.push('');
  lines.push('> Auto-generated from command metadata');
  lines.push('');

  // Group by category
  for (const category of COMMAND_CATEGORIES) {
    const categoryCommands = [...commands.entries()].filter(
      ([_, meta]) => meta.category === category
    );

    if (categoryCommands.length === 0) continue;

    lines.push(`## ${formatCategoryName(category)}`);
    lines.push('');

    for (const [name, meta] of categoryCommands) {
      lines.push(`### ${name}`);
      lines.push('');
      lines.push(meta.description);
      lines.push('');
      lines.push('**Syntax:**');
      const syntaxes = Array.isArray(meta.syntax) ? meta.syntax : [meta.syntax];
      for (const syn of syntaxes) {
        lines.push(`\`\`\`hyperscript`);
        lines.push(syn);
        lines.push(`\`\`\``);
      }
      lines.push('');

      if (meta.examples.length > 0) {
        lines.push('**Examples:**');
        lines.push('');
        for (const example of meta.examples) {
          lines.push(`\`\`\`hyperscript`);
          lines.push(example);
          lines.push(`\`\`\``);
        }
        lines.push('');
      }

      if (meta.sideEffects?.length) {
        lines.push(`**Side Effects:** ${meta.sideEffects.join(', ')}`);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

function generateJSON(commands: Map<string, CommandMetadata>): string {
  const output = {
    $schema: 'https://lokascript.dev/schemas/commands.json',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    categories: COMMAND_CATEGORIES,
    commands: Object.fromEntries(commands),
  };
  return JSON.stringify(output, null, 2);
}
```

#### 2.2 Output Formats

**Markdown** (`docs/commands/REFERENCE.md`):

- Human-readable documentation
- Grouped by category
- Examples with syntax highlighting

**JSON** (`docs/commands/commands.json`):

- IDE tooling integration
- Programmatic access
- Schema validation

**TypeScript Types** (`src/types/generated-commands.d.ts`):

- Type-safe command names
- Autocomplete support

#### 2.3 Integration with Build

Add to `package.json`:

```json
{
  "scripts": {
    "docs:commands": "tsx scripts/generate-command-docs.ts",
    "docs:commands:json": "tsx scripts/generate-command-docs.ts --format json",
    "prebuild": "npm run docs:commands"
  }
}
```

---

## Step 3: Expression Type Coverage Validation

**Effort**: 1 day
**Risk**: Low

### Objectives

1. Validate all expression evaluators use the type registry
2. Report expressions with missing type mappings
3. Generate type coverage report

### Implementation Plan

#### 3.1 Create Type Coverage Analyzer

**File**: `packages/core/scripts/analyze-expression-types.ts`

```typescript
#!/usr/bin/env npx tsx
/**
 * Expression Type Coverage Analyzer
 *
 * Validates that expression evaluators use the type registry
 * and reports coverage gaps.
 */

import { expressionTypeRegistry } from '../src/expressions/type-registry';
import * as fs from 'fs';
import * as path from 'path';

interface ExpressionFile {
  path: string;
  usesRegistry: boolean;
  typeInferences: string[];
  typeCoercions: string[];
  issues: string[];
}

async function analyzeExpressionFiles(): Promise<ExpressionFile[]> {
  const expressionsDir = path.join(__dirname, '../src/expressions');
  const results: ExpressionFile[] = [];

  // Find all expression implementation files
  const files = findExpressionFiles(expressionsDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const analysis = analyzeFile(file, content);
    results.push(analysis);
  }

  return results;
}

function analyzeFile(filePath: string, content: string): ExpressionFile {
  const issues: string[] = [];

  // Check for type registry imports
  const hasRegistryImport =
    content.includes('type-registry') ||
    content.includes('inferExpressionType') ||
    content.includes('coerceToType');

  // Find inline type checks that should use registry
  const inlineTypeChecks = [
    /typeof\s+\w+\s*===?\s*['"]string['"]/g,
    /typeof\s+\w+\s*===?\s*['"]number['"]/g,
    /instanceof\s+Array/g,
    /Array\.isArray\(/g,
  ];

  for (const pattern of inlineTypeChecks) {
    const matches = content.match(pattern);
    if (matches && matches.length > 3) {
      issues.push(`Consider using type registry for ${matches.length} type checks`);
    }
  }

  // Find type coercions
  const coercionPatterns = [
    /Number\(\w+\)/g,
    /String\(\w+\)/g,
    /Boolean\(\w+\)/g,
    /parseInt\(/g,
    /parseFloat\(/g,
  ];

  const typeCoercions: string[] = [];
  for (const pattern of coercionPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      typeCoercions.push(...matches);
    }
  }

  if (typeCoercions.length > 0 && !hasRegistryImport) {
    issues.push(`${typeCoercions.length} type coercions could use registry`);
  }

  return {
    path: filePath,
    usesRegistry: hasRegistryImport,
    typeInferences: [],
    typeCoercions,
    issues,
  };
}

function generateReport(results: ExpressionFile[]): void {
  console.log('========================================');
  console.log('  Expression Type Coverage Report');
  console.log('========================================\n');

  const usingRegistry = results.filter(r => r.usesRegistry).length;
  const withIssues = results.filter(r => r.issues.length > 0);

  console.log(`Files analyzed: ${results.length}`);
  console.log(`Using type registry: ${usingRegistry}`);
  console.log(`Files with suggestions: ${withIssues.length}\n`);

  if (withIssues.length > 0) {
    console.log('--- Suggestions ---\n');
    for (const file of withIssues) {
      console.log(`${file.path}:`);
      for (const issue of file.issues) {
        console.log(`  - ${issue}`);
      }
      console.log('');
    }
  }

  // Type coverage by category
  console.log('--- Registry Type Coverage ---\n');
  const stats = expressionTypeRegistry.getStats();
  console.log(`Registered types: ${stats.typeCount}`);
  console.log(`Types: ${stats.typeNames.join(', ')}`);
}
```

#### 3.2 Integration

Add to CI/pre-commit:

```bash
npx tsx scripts/analyze-expression-types.ts --strict
```

---

## Step 4: Alternatives to TC39 Decorators

**Effort**: Research + 1 day implementation
**Risk**: Low (additive, non-breaking)

### Current TC39 Decorator Status

- Stage 3 (as of 2024)
- TypeScript 5.0+ has experimental support
- Not yet finalized, syntax may change

### Alternative Approaches

#### 4.1 Builder Pattern (Recommended)

Use a fluent builder API instead of decorators:

```typescript
// Instead of:
@Command('add')
@Category('dom')
@SideEffects(['dom-mutation'])
class AddCommand { ... }

// Use builder pattern:
const AddCommand = defineCommand('add')
  .category('dom')
  .sideEffects(['dom-mutation'])
  .syntax('add <classes> [to <target>]')
  .examples([
    'add .active to me',
    'add .highlight to <button/>',
  ])
  .parseInput(async (raw, evaluator, context) => {
    // Parse implementation
  })
  .execute(async (input, context) => {
    // Execute implementation
  })
  .build();
```

**Implementation**:

```typescript
// packages/core/src/commands/command-builder.ts

export interface CommandBuilder<TInput, TOutput> {
  category(cat: CommandCategory): this;
  sideEffects(effects: CommandSideEffect[]): this;
  syntax(syn: string | string[]): this;
  examples(ex: string[]): this;
  description(desc: string): this;
  parseInput(fn: ParseInputFn<TInput>): this;
  execute(fn: ExecuteFn<TInput, TOutput>): this;
  validate(fn: ValidateFn<TInput>): this;
  build(): Command<TInput, TOutput>;
}

export function defineCommand(name: string): CommandBuilder<unknown, unknown> {
  return new CommandBuilderImpl(name);
}

class CommandBuilderImpl<TInput, TOutput> implements CommandBuilder<TInput, TOutput> {
  private _metadata: Partial<CommandMetadata> = {};
  private _parseInput?: ParseInputFn<TInput>;
  private _execute?: ExecuteFn<TInput, TOutput>;
  private _validate?: ValidateFn<TInput>;

  constructor(private _name: string) {}

  category(cat: CommandCategory): this {
    this._metadata.category = cat;
    return this;
  }

  sideEffects(effects: CommandSideEffect[]): this {
    this._metadata.sideEffects = effects;
    return this;
  }

  // ... other methods ...

  build(): Command<TInput, TOutput> {
    // Validate all required fields
    if (!this._parseInput) throw new Error('parseInput is required');
    if (!this._execute) throw new Error('execute is required');
    if (!this._metadata.category) throw new Error('category is required');

    const metadata = {
      ...this._metadata,
      description: this._metadata.description || `The ${this._name} command`,
      syntax: this._metadata.syntax || this._name,
      examples: this._metadata.examples || [],
    } as CommandMetadata;

    return {
      name: this._name,
      metadata,
      parseInput: this._parseInput,
      execute: this._execute,
      validate: this._validate,
    };
  }
}
```

**Benefits**:

- No experimental features required
- Full TypeScript type inference
- Chainable, readable API
- Works with current tooling
- Easy to migrate to decorators later

#### 4.2 Factory Functions with Options Object

```typescript
const AddCommand = createCommand({
  name: 'add',
  metadata: {
    category: 'dom',
    sideEffects: ['dom-mutation'],
    syntax: 'add <classes> [to <target>]',
    examples: ['add .active to me'],
  },
  parseInput: async (raw, evaluator, context) => { ... },
  execute: async (input, context) => { ... },
});
```

**Benefits**:

- Simple, explicit
- Easy to understand
- Good IDE support

#### 4.3 Class Mixins

```typescript
const AddCommand = withMetadata({
  category: 'dom',
  sideEffects: ['dom-mutation'],
})(
  class extends BaseCommand {
    async parseInput(...) { ... }
    async execute(...) { ... }
  }
);
```

**Benefits**:

- Preserves class structure
- Composable

### Recommendation

**Use Builder Pattern (4.1)** for new commands:

- Most flexible
- Best TypeScript support
- No experimental features
- Easy future migration to decorators

Keep existing class-based commands for backward compatibility, but provide builder as preferred pattern for new development.

---

## Implementation Timeline

| Phase | Task                        | Effort    | Priority |
| ----- | --------------------------- | --------- | -------- |
| 1     | Expand side effects list    | 2-4 hours | High     |
| 2a    | Create doc generator script | 4 hours   | Medium   |
| 2b    | Generate markdown docs      | 2 hours   | Medium   |
| 2c    | Generate JSON schema        | 2 hours   | Low      |
| 3     | Type coverage analyzer      | 4 hours   | Medium   |
| 4     | Command builder pattern     | 1 day     | Low      |

**Total**: 3-5 days

---

## Success Criteria

1. **Step 1**: Audit reports 0 warnings
2. **Step 2**: Documentation auto-generated on build
3. **Step 3**: Type coverage report shows >80% registry usage
4. **Step 4**: New commands can use builder pattern

---

## Files to Create/Modify

### New Files

- `packages/core/scripts/generate-command-docs.ts`
- `packages/core/scripts/analyze-expression-types.ts`
- `packages/core/src/commands/command-builder.ts`
- `docs/commands/REFERENCE.md` (generated)
- `docs/commands/commands.json` (generated)

### Modified Files

- `packages/core/src/types/command-metadata.ts` (add side effects)
- `packages/core/package.json` (add scripts)

---

## Next Actions

1. [ ] Review and approve this plan
2. [ ] Implement Step 1 (side effects expansion)
3. [ ] Implement Step 2 (documentation generator)
4. [ ] Implement Step 3 (type coverage)
5. [ ] Prototype Step 4 (builder pattern)
