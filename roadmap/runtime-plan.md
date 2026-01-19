# Integrated HyperScript Runtime Infrastructure Plan

## Executive Summary

This plan integrates the best ideas from both runtime proposals to create a
pragmatic, performance-focused architecture that advances hyperscript while
maintaining its core philosophy of simplicity and Locality of Behaviour. The
approach balances the compiler-first philosophy from runtime-alt with the
advanced runtime features from runtime-plan, creating a phased implementation
that delivers immediate value while building toward a revolutionary performance
profile.

## Core Architecture: Hybrid Compiler + Smart Runtime

### Philosophy: Progressive Enhancement Through Compilation

Rather than choosing between a pure runtime interpreter or a pure compiler
approach, we adopt a **hybrid architecture** that provides:

1. **Immediate Mode**: Drop-in runtime that works without any build step
   (preserving current UX)
2. **Compiled Mode**: Optional build-time compilation for production
   optimization
3. **Smart Runtime**: Advanced features (GPU acceleration, fine-grained
   reactivity) available in both modes

This approach respects hyperscript's simplicity while enabling modern
performance optimizations.

## Phase 1: Modular TypeScript Foundation (4 weeks)

### 1.1 Monorepo Structure

```
lokascript/
├── packages/
│   ├── @lokascript/core          # ~2KB minimal runtime
│   ├── @lokascript/runtime       # Tree-shakable command library
│   ├── @lokascript/parser        # Incremental parser (TypeScript initially)
│   ├── @lokascript/compiler      # Build-time compiler
│   ├── @lokascript/analyzer      # Static analysis engine
│   └── @lokascript/accelerator   # GPU/WASM acceleration layer
├── tools/
│   ├── @lokascript/cli          # Command-line interface
│   ├── @lokascript/vite-plugin  # Vite integration
│   └── @lokascript/lsp          # Language server
```

### 1.2 Core Runtime Architecture

Building on the validated Fixi.ts pattern, create a minimal core that handles:

```typescript
// @lokascript/core/runtime.ts
export interface LokaScriptRuntime {
  // Essential event delegation
  process(root: Element): void;

  // Command execution queue
  execute(commands: Command[], context: ExecutionContext): Promise<void>;

  // Lifecycle hooks for compiler integration
  onCompiled?: (element: Element, compiledFn: Function) => void;
  onInterpreted?: (element: Element, script: string) => void;
}

// Preserve backward compatibility
export const _hyperscript = {
  processNode: (node: Element) => runtime.process(node),
  // ... legacy API
};
```

### 1.3 Modular Command Library

Transform monolithic commands into tree-shakable functions:

```typescript
// @lokascript/runtime/commands/toggle.ts
export function toggleClass(element: Element, className: string): void {
  element.classList.toggle(className);
}

export function toggleAttribute(element: Element, attr: string): void {
  element.toggleAttribute(attr);
}

// @lokascript/runtime/commands/index.ts
export * from './toggle';
export * from './add';
export * from './remove';
// ... all commands as individual exports
```

## Phase 2: Incremental Parser Infrastructure (6 weeks)

### 2.1 TypeScript-First Parser

Start with a TypeScript implementation for rapid iteration, with clear
interfaces for future Rust/WASM optimization:

```typescript
// @lokascript/parser/incremental-parser.ts
export interface IncrementalParser {
  // Tree-sitter style incremental parsing
  parse(source: string): HyperScriptAST;
  edit(tree: HyperScriptAST, edit: TextEdit): HyperScriptAST;

  // Error recovery and suggestions
  recover(tree: HyperScriptAST, error: ParseError): HyperScriptAST;
  suggest(error: ParseError): Fix[];

  // Query system for analysis
  query(tree: HyperScriptAST, pattern: string): QueryResult[];
}

// AST designed for both interpretation and compilation
export interface HyperScriptAST {
  type: 'Program';
  features: Feature[];
  metadata: {
    source: string;
    implicitAsync: boolean;
    dependencies: Set<string>;
  };
}
```

### 2.2 Parser Implementation Strategy

1. **Week 1-2**: Basic tokenizer and grammar implementation
2. **Week 3-4**: Error recovery and incremental parsing
3. **Week 5-6**: AST optimization and query system

Key innovation: Design AST to support both runtime interpretation and
compile-time code generation.

## Phase 3: Static Analysis & Compiler (8 weeks)

### 3.1 Dependency Analysis Engine

```typescript
// @lokascript/analyzer/dependency-analyzer.ts
export class DependencyAnalyzer {
  analyze(ast: HyperScriptAST): DependencyGraph {
    const graph = new DependencyGraph();

    // Traverse AST and identify:
    // 1. Used commands (toggle, add, fetch)
    // 2. Used expressions (me, it, closest)
    // 3. DOM query patterns for optimization
    // 4. Async operation sequences

    return graph;
  }

  // Identify optimization opportunities
  findOptimizations(graph: DependencyGraph): Optimization[] {
    return [
      ...this.findBatchableOperations(graph),
      ...this.findParallelizableQueries(graph),
      ...this.findGPUCandidates(graph),
    ];
  }
}
```

### 3.2 Code Generation Pipeline

```typescript
// @lokascript/compiler/code-generator.ts
export class CodeGenerator {
  generate(ast: HyperScriptAST, analysis: AnalysisResult): string {
    // Generate optimized JavaScript
    return `
      import { ${analysis.imports.join(', ')} } from '@lokascript/runtime';
      import { accelerate } from '@lokascript/accelerator';
      
      export default function(element) {
        ${this.generateOptimizedCode(ast, analysis)}
      }
    `;
  }

  // Smart optimization based on patterns
  private generateOptimizedCode(ast: HyperScriptAST, analysis: AnalysisResult): string {
    if (analysis.hasGPUCandidates) {
      return this.generateGPUAcceleratedCode(ast);
    }
    if (analysis.hasBatchableOps) {
      return this.generateBatchedCode(ast);
    }
    return this.generateStandardCode(ast);
  }
}
```

## Phase 4: Advanced Runtime Features (6 weeks)

### 4.1 GPU Acceleration Layer

Integrate WebGPU for massive parallel operations:

```typescript
// @lokascript/accelerator/gpu-engine.ts
export class GPUAccelerator {
  // Detect GPU-suitable operations
  canAccelerate(operation: Operation): boolean {
    return (
      operation.type === 'BULK_QUERY' ||
      operation.type === 'PARALLEL_TRANSFORM' ||
      (operation.type === 'DOM_BATCH' && operation.count > 1000)
    );
  }

  // Compile to GPU shader
  async accelerate(operation: Operation): Promise<AcceleratedOperation> {
    const shader = this.compileToWGSL(operation);
    const pipeline = await this.device.createComputePipeline({
      compute: { module: shader, entryPoint: 'main' },
    });

    return new AcceleratedOperation(pipeline, operation);
  }
}
```

### 4.2 Fine-Grained Reactivity System

Implement Solid.js-style reactivity for optimal updates:

```typescript
// @lokascript/runtime/reactivity.ts
export class ReactiveSystem {
  // Signal-based state management
  createSignal<T>(value: T): [getter: () => T, setter: (v: T) => void] {
    const subscribers = new Set<() => void>();

    const getter = () => {
      if (currentEffect) subscribers.add(currentEffect);
      return value;
    };

    const setter = (newValue: T) => {
      value = newValue;
      subscribers.forEach(effect => effect());
    };

    return [getter, setter];
  }

  // Integrate with hyperscript commands
  makeReactive(element: Element, script: string): void {
    const [state, setState] = this.createSignal(element);
    // Compile script to use reactive primitives
  }
}
```

## Phase 5: Developer Experience (4 weeks)

### 5.1 Zero-Config Build Integration

```typescript
// @lokascript/vite-plugin/index.ts
export default function hyperFixiPlugin(): Plugin {
  return {
    name: 'lokascript',

    transform(code: string, id: string) {
      if (!id.endsWith('.html')) return;

      // Find all _ attributes
      const scripts = extractHyperScripts(code);

      // Compile each script
      const compiled = scripts.map(script =>
        compiler.compile(script, {
          mode: 'production',
          optimize: true,
          treeShake: true,
        })
      );

      // Replace with compiled versions
      return replaceWithCompiled(code, compiled);
    },
  };
}
```

### 5.2 Language Server Protocol

Provide IDE support for hyperscript in HTML:

```typescript
// @lokascript/lsp/server.ts
export class HyperScriptLanguageServer {
  // Syntax highlighting
  provideSemanticTokens(document: TextDocument): SemanticTokens {
    const tokens = this.parser.parse(document.getText());
    return this.highlighter.highlight(tokens);
  }

  // Intelligent completions
  provideCompletions(position: Position): CompletionItem[] {
    const context = this.analyzer.getContext(position);
    return this.getRelevantCompletions(context);
  }

  // Real-time error checking
  provideDiagnostics(document: TextDocument): Diagnostic[] {
    const ast = this.parser.parse(document.getText());
    return this.analyzer.findErrors(ast);
  }
}
```

## Implementation Checklist & Timeline

_This step-by-step checklist ensures systematic delivery of the hybrid
compiler + runtime architecture. Each item should be checked off as completed to
maintain project momentum and context._

### 📋 Phase 1: Modular TypeScript Foundation (4 weeks)

#### Week 1-2: Monorepo Setup & Core Runtime

- [ ] **Monorepo Architecture**
  - [ ] Set up Lerna/Nx workspace with @lokascript packages
  - [ ] Configure TypeScript build pipeline across packages
  - [ ] Set up testing infrastructure with Vitest
  - [ ] Create initial package structure (core, runtime, parser, compiler)
- [ ] **Core Runtime Refactor**
  - [ ] Extract minimal 2KB @lokascript/core runtime
  - [ ] Implement LokaScriptRuntime interface with process/execute
  - [ ] Add lifecycle hooks for compiler integration
  - [ ] Preserve \_hyperscript.processNode() backward compatibility

#### Week 3-4: Modular Command System

- [ ] **Tree-Shakable Commands**
  - [ ] Convert monolithic commands to individual functions
  - [ ] Implement toggle, add, remove, put commands as separate exports
  - [ ] Create command registration and execution system
  - [ ] Add tree-shaking validation and bundle size testing
- [ ] **Test Compatibility**
  - [ ] Achieve 100% official \_hyperscript test suite compatibility
  - [ ] Validate performance matches/exceeds original
  - [ ] Create migration testing for existing projects
  - [ ] Document API compatibility guarantees

### 📋 Phase 2: Incremental Parser Infrastructure (6 weeks)

#### Week 5-6: TypeScript Parser Foundation

- [ ] **Parser Architecture**
  - [ ] Implement IncrementalParser interface with parse/edit methods
  - [ ] Design HyperScriptAST for both interpretation and compilation
  - [ ] Create basic tokenizer with hyperscript grammar
  - [ ] Add metadata tracking (dependencies, async detection)
- [ ] **AST Design**
  - [ ] Define Feature nodes for commands, expressions, events
  - [ ] Add source location preservation for debugging
  - [ ] Implement AST serialization/deserialization
  - [ ] Create AST validation and type checking

#### Week 7-8: Error Recovery & Incremental Parsing

- [ ] **Error Handling**
  - [ ] Implement parse error detection and classification
  - [ ] Add intelligent error recovery mechanisms
  - [ ] Create fix suggestion algorithms
  - [ ] Build comprehensive error message system
- [ ] **Incremental Features**
  - [ ] Add Tree-sitter style incremental updates
  - [ ] Implement memory-efficient AST sharing
  - [ ] Create edit tracking and change detection
  - [ ] Add performance benchmarking for parsing speed

#### Week 9-10: Query System & Optimization

- [ ] **AST Query System**
  - [ ] Implement S-expression pattern matching
  - [ ] Add AST traversal and search capabilities
  - [ ] Create dependency extraction from AST
  - [ ] Build optimization opportunity detection
- [ ] **Parser Optimization**
  - [ ] Optimize parsing performance (<10ms full parse)
  - [ ] Add incremental update performance (<1ms)
  - [ ] Implement parser caching and memoization
  - [ ] Create comprehensive parser test suite

### 📋 Phase 3: Static Analysis & Compiler (8 weeks)

#### Week 11-12: Dependency Analysis Engine

- [ ] **Dependency Analysis**
  - [ ] Implement DependencyAnalyzer with AST traversal
  - [ ] Detect used commands, expressions, DOM patterns
  - [ ] Identify async operation sequences
  - [ ] Create dependency graph representation
- [ ] **Optimization Detection**
  - [ ] Find batchable DOM operations
  - [ ] Detect parallelizable queries
  - [ ] Identify GPU acceleration candidates
  - [ ] Add optimization scoring and prioritization

#### Week 13-14: Code Generation Pipeline

- [ ] **Code Generator**
  - [ ] Implement CodeGenerator with optimized JavaScript output
  - [ ] Add smart import generation based on usage
  - [ ] Create compilation target selection (standard/batched/GPU)
  - [ ] Implement source map generation for debugging
- [ ] **Optimization Strategies**
  - [ ] Add GPU-accelerated code generation
  - [ ] Implement DOM operation batching
  - [ ] Create async operation optimization
  - [ ] Add dead code elimination and tree shaking

#### Week 15-16: Build Integration & Testing

- [ ] **Build Pipeline**
  - [ ] Create compilation API with optimize/treeShake options
  - [ ] Add development vs production mode handling
  - [ ] Implement incremental compilation
  - [ ] Create build output validation and testing
- [ ] **Compiler Testing**
  - [ ] Validate compiled output matches runtime behavior
  - [ ] Test performance improvements vs interpretation
  - [ ] Add regression testing for optimization correctness
  - [ ] Create comprehensive compiler benchmark suite

#### Week 17-18: Advanced Optimizations

- [ ] **GPU Acceleration Integration**
  - [ ] Integrate WebGPU compute shader generation
  - [ ] Add WASM SIMD optimization detection
  - [ ] Implement hybrid CPU/GPU execution planning
  - [ ] Create fallback mechanisms for unsupported hardware
- [ ] **Advanced Features**
  - [ ] Add fine-grained reactivity compilation
  - [ ] Implement island architecture code generation
  - [ ] Create advanced bundle splitting strategies
  - [ ] Add runtime performance monitoring integration

### 📋 Phase 4: Advanced Runtime Features (6 weeks)

#### Week 19-20: GPU Acceleration Layer

- [ ] **WebGPU Integration**
  - [ ] Implement GPUAccelerator with operation detection
  - [ ] Add WGSL compute shader compilation
  - [ ] Create GPU memory management and buffer handling
  - [ ] Add performance profiling and threshold detection
- [ ] **Acceleration Framework**
  - [ ] Build smart CPU/GPU selection algorithms
  - [ ] Implement graceful fallbacks for compatibility
  - [ ] Add acceleration performance monitoring
  - [ ] Create comprehensive GPU acceleration test suite

#### Week 21-22: Fine-Grained Reactivity System

- [ ] **Reactivity Foundation**
  - [ ] Implement signal-based reactive system
  - [ ] Add effect tracking and subscription management
  - [ ] Create batched update mechanisms
  - [ ] Build reactive DOM update optimization
- [ ] **HyperScript Integration**
  - [ ] Integrate reactivity with command execution
  - [ ] Add automatic dependency tracking for expressions
  - [ ] Create reactive compilation targets
  - [ ] Implement performance testing vs virtual DOM

#### Week 23-24: Performance Optimization & Validation

- [ ] **Performance Validation**
  - [ ] Achieve 2x performance improvement over original
  - [ ] Validate 100x+ GPU speedup for bulk operations
  - [ ] Test <50ms cold start performance
  - [ ] Ensure <5KB minimal bundle, <20KB full features
- [ ] **Integration Testing**
  - [ ] Test all advanced features together
  - [ ] Validate memory usage and garbage collection
  - [ ] Add comprehensive performance regression testing
  - [ ] Create production-ready performance monitoring

### 📋 Phase 5: Developer Experience (4 weeks)

#### Week 25-26: Build Tool Integration

- [ ] **Vite Plugin**
  - [ ] Implement @lokascript/vite-plugin with auto-compilation
  - [ ] Add development mode with fast refresh
  - [ ] Create production optimization pipeline
  - [ ] Add comprehensive Vite integration testing
- [ ] **CLI Development**
  - [ ] Create @lokascript/cli for standalone compilation
  - [ ] Add watch mode and incremental builds
  - [ ] Implement project analysis and optimization suggestions
  - [ ] Create migration tooling from \_hyperscript

#### Week 27-28: Language Server & IDE Support

- [ ] **Language Server Protocol**
  - [ ] Implement HyperScriptLanguageServer with full LSP support
  - [ ] Add syntax highlighting and semantic tokens
  - [ ] Create intelligent completions and hover information
  - [ ] Implement real-time error checking and diagnostics
- [ ] **IDE Integration**
  - [ ] Create VS Code extension with full IntelliSense
  - [ ] Add syntax highlighting for hyperscript in HTML
  - [ ] Implement go-to-definition and find references
  - [ ] Create comprehensive IDE feature testing

### 📋 Success Validation Checklist

#### Performance Targets

- [ ] **Bundle Size**: <5KB minimal, <20KB full features achieved
- [ ] **Parse Performance**: <1ms incremental, <10ms full parse
- [ ] **Runtime Performance**: 2x faster than original validated
- [ ] **GPU Acceleration**: 100x+ speedup for bulk operations
- [ ] **Cold Start**: <50ms with compiled output

#### Compatibility & Quality

- [ ] **Test Suite**: 100% official \_hyperscript compatibility
- [ ] **API Compatibility**: Full backward compatibility validated
- [ ] **Migration Path**: Automated tooling working
- [ ] **Documentation**: Comprehensive guides with examples

#### Developer Experience

- [ ] **Zero Config**: Vite/Next.js integration working
- [ ] **IDE Support**: Full IntelliSense in VS Code
- [ ] **Error Messages**: Clear, actionable descriptions
- [ ] **Build Integration**: Seamless compilation pipeline

---

## Implementation Timeline & Priorities

### Immediate Term (Weeks 1-4): Foundation

1. **Week 1-2**: Set up monorepo, begin modular runtime refactor
2. **Week 3-4**: Complete core runtime, achieve 100% test compatibility

### Short Term (Weeks 5-10): Parser & Analysis

1. **Week 5-8**: Implement incremental parser with error recovery
2. **Week 9-10**: Build dependency analyzer and optimization detector

### Medium Term (Weeks 11-18): Compiler & Optimization

1. **Week 11-14**: Implement code generator with basic optimizations
2. **Week 15-18**: Add GPU acceleration and advanced optimizations

### Long Term (Weeks 19-28): Runtime & Tools

1. **Week 19-24**: Advanced runtime features and performance optimization
2. **Week 25-28**: Developer experience and tooling integration

## Success Metrics

### Performance Targets

- **Bundle Size**: <5KB for minimal usage, <20KB for full features
- **Parse Time**: <1ms incremental updates, <10ms full parse
- **Runtime Performance**: 2x faster than current for standard operations
- **GPU Acceleration**: 100x+ speedup for bulk operations
- **Cold Start**: <50ms with compiled output

### Compatibility Goals

- **Test Suite**: 100% official \_hyperscript test compatibility
- **API Surface**: Full backward compatibility with legacy mode
- **Migration Path**: Automated tooling for existing projects

### Developer Experience

- **Zero Config**: Works out-of-box with Vite/Next.js
- **IDE Support**: Full IntelliSense in VS Code
- **Error Messages**: Clear, actionable error descriptions
- **Documentation**: Comprehensive guides with examples

## Risk Mitigation

### Technical Risks

1. **Parser Complexity**: Start with TypeScript, optimize later with Rust/WASM
2. **GPU Compatibility**: Graceful fallback to CPU for unsupported hardware
3. **Bundle Size**: Aggressive tree-shaking and modular architecture

### Adoption Risks

1. **Breaking Changes**: Maintain 100% backward compatibility mode
2. **Learning Curve**: Provide incremental adoption path
3. **Performance Regression**: Comprehensive benchmarking suite

## Conclusion

This integrated plan combines the pragmatic compiler-first approach from
runtime-alt with the advanced runtime features from runtime-plan. By starting
with a modular TypeScript foundation and progressively adding compilation and
acceleration features, we can deliver immediate value while building toward a
revolutionary performance profile.

The hybrid architecture respects hyperscript's philosophy of simplicity while
enabling cutting-edge optimizations. Users can start with the familiar drop-in
runtime and progressively adopt build-time compilation as their needs grow.

Most importantly, this plan is actionable and achievable. Each phase delivers
concrete value, and the modular architecture ensures that work can proceed in
parallel across different aspects of the system. The result will be a
hyperscript implementation that is not just compatible with the original, but
significantly advances the state of the art in declarative DOM scripting
languages.
