# Phase 2: Dynamic Imports & Expression System Optimization

**Goal**: Achieve true code splitting with dynamic imports and lazy expression loading
**Expected Impact**: Additional 30-50% bundle size reduction for simple apps
**Estimated Effort**: 6-8 hours
**Status**: In Progress

---

## Overview

Phase 2 builds on Phase 1's lazy loading foundation by implementing:

1. **Dynamic imports** for commands (replace `require()` with `import()`)
2. **Lazy expression evaluator** with on-demand category loading
3. **Expression tiers** (core/common/optional) for granular optimization

---

## Current State Analysis

### Expression Categories (22 total)

From `src/expressions/`:

```
✓ references/      - me, you, it, CSS selectors (CORE)
✓ logical/         - comparisons, boolean logic (CORE)
✓ special/         - literals, math operators (CORE)
✓ properties/      - possessive syntax (COMMON)
✓ conversion/      - as keyword, type conversions (COMMON)
✓ comparison/      - matches, contains (COMMON)
✓ positional/      - first, last, array navigation (OPTIONAL)
✓ mathematical/    - arithmetic operations (OPTIONAL)
✓ function-calls/  - function invocation (OPTIONAL)
✓ form/            - form processing (OPTIONAL)
✓ array/           - array operations (OPTIONAL)
✓ time/            - time expressions (OPTIONAL)
✓ possessive/      - possessive operations (OPTIONAL)
✓ object/          - object operations (OPTIONAL)
✓ in/              - membership tests (OPTIONAL)
✓ string/          - string operations (OPTIONAL)
✓ some/            - quantifiers (OPTIONAL)
✓ symbol/          - symbols (OPTIONAL)
✓ not/             - negation (OPTIONAL)
✓ as/              - type assertions (OPTIONAL)
✓ property/        - property access (OPTIONAL)
✓ advanced/        - advanced expressions (OPTIONAL)
```

### Current Bundle Breakdown

**Current Implementation** (Phase 1):

- Commands: Lazy loaded (require-based) ✅
- Expressions: All imported upfront (~1.5MB source) ❌
- Total minimal bundle: 83KB gzipped

**Phase 2 Target**:

- Commands: Dynamic imports (async loading) ✅
- Expressions: Lazy loaded by tier ✅
- Expected minimal bundle: 50-60KB gzipped

---

## Implementation Tasks

### Task 1: Convert to Dynamic Imports ⏳

**File**: `src/runtime/command-adapter.ts`

**Current** (synchronous require):

```typescript
private loadCommand(name: string): any {
  const { ENHANCED_COMMAND_FACTORIES } = require('../commands/command-registry');
  const factory = ENHANCED_COMMAND_FACTORIES[name];
  return factory ? factory() : null;
}
```

**Target** (async dynamic import):

```typescript
private async loadCommand(name: string): Promise<any> {
  const module = await import('../commands/command-registry');
  const factory = module.ENHANCED_COMMAND_FACTORIES[name];
  return factory ? factory() : null;
}
```

**Impact**:

- True code splitting (commands in separate chunks)
- Reduces initial bundle by ~40-60KB for minimal bundle
- Commands loaded on first use (~1-2ms delay)

---

### Task 2: Create Expression Tiers 🔧

**New File**: `src/expressions/expression-tiers.ts`

```typescript
/**
 * Expression categories organized by usage frequency
 * Used for lazy loading optimization
 */

export const EXPRESSION_TIERS = {
  // CORE - Always loaded (required for any hyperscript)
  core: [
    'references', // me, you, it, CSS selectors
    'logical', // comparisons, boolean logic
    'special', // literals, math operators
  ],

  // COMMON - High usage (loaded for most apps)
  common: [
    'properties', // possessive syntax
    'conversion', // as keyword
    'comparison', // matches, contains
  ],

  // OPTIONAL - Low usage (loaded on demand)
  optional: [
    'positional',
    'mathematical',
    'function-calls',
    'form',
    'array',
    'time',
    'possessive',
    'object',
    'in',
    'string',
    'some',
    'symbol',
    'not',
    'as',
    'property',
    'advanced',
  ],
} as const;

export type ExpressionTier = keyof typeof EXPRESSION_TIERS;
export type ExpressionCategory =
  | (typeof EXPRESSION_TIERS.core)[number]
  | (typeof EXPRESSION_TIERS.common)[number]
  | (typeof EXPRESSION_TIERS.optional)[number];
```

---

### Task 3: Lazy Expression Evaluator 🎯

**New File**: `src/core/lazy-expression-evaluator.ts`

```typescript
import type { ASTNode, ExecutionContext } from '../types/core';
import { EXPRESSION_TIERS, type ExpressionCategory } from '../expressions/expression-tiers';

export class LazyExpressionEvaluator {
  private loadedCategories = new Set<string>();
  private expressionRegistry = new Map<string, any>();
  private loadPromises = new Map<string, Promise<void>>();

  constructor(
    private options: {
      preload?: 'core' | 'common' | 'all';
      categories?: ExpressionCategory[];
    } = {}
  ) {
    // Preload core expressions immediately
    if (this.options.preload !== 'none') {
      this.preloadTier('core');
    }

    // Optionally preload common expressions
    if (this.options.preload === 'common' || this.options.preload === 'all') {
      this.preloadTier('common');
    }
  }

  /**
   * Preload an expression tier
   */
  private async preloadTier(tier: keyof typeof EXPRESSION_TIERS): Promise<void> {
    const categories = EXPRESSION_TIERS[tier];
    await Promise.all(categories.map(cat => this.loadCategory(cat)));
  }

  /**
   * Load an expression category dynamically
   */
  private async loadCategory(category: string): Promise<void> {
    // Return early if already loaded
    if (this.loadedCategories.has(category)) {
      return;
    }

    // Return existing load promise if in progress
    if (this.loadPromises.has(category)) {
      return this.loadPromises.get(category)!;
    }

    // Start loading
    const loadPromise = this._loadCategoryImpl(category);
    this.loadPromises.set(category, loadPromise);

    try {
      await loadPromise;
      this.loadedCategories.add(category);
    } finally {
      this.loadPromises.delete(category);
    }
  }

  /**
   * Implementation of category loading
   */
  private async _loadCategoryImpl(category: string): Promise<void> {
    try {
      const module = await import(`../expressions/${category}/index`);
      const expressions = module[`${category}Expressions`] || module.default;

      // Register all expressions from this category
      Object.entries(expressions).forEach(([name, impl]) => {
        this.expressionRegistry.set(name, impl);
      });
    } catch (error) {
      console.warn(`Failed to load expression category: ${category}`, error);
    }
  }

  /**
   * Evaluate expression with automatic category loading
   */
  async evaluate(node: ASTNode, context: ExecutionContext): Promise<any> {
    // Determine which category this expression belongs to
    const category = this.getCategoryForNode(node);

    // Load category if needed
    if (category && !this.loadedCategories.has(category)) {
      await this.loadCategory(category);
    }

    // Get expression handler
    const handler = this.expressionRegistry.get(node.type);
    if (!handler) {
      throw new Error(`No handler for expression type: ${node.type}`);
    }

    // Evaluate
    return await handler.evaluate(node, context);
  }

  /**
   * Map node types to expression categories
   */
  private getCategoryForNode(node: ASTNode): string | null {
    // Map node types to categories
    const typeToCategory: Record<string, string> = {
      // References
      me: 'references',
      you: 'references',
      it: 'references',
      cssReference: 'references',
      queryRef: 'references',

      // Logical
      comparison: 'logical',
      binaryExpression: 'logical',
      logicalExpression: 'logical',

      // Special
      literal: 'special',
      numberLiteral: 'special',
      stringLiteral: 'special',

      // Properties
      possessive: 'properties',
      attributeRef: 'properties',

      // Conversion
      asExpression: 'conversion',

      // And more...
    };

    return typeToCategory[node.type] || null;
  }
}
```

---

### Task 4: Update Runtime to Use Lazy Evaluator 🔄

**File**: `src/runtime/runtime.ts`

**Changes**:

```typescript
import { LazyExpressionEvaluator } from '../core/lazy-expression-evaluator';

constructor(options: RuntimeOptions = {}) {
  // ...existing code...

  // Use lazy expression evaluator
  this.expressionEvaluator = new LazyExpressionEvaluator({
    preload: options.expressionPreload || 'core'
  });
}
```

**New RuntimeOptions**:

```typescript
export interface RuntimeOptions {
  // ...existing options...

  /**
   * Expression preloading strategy
   * - 'core': Load only essential expressions (default)
   * - 'common': Load core + common expressions
   * - 'all': Eager load all expressions (legacy behavior)
   */
  expressionPreload?: 'core' | 'common' | 'all';
}
```

---

### Task 5: Update Browser Bundles 📦

**Minimal Bundle** - Core expressions only:

```typescript
const runtime = new Runtime({
  lazyLoad: true,
  commands: MINIMAL_COMMANDS,
  expressionPreload: 'core', // NEW: Only load core expressions
});
```

**Standard Bundle** - Common expressions:

```typescript
const runtime = new Runtime({
  lazyLoad: true,
  commands: STANDARD_COMMANDS,
  expressionPreload: 'common', // NEW: Load core + common
});
```

**Full Bundle** - All expressions (legacy):

```typescript
const runtime = new Runtime({
  lazyLoad: false, // Legacy eager loading
  expressionPreload: 'all', // Load everything
});
```

---

## Expected Bundle Sizes

### Before Phase 2 (Current)

```
Minimal:  83KB gzipped (all expressions loaded)
Standard: 83KB gzipped (all expressions loaded)
Full:     193KB gzipped (all commands + expressions)
```

### After Phase 2 (Target)

```
Minimal:  50-60KB gzipped (core expressions only)
  - Commands: 8 (lazy loaded)
  - Expressions: 3 categories (references, logical, special)
  - Reduction: 25-30KB (30-36% additional savings)

Standard: 100-110KB gzipped (common expressions)
  - Commands: 20 (lazy loaded)
  - Expressions: 6 categories (core + common)
  - Reduction: 20-25KB (24-30% additional savings)

Full:     180-190KB gzipped (all expressions, dynamic chunks)
  - Commands: 40+ (lazy loaded)
  - Expressions: 22 categories (all)
  - Reduction: 5-10KB (3-5% from better code splitting)
```

---

## Performance Considerations

### Latency Trade-offs

**Command loading** (first use):

- Before: Synchronous (~0.1ms)
- After: Async dynamic import (~1-2ms)
- Impact: Negligible for user experience

**Expression loading** (first use):

- Core: Pre-loaded (0ms)
- Common: On-demand (~2-3ms first time)
- Optional: On-demand (~2-3ms first time)

**Mitigation**: Warmup API

```typescript
// Preload specific categories
await runtime.warmupExpressions(['positional', 'mathematical']);
```

---

## Rollout Strategy

### Week 1: Infrastructure

- [x] Day 1-2: Convert commands to dynamic imports
- [x] Day 2-3: Create expression tier system
- [x] Day 3-4: Implement LazyExpressionEvaluator
- [ ] Day 4-5: Update Runtime integration

### Week 2: Testing & Validation

- [ ] Day 1-2: Update browser bundles
- [ ] Day 2-3: Comprehensive testing
- [ ] Day 3-4: Bundle size verification
- [ ] Day 4-5: Documentation & migration guide

---

## Migration Guide

### For NPM Package Users

**No changes required!** Lazy expression loading is automatic:

```typescript
import { Runtime } from '@lokascript/core';

// Default (core expressions preloaded, common/optional lazy)
const runtime = new Runtime();

// Explicit (recommended for production)
const runtime = new Runtime({
  expressionPreload: 'core', // Minimal bundle
  commands: ['add', 'remove', 'toggle'],
});

// Full compatibility (legacy behavior)
const runtime = new Runtime({
  expressionPreload: 'all',
  lazyLoad: false,
});
```

### For Browser Bundle Users

**Choose appropriate bundle**:

```html
<!-- Minimal (50-60KB gzipped) - Core expressions -->
<script src="dist/lokascript-browser-minimal.js"></script>

<!-- Standard (100-110KB gzipped) - Common expressions -->
<script src="dist/lokascript-browser-standard.js"></script>

<!-- Full (190KB gzipped) - All expressions -->
<script src="dist/lokascript-browser.js"></script>
```

---

## Testing Strategy

### 1. Unit Tests

- LazyExpressionEvaluator category loading
- Dynamic import resolution
- Expression registry management

### 2. Integration Tests

- Command execution with async loading
- Expression evaluation with lazy categories
- Mixed sync/async operations

### 3. Bundle Size Tests

```bash
# Verify sizes
npm run build:browser:all
npm run size:analysis

# Expected outputs:
# Minimal: ~55KB gzipped
# Standard: ~105KB gzipped
# Full: ~185KB gzipped
```

### 4. Performance Tests

- Measure lazy load latency
- Verify warmup API effectiveness
- Check memory usage

---

## Risks & Mitigation

### Risk 1: Async Breaking Changes

**Risk**: Dynamic imports change command loading from sync to async
**Mitigation**:

- Maintain backward compatibility with eager loading option
- Deprecation warnings for 2 versions before removal
- Comprehensive testing

### Risk 2: Expression Category Mapping

**Risk**: Incorrect node type → category mapping
**Mitigation**:

- Fallback to loading all categories if mapping fails
- Extensive testing of all expression types
- Warning logs for unmapped types

### Risk 3: Build Complexity

**Risk**: Dynamic imports complicate build configuration
**Mitigation**:

- Test build in multiple environments
- Document rollup/webpack configuration requirements
- Provide troubleshooting guide

---

## Success Metrics

- [ ] **Bundle Size**: Minimal bundle ≤60KB gzipped (vs 83KB current)
- [ ] **Performance**: Lazy load latency <5ms per category
- [ ] **Compatibility**: 100% of existing tests passing
- [ ] **Coverage**: ≥95% test coverage for new code
- [ ] **Documentation**: Complete migration guide and API docs

---

## Next Steps

1. Implement LazyExpressionEvaluator
2. Convert command registry to async dynamic imports
3. Update browser bundles
4. Test and verify improvements
5. Update documentation
6. Create migration guide

**Status**: Ready to begin implementation
**Est. Completion**: 6-8 hours from start
