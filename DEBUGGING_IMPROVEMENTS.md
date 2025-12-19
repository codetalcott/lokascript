# Debugging Improvements Proposal

## Context
After debugging the `*background-color` issue, we identified several areas where better debugging infrastructure would have accelerated the investigation.

## Key Difficulties Encountered

1. **No visibility into which parser was used** (semantic vs traditional)
2. **AST node type changed mysteriously** between parsing and evaluation
3. **No logging of semantic type inference decisions**
4. **Debug logs stripped by Terser in production builds**
5. **Deep call stack made tracing difficult**

---

## Proposed Improvements

### 1. AST Node Provenance Tracking

**Problem**: We couldn't tell which parser created a node or why it had a certain type.

**Solution**: Add metadata to every AST node tracking its creation:

```typescript
// Add to base ASTNode type
interface ASTNode {
  type: string;
  // ... existing fields

  // NEW: Provenance metadata (only in debug mode)
  __debug?: {
    createdBy: 'semantic-parser' | 'traditional-parser' | 'ast-builder';
    createdAt: string; // timestamp
    sourceText?: string; // original text that created this node
    transformations?: Array<{
      from: string; // previous type
      to: string; // new type
      reason: string; // why transformed
      location: string; // file:line
    }>;
  };
}
```

**Example output**:
```javascript
{
  type: 'selector',
  value: '*background-color',
  __debug: {
    createdBy: 'semantic-parser',
    createdAt: '2025-01-15T10:23:45.123Z',
    sourceText: '*background-color',
    transformations: [
      {
        from: 'literal',
        to: 'selector',
        reason: 'Schema allows [literal, selector], chose selector because value starts with *',
        location: 'value-converters.ts:77'
      }
    ]
  }
}
```

**Implementation**:
- Controlled by `window.__HYPERFIXI_DEBUG__` flag
- Only enabled in dev builds by default
- Can be enabled in production for debugging

---

### 2. Compilation Metadata in Results

**Problem**: CompilationResult doesn't tell us which parser was used.

**Solution**: Enhance CompilationResult with pipeline information:

```typescript
interface CompilationResult {
  success: boolean;
  ast?: ASTNode;
  errors: ParseError[];
  tokens: Token[];
  compilationTime: number;

  // NEW: Pipeline metadata
  metadata?: {
    parserUsed: 'semantic' | 'traditional' | 'fallback';
    semanticConfidence?: number; // 0-1
    semanticLanguage?: string;
    transformations: number; // count of AST transformations
    warnings?: string[]; // non-fatal issues
  };
}
```

**Example usage**:
```javascript
const result = hyperfixi.compile('transition *background-color to "red"');
console.log('Parser used:', result.metadata.parserUsed); // 'semantic'
console.log('Confidence:', result.metadata.semanticConfidence); // 0.95
console.log('Warnings:', result.metadata.warnings);
// ['patient role: chose selector over literal (value starts with *)']
```

---

### 3. Semantic Parser Decision Logging

**Problem**: Type inference decisions happened silently.

**Solution**: Add decision logging to semantic parser:

```typescript
// In value-converters.ts or pattern matcher
function inferSemanticValueType(
  token: LanguageToken,
  expectedTypes: SemanticValueType[],
  context: string
): SemanticValueType {
  const decisions: Array<{type: SemanticValueType, score: number, reason: string}> = [];

  for (const type of expectedTypes) {
    const score = scoreTypeMatch(token, type);
    const reason = explainScore(token, type, score);
    decisions.push({ type, score, reason });
  }

  const winner = decisions.sort((a, b) => b.score - a.score)[0];

  // Log decision if debug enabled
  if (isDebugEnabled()) {
    debug.semantic('Type inference decision:', {
      token: token.value,
      context,
      expectedTypes,
      decisions,
      chosen: winner.type,
      reason: winner.reason
    });
  }

  return winner.type;
}
```

**Example output**:
```
[SEMANTIC] Type inference decision: {
  token: '*background-color',
  context: 'transition patient role',
  expectedTypes: ['literal', 'selector'],
  decisions: [
    { type: 'selector', score: 0.8, reason: 'starts with * (universal selector)' },
    { type: 'literal', score: 0.6, reason: 'is a string value' }
  ],
  chosen: 'selector',
  reason: 'starts with * (universal selector)'
}
```

---

### 4. Debug-Safe Production Builds

**Problem**: Terser removes console.log, making production debugging impossible.

**Solution**: Implement a debug namespace system that survives minification:

```typescript
// debug-system.ts
interface DebugNamespace {
  enabled: boolean;
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

class DebugSystem {
  private namespaces = new Map<string, DebugNamespace>();

  namespace(name: string): DebugNamespace {
    if (!this.namespaces.has(name)) {
      this.namespaces.set(name, {
        enabled: this.isEnabled(name),
        log: (...args) => this.isEnabled(name) && console.log(`[${name}]`, ...args),
        warn: (...args) => this.isEnabled(name) && console.warn(`[${name}]`, ...args),
        error: (...args) => console.error(`[${name}]`, ...args), // errors always show
      });
    }
    return this.namespaces.get(name)!;
  }

  isEnabled(name: string): boolean {
    // Check localStorage in browser
    if (typeof localStorage !== 'undefined') {
      const setting = localStorage.getItem('hyperfixi:debug');
      if (setting === '*') return true;
      if (setting?.split(',').includes(name)) return true;
    }
    // Check window flag
    return (globalThis as any).__HYPERFIXI_DEBUG__?.[name] ?? false;
  }

  enable(namespaces: string): void {
    localStorage?.setItem('hyperfixi:debug', namespaces);
    location.reload();
  }

  disable(): void {
    localStorage?.removeItem('hyperfixi:debug');
    location.reload();
  }
}

export const debugSystem = new DebugSystem();

// Usage in code:
const debug = debugSystem.namespace('semantic-parser');
debug.log('Parsing transition command:', input);
```

**User API**:
```javascript
// Enable all debugging
hyperfixi.debug.enable('*');

// Enable specific namespaces
hyperfixi.debug.enable('semantic-parser,ast-builder,evaluator');

// Check current settings
hyperfixi.debug.list(); // ['semantic-parser', 'ast-builder']

// Disable all
hyperfixi.debug.disable();
```

**Benefits**:
- Debug calls survive minification (they're method calls, not console.log)
- Fine-grained control (enable only what you need)
- Persistent across page reloads (localStorage)
- Works in production builds

---

### 5. AST Validation Layers

**Problem**: AST nodes changed type between parser and evaluator without validation.

**Solution**: Add validation checkpoints in the pipeline:

```typescript
// ast-validator.ts
interface ValidationRule {
  name: string;
  validate: (node: ASTNode) => ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  warnings?: string[];
  errors?: string[];
}

class ASTValidator {
  private rules: ValidationRule[] = [];

  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  validate(node: ASTNode, context: string): ValidationResult {
    const results = this.rules.map(rule => rule.validate(node));
    const warnings = results.flatMap(r => r.warnings ?? []);
    const errors = results.flatMap(r => r.errors ?? []);

    if (warnings.length > 0) {
      debug.validation(`[${context}] Validation warnings:`, warnings);
    }

    if (errors.length > 0) {
      debug.validation(`[${context}] Validation errors:`, errors);
      throw new Error(`AST validation failed: ${errors.join(', ')}`);
    }

    return { valid: true, warnings, errors };
  }
}

// Example rules:
validator.addRule({
  name: 'transition-property-must-be-string',
  validate: (node) => {
    if (node.type === 'command' && node.name === 'transition') {
      const firstArg = node.args[0];
      if (firstArg && firstArg.type === 'selector' && firstArg.value?.startsWith('*')) {
        return {
          valid: false,
          errors: [`Transition property should be 'string' not 'selector': ${firstArg.value}`]
        };
      }
    }
    return { valid: true };
  }
});

// Use in pipeline:
const parseResult = parseToResult(code, options);
if (parseResult.node) {
  validator.validate(parseResult.node, 'post-parse');
}
```

**This would have caught the bug immediately**:
```
[VALIDATION] post-parse: Validation errors:
  - Transition property should be 'string' not 'selector': *background-color
```

---

### 6. Visual AST Inspector (Browser Tool)

**Problem**: Hard to visualize AST structure and trace transformations.

**Solution**: Create a browser-based AST inspector panel:

```typescript
// Browser API
hyperfixi.inspect(code: string): void {
  const panel = createInspectorPanel();

  // Parse with full provenance tracking
  const result = compile(code, { debug: true });

  // Render interactive tree
  panel.render({
    source: code,
    ast: result.ast,
    metadata: result.metadata,
    transformations: collectTransformations(result.ast),
  });

  panel.show();
}
```

**UI Features**:
- Expandable tree view of AST
- Highlight node → shows source text
- Provenance trail for each node
- Diff view (semantic AST vs traditional AST)
- Export AST as JSON

**Example usage**:
```javascript
hyperfixi.inspect('transition *background-color to "red" over 500ms');
```

**Visual output** (ASCII mockup):
```
┌─ AST Inspector ──────────────────────────────────┐
│ Source: transition *background-color to "red"    │
│ Parser: semantic (confidence: 0.95)              │
├──────────────────────────────────────────────────┤
│ ▼ command (transition)                           │
│   ├─ name: "transition"                          │
│   ├─ args:                                       │
│   │  └─ [0] selector ⚠️                          │
│   │      ├─ type: "selector"                     │
│   │      ├─ value: "*background-color"           │
│   │      └─ 🔍 Created by: semantic-parser       │
│   │          Reason: Schema allows [literal,     │
│   │          selector], chose selector (starts   │
│   │          with *)                             │
│   └─ modifiers:                                  │
│      ├─ to: { type: "literal", value: "red" }   │
│      └─ over: { type: "literal", value: "500ms"}│
└──────────────────────────────────────────────────┘
```

---

### 7. Schema Validation for Command Schemas

**Problem**: `transitionSchema` was too permissive (`expectedTypes: ['literal', 'selector']`).

**Solution**: Add schema validation and linting:

```typescript
// schema-validator.ts
function validateCommandSchema(schema: CommandSchema): SchemaValidationResult {
  const warnings: string[] = [];

  for (const role of schema.roles) {
    // Warn about ambiguous type combinations
    if (role.expectedTypes.includes('literal') && role.expectedTypes.includes('selector')) {
      warnings.push(
        `Role '${role.role}' accepts both 'literal' and 'selector'. ` +
        `This may cause ambiguous type inference. Consider being more specific.`
      );
    }

    // Warn about missing required roles for certain commands
    if (schema.action === 'transition' && role.role === 'patient') {
      if (!schema.roles.find(r => r.role === 'goal')) {
        warnings.push(
          `Transition command should have a 'goal' role for the target value (to <value>)`
        );
      }
    }
  }

  return { valid: true, warnings };
}

// Run at build time or startup
for (const [action, schema] of Object.entries(commandSchemas)) {
  const result = validateCommandSchema(schema);
  if (result.warnings.length > 0) {
    console.warn(`[SCHEMA] ${action}:`, result.warnings);
  }
}
```

**This would have warned us**:
```
[SCHEMA] transition:
  - Role 'patient' accepts both 'literal' and 'selector'. This may cause ambiguous type inference.
  - Transition command should have a 'goal' role for the target value (to <value>)
```

---

## Implementation Priority

### Phase 1: Essential (Immediate value)
1. **Compilation metadata** - Easy to add, immediate visibility
2. **Debug system** - Replace all console.log with namespace system
3. **Schema validation** - Catches design issues early

### Phase 2: High Value (Next sprint)
4. **AST provenance** - Most impactful for debugging
5. **Semantic decision logging** - Reveals type inference reasoning
6. **AST validation layers** - Catches bugs at boundaries

### Phase 3: Nice to Have (Future)
7. **Visual AST inspector** - Great UX but time-intensive

---

## Example: How This Would Have Helped

**Original debugging session**:
1. See error: `querySelectorAll('*background-color')` ❌
2. Add console.log to evaluator (stripped by Terser) ❌
3. Rebuild without minification ⏰
4. See debug output ✓
5. Trace back through code manually 🔍
6. Find semantic parser is enabled (surprise!) 😮
7. Discover schema issue 🎯

**With improvements**:
1. See error: `querySelectorAll('*background-color')` ❌
2. Enable debug: `hyperfixi.debug.enable('semantic-parser,ast-builder')` ✓
3. Reload page, see in console:
   ```
   [SEMANTIC] Type inference: chose 'selector' over 'literal'
              for '*background-color' (starts with *)
   [VALIDATION] post-parse: transition property should be
                'string' not 'selector'
   ```
4. Fix schema immediately 🎯

**Time saved**: ~30 minutes → ~2 minutes

---

## Additional Tooling Ideas

### 8. Test Helpers for AST Assertions

```typescript
// test-helpers.ts
expect(ast).toHaveNodeType('command', 'transition');
expect(ast.args[0]).toHaveNodeType('string'); // Would fail, is 'selector'
expect(ast).toHaveBeenParsedBy('semantic');
expect(ast).toHaveModifier('to');
```

### 9. Performance Profiling

```typescript
const profile = hyperfixi.profile(code);
// {
//   tokenization: 0.5ms,
//   semanticParsing: 2.3ms,
//   astBuilding: 1.2ms,
//   total: 4.0ms
// }
```

### 10. Diff Tool for AST Comparison

```typescript
const diff = hyperfixi.diff(
  'transition *background-color to "red"',
  { parser: 'semantic' },
  { parser: 'traditional' }
);
// Shows side-by-side AST differences
```

---

## Success Metrics

After implementing these improvements, we should be able to:

1. **Identify parser path** in <10 seconds (currently: 10+ minutes)
2. **Trace type changes** in <30 seconds (currently: 30+ minutes)
3. **Debug production issues** without rebuilding (currently: impossible)
4. **Validate schemas** at build time (currently: runtime discovery)
5. **Onboard new contributors** faster (better debugging = faster learning)

---

## Next Steps

1. Review this proposal with the team
2. Prioritize which improvements to implement first
3. Create implementation tickets
4. Add debugging documentation to CLAUDE.md

