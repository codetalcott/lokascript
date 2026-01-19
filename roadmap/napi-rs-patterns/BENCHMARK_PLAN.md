# Benchmark Plan: Native vs JavaScript Performance

## Objective

Establish baseline performance metrics and measure improvements from native (Rust/napi-rs) implementations.

## Benchmark Categories

### 1. Tokenization Benchmarks

| Benchmark         | Description                          | Expected Native Improvement |
| ----------------- | ------------------------------------ | --------------------------- |
| `tokenize-small`  | 100 char hyperscript                 | 50-60% faster               |
| `tokenize-medium` | 1KB hyperscript                      | 60-70% faster               |
| `tokenize-large`  | 10KB hyperscript (complex behaviors) | 70-80% faster               |
| `tokenize-stress` | 100KB hyperscript (stress test)      | 80%+ faster                 |

### 2. Parsing Benchmarks

| Benchmark          | Description               | Expected Native Improvement |
| ------------------ | ------------------------- | --------------------------- |
| `parse-expression` | Single expression parsing | 40-50% faster               |
| `parse-command`    | Command with arguments    | 45-55% faster               |
| `parse-behavior`   | Full behavior definition  | 50-60% faster               |
| `parse-complex`    | Nested control flow       | 55-65% faster               |

### 3. Expression Evaluation Benchmarks

| Benchmark         | Description               | Expected Native Improvement |
| ----------------- | ------------------------- | --------------------------- |
| `eval-arithmetic` | Math operations           | 60-70% faster               |
| `eval-comparison` | Logical comparisons       | 55-65% faster               |
| `eval-property`   | Property access chains    | 40-50% faster               |
| `eval-mixed`      | Combined expression types | 50-60% faster               |

### 4. Memory Benchmarks

| Benchmark    | Description             | Expected Native Improvement |
| ------------ | ----------------------- | --------------------------- |
| `mem-tokens` | Token object allocation | 70% less memory             |
| `mem-ast`    | AST node creation       | 60% less memory             |
| `mem-pool`   | Object pool efficiency  | 50% less GC pressure        |

## Benchmark Implementation

### Setup

```typescript
// benchmarks/setup.ts
import { Suite } from 'benchmark';

interface BenchmarkResult {
  name: string;
  ops_per_sec: number;
  mean_ms: number;
  deviation: number;
  samples: number;
}

export function createSuite(name: string): Suite {
  return new Suite(name);
}
```

### Example Benchmark

```typescript
// benchmarks/tokenize.bench.ts
import { createSuite } from './setup';
import { tokenize as jsTokenize } from '../src/parser/tokenizer';
import { tokenize as nativeTokenize } from '@lokascript/native-core';

const SMALL = 'on click set x to 5';
const MEDIUM = generateMediumScript();
const LARGE = generateLargeScript();

const suite = createSuite('Tokenization');

suite
  .add('JS - Small', () => jsTokenize(SMALL))
  .add('Native - Small', () => nativeTokenize(SMALL))
  .add('JS - Medium', () => jsTokenize(MEDIUM))
  .add('Native - Medium', () => nativeTokenize(MEDIUM))
  .add('JS - Large', () => jsTokenize(LARGE))
  .add('Native - Large', () => nativeTokenize(LARGE))
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
```

## Expected Results

Based on typical napi-rs migration performance gains:

```
Tokenization Benchmarks:
┌────────────────────┬───────────┬───────────┬─────────┐
│ Benchmark          │ JS (ms)   │ Native    │ Speedup │
├────────────────────┼───────────┼───────────┼─────────┤
│ Small (100 chars)  │ 0.15      │ 0.05      │ 3.0x    │
│ Medium (1KB)       │ 1.2       │ 0.35      │ 3.4x    │
│ Large (10KB)       │ 12.0      │ 3.0       │ 4.0x    │
│ Stress (100KB)     │ 120.0     │ 25.0      │ 4.8x    │
└────────────────────┴───────────┴───────────┴─────────┘

Parsing Benchmarks:
┌────────────────────┬───────────┬───────────┬─────────┐
│ Benchmark          │ JS (ms)   │ Native    │ Speedup │
├────────────────────┼───────────┼───────────┼─────────┤
│ Expression         │ 0.08      │ 0.03      │ 2.7x    │
│ Command            │ 0.12      │ 0.04      │ 3.0x    │
│ Behavior           │ 0.45      │ 0.12      │ 3.8x    │
│ Complex            │ 1.5       │ 0.35      │ 4.3x    │
└────────────────────┴───────────┴───────────┴─────────┘

Memory Benchmarks:
┌────────────────────┬───────────┬───────────┬─────────┐
│ Benchmark          │ JS (MB)   │ Native    │ Savings │
├────────────────────┼───────────┼───────────┼─────────┤
│ 10K Tokens         │ 2.4       │ 0.8       │ 67%     │
│ 1K AST Nodes       │ 1.8       │ 0.6       │ 67%     │
│ Object Pool (1min) │ 15.2      │ 4.5       │ 70%     │
└────────────────────┴───────────┴───────────┴─────────┘
```

## Real-World Impact

### Initialization Time

Current LokaScript initialization for a typical page:

```
Current (all JavaScript):
├── Tokenize page scripts:     15ms
├── Parse AST:                 25ms
├── Register behaviors:         8ms
├── First event handler:        2ms
└── Total:                     50ms

With Native Core:
├── Tokenize page scripts:      5ms  (3x faster)
├── Parse AST:                  8ms  (3x faster)
├── Register behaviors:         8ms  (unchanged, DOM-bound)
├── First event handler:        2ms  (unchanged)
└── Total:                     23ms  (54% reduction)
```

### Animation Performance

Drag behavior with 60fps target:

```
Current (16.67ms budget per frame):
├── Event processing:           2ms
├── Expression evaluation:      4ms
├── Style calculation:          3ms
├── DOM update:                 5ms
└── Total:                     14ms  (✓ meets budget, barely)

With Native Expression Evaluator:
├── Event processing:           2ms
├── Expression evaluation:      1.5ms  (2.7x faster)
├── Style calculation:          3ms
├── DOM update:                 5ms
└── Total:                     11.5ms (✓ 30% headroom)
```

## Benchmark Infrastructure

### Continuous Integration

```yaml
# .github/workflows/benchmark.yml
name: Performance Benchmarks

on:
  push:
    branches: [main]
  pull_request:
    paths:
      - 'crates/**'
      - 'packages/core/src/parser/**'
      - 'packages/core/src/evaluator/**'

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build native
        run: |
          cd crates/lokascript-napi
          npm run build

      - name: Run benchmarks
        run: npm run benchmark

      - name: Compare results
        uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'customSmallerIsBetter'
          output-file-path: benchmark-results.json
          alert-threshold: '120%'
          fail-on-alert: true
```

### Local Development

```bash
# Run all benchmarks
npm run benchmark

# Run specific benchmark
npm run benchmark -- --grep "tokenize"

# Profile with flamegraph
npm run benchmark:profile

# Memory profiling
npm run benchmark:memory
```

## Success Criteria

| Metric                  | Target          | Priority |
| ----------------------- | --------------- | -------- |
| Tokenization speedup    | ≥3x             | High     |
| Parsing speedup         | ≥2.5x           | High     |
| Expression eval speedup | ≥2x             | Medium   |
| Memory reduction        | ≥50%            | Medium   |
| Bundle size increase    | ≤5MB            | Low      |
| No regressions          | 100% tests pass | Critical |

## Risk Mitigation

1. **Fallback guarantee**: JavaScript implementation always available
2. **Gradual rollout**: Feature flags for native code
3. **Regression testing**: Automated comparison with JS baseline
4. **Platform coverage**: CI tests on all target platforms
