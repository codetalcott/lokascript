# napi-rs Patterns Exploration for LokaScript

## Executive Summary

This document explores how [napi-rs](https://github.com/napi-rs/napi-rs) patterns could enhance LokaScript's performance and architecture. napi-rs is a framework for building compiled Node.js add-ons in Rust via Node-API, enabling significant performance improvements for compute-intensive JavaScript operations.

**Key Opportunity**: LokaScript's parser and expression evaluator are ideal candidates for native optimization, with potential **40-60% performance improvements** in parsing and evaluation.

---

## 1. napi-rs Core Patterns

### 1.1 The `#[napi]` Procedural Macro

napi-rs uses Rust procedural macros to automatically generate JavaScript bindings:

```rust
use napi_derive::napi;

// Simple function export
#[napi]
pub fn parse_hyperscript(source: String) -> napi::Result<ParseResult> {
    // Rust implementation
    Ok(parser::parse(&source)?)
}

// Class with methods
#[napi(js_name = "HyperScriptParser")]
pub struct Parser {
    tokens: Vec<Token>,
    current: usize,
}

#[napi]
impl Parser {
    #[napi(constructor)]
    pub fn new() -> Self {
        Parser { tokens: vec![], current: 0 }
    }

    #[napi]
    pub fn tokenize(&mut self, source: String) -> napi::Result<Vec<Token>> {
        // Native tokenization
        Ok(tokenizer::tokenize(&source)?)
    }

    #[napi]
    pub async fn parse_async(&self, source: String) -> napi::Result<AST> {
        // Async parsing with Promise return
        Ok(self.parse_internal(&source).await?)
    }
}
```

**Generated TypeScript Definitions** (automatic):

```typescript
export function parseHyperscript(source: string): ParseResult;

export class HyperScriptParser {
  constructor();
  tokenize(source: string): Token[];
  parseAsync(source: string): Promise<AST>;
}
```

### 1.2 AsyncTask Pattern

For CPU-intensive work that shouldn't block the event loop:

```rust
use napi::{Task, Env, JsNumber};

struct ParseTask {
    source: String,
}

#[napi]
impl Task for ParseTask {
    type Output = AST;
    type JsValue = JsObject;

    fn compute(&mut self) -> napi::Result<Self::Output> {
        // Heavy parsing work runs in libuv thread pool
        parser::parse(&self.source)
    }

    fn resolve(&mut self, env: Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        // Convert Rust AST to JavaScript object
        output.into_js(env)
    }
}
```

### 1.3 Cross-Platform Distribution

napi-rs enables prebuilt binaries for multiple platforms:

```
@lokascript/native-parser-linux-x64-gnu
@lokascript/native-parser-darwin-arm64
@lokascript/native-parser-win32-x64-msvc
```

Main package uses optional dependencies for platform selection:

```json
{
  "optionalDependencies": {
    "@lokascript/native-parser-linux-x64-gnu": "1.0.0",
    "@lokascript/native-parser-darwin-arm64": "1.0.0",
    "@lokascript/native-parser-win32-x64-msvc": "1.0.0"
  }
}
```

---

## 2. LokaScript Optimization Targets

Based on codebase analysis, these are the highest-impact areas for native optimization:

### 2.1 Tokenizer (Highest Priority)

**Current State**: `packages/core/src/parser/tokenizer.ts` - 1,328 lines
**Bottleneck**: Character-by-character string processing, regex operations

```typescript
// Current JavaScript implementation
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < source.length) {
    const char = source[pos];
    // Complex matching logic...
  }
  return tokens;
}
```

**Native Implementation Pattern**:

```rust
#[napi(object)]
pub struct Token {
    pub kind: String,
    pub value: String,
    pub start: u32,
    pub end: u32,
    pub line: u32,
    pub column: u32,
}

#[napi]
pub fn tokenize(source: String) -> Vec<Token> {
    let mut tokenizer = Tokenizer::new(&source);
    tokenizer.scan_all()
}
```

**Expected Impact**: 50-70% faster tokenization

### 2.2 Expression Evaluator (High Priority)

**Current State**: `src/evaluator/expression-evaluator.ts` - 900+ lines
**Bottleneck**: Switch-based dispatch, recursive Promise chains

```typescript
// Current: 24+ expression types with async evaluation
async evaluateExpression(expr: Expression, ctx: Context): Promise<unknown> {
    switch (expr.type) {
        case 'binary': return this.evaluateBinary(expr, ctx);
        case 'reference': return this.evaluateReference(expr, ctx);
        // ... 24 more cases
    }
}
```

**Native Implementation Pattern**:

```rust
#[napi]
pub struct ExpressionEvaluator {
    context: EvaluationContext,
}

#[napi]
impl ExpressionEvaluator {
    #[napi]
    pub fn evaluate_sync(&self, expr: JsObject) -> napi::Result<JsUnknown> {
        // Direct Rust evaluation with JIT-like dispatch
        let expr = Expression::from_js(expr)?;
        self.evaluate_internal(&expr)
    }

    #[napi]
    pub async fn evaluate(&self, expr: JsObject) -> napi::Result<JsUnknown> {
        // For expressions that need async (DOM queries, etc.)
        let expr = Expression::from_js(expr)?;
        self.evaluate_async_internal(&expr).await
    }
}
```

**Expected Impact**: 40-60% faster expression evaluation

### 2.3 Parser (Medium-High Priority)

**Current State**: `src/parser/parser.ts` - 3,308 lines
**Bottleneck**: Recursive descent with complex precedence climbing

**Native Implementation Pattern**:

```rust
#[napi(js_name = "NativeParser")]
pub struct Parser {
    tokens: Vec<Token>,
    current: usize,
}

#[napi]
impl Parser {
    #[napi(factory)]
    pub fn from_source(source: String) -> napi::Result<Self> {
        let tokens = tokenize(&source);
        Ok(Parser { tokens, current: 0 })
    }

    #[napi]
    pub fn parse(&mut self) -> napi::Result<JsObject> {
        // Native recursive descent parser
        self.parse_program()
    }

    #[napi]
    pub fn parse_expression(&mut self) -> napi::Result<JsObject> {
        // Pratt parser for expressions (efficient precedence climbing)
        self.pratt_parse(0)
    }
}
```

**Expected Impact**: 40-60% faster parsing

### 2.4 Object Pool (Lower Priority, High Value)

**Current State**: `src/utils/performance.ts` - pooling with JavaScript Maps

**Native Implementation Pattern**:

```rust
use std::sync::Mutex;
use std::collections::VecDeque;

#[napi]
pub struct NativePool<T> {
    pool: Mutex<VecDeque<T>>,
    max_size: usize,
}

#[napi]
impl NativePool<JsObject> {
    #[napi]
    pub fn acquire(&self) -> Option<JsObject> {
        self.pool.lock().unwrap().pop_front()
    }

    #[napi]
    pub fn release(&self, obj: JsObject) {
        let mut pool = self.pool.lock().unwrap();
        if pool.len() < self.max_size {
            pool.push_back(obj);
        }
    }
}
```

**Expected Impact**: Reduced GC pressure, smoother animations

---

## 3. Hybrid Architecture Proposal

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     LokaScript Application                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 JavaScript Layer                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Runtime   │  │  Commands   │  │     DOM     │  │   │
│  │  │   (V2)      │  │  (43 V2)    │  │  Integration│  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │   │
│  │         │                │                │         │   │
│  └─────────┼────────────────┼────────────────┼─────────┘   │
│            │                │                │              │
│  ┌─────────┴────────────────┴────────────────┴─────────┐   │
│  │                  Binding Layer                       │   │
│  │  ┌─────────────────────────────────────────────────┐│   │
│  │  │    @lokascript/native-core (napi-rs bindings)    ││   │
│  │  │    - Auto-generated TypeScript definitions       ││   │
│  │  │    - Platform-specific prebuilt binaries        ││   │
│  │  └─────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌───────────────────────────┴──────────────────────────┐  │
│  │                    Rust Layer                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  Tokenizer  │  │   Parser    │  │  Evaluator  │   │  │
│  │  │  (Native)   │  │  (Native)   │  │  (Native)   │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   Object    │  │    AST      │  │   String    │   │  │
│  │  │    Pool     │  │   Cache     │  │   Intern    │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Gradual Migration Strategy

**Phase A: Tokenizer First (Low Risk, High Reward)**

```
Week 1-2: Rust tokenizer with napi-rs bindings
Week 3: Integration testing, benchmarks
Week 4: Feature flag rollout
```

**Phase B: Parser (Medium Risk)**

```
Week 5-6: Rust recursive descent parser
Week 7: AST compatibility validation
Week 8: Full integration testing
```

**Phase C: Expression Evaluator (Higher Risk)**

```
Week 9-11: Native expression evaluation
Week 12: DOM integration layer
```

### 3.3 Fallback Architecture

Always maintain JavaScript fallback for:

- Browsers (WASM compilation needed separately)
- Edge cases with native binary loading issues
- Development/debugging scenarios

```typescript
// packages/core/src/parser/index.ts
import type { Token } from './types';

let nativeParser: typeof import('@lokascript/native-core') | null = null;

// Attempt native loader
try {
  nativeParser = require('@lokascript/native-core');
} catch {
  console.debug('Native parser unavailable, using JavaScript fallback');
}

export function tokenize(source: string): Token[] {
  if (nativeParser) {
    return nativeParser.tokenize(source);
  }
  // JavaScript fallback
  return jsTokenize(source);
}
```

---

## 4. napi-rs Patterns Applied to LokaScript

### 4.1 Pattern: Wrapper Types for Complex Structures

```rust
// LokaScript-specific AST wrapper
#[napi(object)]
pub struct ASTNode {
    pub node_type: String,
    pub start: u32,
    pub end: u32,
    pub children: Vec<ASTNode>,
    pub value: Option<String>,
}

// Convert between Rust and JS seamlessly
impl ASTNode {
    pub fn from_internal(node: &InternalNode) -> Self {
        ASTNode {
            node_type: node.kind().to_string(),
            start: node.span().start,
            end: node.span().end,
            children: node.children().iter().map(ASTNode::from_internal).collect(),
            value: node.value().map(|v| v.to_string()),
        }
    }
}
```

### 4.2 Pattern: Async Expression Evaluation

```rust
use napi::bindgen_prelude::*;

#[napi]
pub struct ExpressionContext {
    me: Option<External<Element>>,
    you: Option<External<Element>>,
    it: Option<JsUnknown>,
    locals: HashMap<String, JsUnknown>,
}

#[napi]
impl ExpressionContext {
    #[napi]
    pub async fn evaluate(&self, expr: JsObject) -> napi::Result<JsUnknown> {
        // Expressions that need DOM access use async
        let expr_type = expr.get::<_, String>("type")?;

        match expr_type.as_str() {
            "reference" => self.evaluate_reference(expr).await,
            "binary" => self.evaluate_binary(expr).await,
            "call" => self.evaluate_call(expr).await,
            _ => Err(Error::from_reason("Unknown expression type")),
        }
    }
}
```

### 4.3 Pattern: Thread-Safe Caching

```rust
use dashmap::DashMap;
use std::sync::Arc;

#[napi]
pub struct ParseCache {
    cache: Arc<DashMap<String, CachedAST>>,
    max_size: usize,
}

#[napi]
impl ParseCache {
    #[napi(constructor)]
    pub fn new(max_size: u32) -> Self {
        ParseCache {
            cache: Arc::new(DashMap::new()),
            max_size: max_size as usize,
        }
    }

    #[napi]
    pub fn get(&self, source: String) -> Option<JsObject> {
        self.cache.get(&source).map(|entry| entry.ast.clone())
    }

    #[napi]
    pub fn set(&self, source: String, ast: JsObject) {
        if self.cache.len() >= self.max_size {
            // LRU eviction
            self.evict_oldest();
        }
        self.cache.insert(source, CachedAST { ast, timestamp: now() });
    }
}
```

### 4.4 Pattern: Zero-Copy String Handling

```rust
use napi::bindgen_prelude::*;

#[napi]
pub fn tokenize_zero_copy(source: Buffer) -> Vec<Token> {
    // Work directly with Node.js Buffer without copying
    let bytes = source.as_ref();
    let source_str = std::str::from_utf8(bytes).unwrap();

    tokenizer::tokenize(source_str)
}
```

---

## 5. Browser Considerations: WebAssembly Path

For browser environments, napi-rs native code won't work. Options:

### 5.1 wasm-bindgen Parallel Implementation

```rust
// Shared core library
// crates/lokascript-core/src/lib.rs
pub fn tokenize(source: &str) -> Vec<Token> { /* ... */ }
pub fn parse(tokens: &[Token]) -> AST { /* ... */ }

// Node.js bindings (napi-rs)
// crates/lokascript-napi/src/lib.rs
#[napi]
pub fn tokenize(source: String) -> Vec<Token> {
    lokascript_core::tokenize(&source)
}

// WASM bindings (wasm-bindgen)
// crates/lokascript-wasm/src/lib.rs
#[wasm_bindgen]
pub fn tokenize(source: &str) -> JsValue {
    let tokens = lokascript_core::tokenize(source);
    serde_wasm_bindgen::to_value(&tokens).unwrap()
}
```

### 5.2 Isomorphic Package Structure

```
@lokascript/native-core/
├── package.json
├── index.js           # Platform detection & loading
├── index.d.ts         # TypeScript definitions
├── wasm/
│   ├── lokascript_wasm_bg.wasm
│   └── lokascript_wasm.js
└── native/
    ├── linux-x64-gnu/
    ├── darwin-arm64/
    └── win32-x64-msvc/
```

```javascript
// index.js - Universal loader
const isNode = typeof process !== 'undefined' && process.versions?.node;
const isWorker = typeof WorkerGlobalScope !== 'undefined';

let binding;

if (isNode) {
  // Load native binary
  binding = require('./native/binding.node');
} else {
  // Load WASM for browsers
  const wasm = await import('./wasm/lokascript_wasm.js');
  await wasm.default();
  binding = wasm;
}

export const { tokenize, parse, evaluate } = binding;
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (2-3 weeks)

1. **Create Rust workspace**

   ```
   crates/
   ├── lokascript-core/      # Pure Rust implementations
   ├── lokascript-napi/      # Node.js bindings
   └── lokascript-wasm/      # Browser bindings (future)
   ```

2. **Implement native tokenizer**
   - Port tokenizer logic to Rust
   - Create napi-rs bindings
   - Benchmark against JavaScript version

3. **Set up CI/CD for native builds**
   - GitHub Actions matrix for platforms
   - Automated npm publishing

### Phase 2: Parser Migration (3-4 weeks)

1. **Port parser to Rust**
   - Implement Pratt parser for expressions
   - Match AST output with JavaScript version

2. **Create comprehensive test suite**
   - 1:1 output comparison with JS parser
   - Performance benchmarks

### Phase 3: Expression Evaluator (4-5 weeks)

1. **Native evaluation engine**
   - Core expression types in Rust
   - DOM integration via callbacks

2. **Hybrid evaluation mode**
   - Native for pure expressions
   - JS callback for DOM access

### Phase 4: Optimization & Polish (2-3 weeks)

1. **Object pooling in Rust**
2. **Parse result caching**
3. **String interning**
4. **Final benchmarks & documentation**

---

## 7. Expected Outcomes

### Performance Improvements

| Component       | Current (JS) | Native (Rust) | Improvement |
| --------------- | ------------ | ------------- | ----------- |
| Tokenization    | 15ms         | 5ms           | **67%**     |
| Parsing         | 25ms         | 10ms          | **60%**     |
| Expression Eval | 8ms          | 3ms           | **62%**     |
| Total Init      | 48ms         | 18ms          | **62%**     |

_Estimates based on typical napi-rs migration results_

### Bundle Size Impact

- **Node.js**: +2-5MB per platform (native binary)
- **Browser**: +100-200KB (WASM, gzipped)
- **JavaScript fallback**: 0 change (always available)

### Developer Experience

- **TypeScript definitions**: Auto-generated from Rust
- **Error messages**: Rich Rust error handling
- **Debugging**: Source maps for Rust code

---

## 8. Risks and Mitigations

| Risk                    | Impact | Mitigation                                |
| ----------------------- | ------ | ----------------------------------------- |
| Native build complexity | Medium | napi-rs CLI handles cross-compilation     |
| Platform coverage gaps  | Low    | JavaScript fallback always available      |
| AST compatibility       | High   | Extensive comparison testing              |
| Maintenance burden      | Medium | Shared core library minimizes duplication |
| Browser WASM size       | Low    | Lazy loading, code splitting              |

---

## 9. Conclusion

napi-rs patterns offer LokaScript a path to significant performance improvements while maintaining the excellent developer experience of the current TypeScript codebase. The key patterns to adopt:

1. **`#[napi]` macro** for seamless JavaScript binding generation
2. **AsyncTask** for non-blocking heavy computations
3. **Wrapper types** for clean Rust ↔ JavaScript data transfer
4. **Isomorphic packaging** for Node.js + Browser support

The recommended approach is a phased migration starting with the tokenizer (lowest risk, high reward) and progressively moving to parser and expression evaluation.

---

## References

- [napi-rs GitHub](https://github.com/napi-rs/napi-rs)
- [NAPI-RS Official Docs](https://napi.rs/)
- [Building Node.js modules in Rust](https://blog.logrocket.com/building-nodejs-modules-rust-napi-rs/)
- [NAPI-RS v2 Announcement](https://napi.rs/blog/announce-v2)
- [AsyncTask Pattern](https://napi.rs/docs/concepts/async-task)
- [Class Bindings](https://napi.rs/docs/concepts/class)
