# HyperFixi Advanced AST Toolkit - Test-Driven Development Plan

**Created**: July 2025\
**Status**: **STRATEGIC PRIORITY UPDATE** - Ready to begin Phase 1\
**Goal**: Build a comprehensive AST toolkit for hyperscript with AI-friendly
APIs\
**Approach**: Strict Test-Driven Development with incremental feature delivery

## 🎯 STRATEGIC PRIORITY UPDATE (July 2025)

**Current Status Assessment**:

- ✅ **Parser Integration**: 1,121-line parser implementation complete
  (`src/parser/parser.ts`)
- ✅ **Runtime System**: 596-line runtime with command execution
  (`src/runtime/runtime.ts`)
- ✅ **API Integration**: Complete hyperscript API
  (`src/api/hyperscript-api.ts`)
- ✅ **Browser Compatibility**: 93% compatibility with official _hyperscript
  (68/73 tests)
- ✅ **LSP Foundation**: 9,381 lines of LSP reference data ready for integration

**Recommended Implementation Timeline**: **4-7 weeks** (prioritized over
original 6-week plan)

### Phase 1 Priority: AST Query & Analysis (2-3 weeks)

Focus on high-value developer tooling that leverages existing parser
infrastructure:

- **Week 1-2**: Visitor pattern + AST traversal (foundation for all other tools)
- **Week 2-3**: Query language for code analysis (enables IDE features)
- **Immediate Value**: Code analysis, pattern detection, developer insights

### Phase 2 Priority: LSP Server Integration (1-2 weeks)

Leverage existing 9,381 lines of LSP data for rapid implementation:

- **Week 3-4**: LSP server with existing reference data
- **Week 4**: IDE integration (VS Code extension)
- **Immediate Value**: Syntax highlighting, autocomplete, error detection

### Phase 3 Priority: AI-Friendly APIs (1-2 weeks)

Build on established foundation for modern development workflows:

- **Week 5-6**: Natural language interfaces
- **Week 6-7**: Code generation and transformation APIs
- **Immediate Value**: LLM integration, automated refactoring

**Deferred Components**: Code generation, advanced optimization passes (can be
added later based on community needs)

## Executive Summary

This plan outlines the development of an advanced AST (Abstract Syntax Tree)
toolkit for HyperFixi that will enable powerful code analysis, transformation,
and AI-assisted development features. The toolkit will be built using strict TDD
principles, ensuring high quality and maintainability while providing unique
value in the lightweight scripting library space.

## Core Value Propositions

1. **For Developers**: Powerful code analysis and transformation tools
2. **For AI/LLMs**: Structured AST manipulation with natural language APIs
3. **For Tool Builders**: Foundation for IDE extensions, linters, and optimizers
4. **For HyperFixi**: Differentiation as the only lightweight scripting library
   with advanced AST tooling

## Architecture Overview

```
@hyperfixi/ast-toolkit/
├── src/
│   ├── visitor/          # AST traversal and visitor pattern
│   ├── transformer/      # AST transformation utilities
│   ├── analyzer/         # Code analysis and metrics
│   ├── generator/        # Code generation from AST
│   ├── query/           # AST querying and pattern matching
│   ├── optimizer/       # AST optimization passes
│   ├── ai/             # AI-friendly APIs
│   └── index.ts        # Public API
├── tests/
│   └── [mirrors src structure]
└── examples/
    ├── basic/          # Basic usage examples
    ├── advanced/       # Complex transformations
    └── ai-integration/ # AI/LLM integration examples
```

## Phase 1: Foundation - Visitor Pattern & Traversal (Week 1)

### Day 1-2: Basic Visitor Infrastructure

**Test First:**

```typescript
// tests/visitor/visitor.test.ts
import { describe, expect, it } from "vitest";
import { ASTVisitor, visit } from "../../src/visitor";
import { parse } from "@hyperfixi/core";

describe("ASTVisitor - Basic Traversal", () => {
  it("should visit all nodes in order", () => {
    const ast = parse("on click add .active to me").node;
    const visited: string[] = [];

    const visitor = new ASTVisitor({
      enter(node) {
        visited.push(`enter:${node.type}`);
      },
      exit(node) {
        visited.push(`exit:${node.type}`);
      },
    });

    visit(ast, visitor);

    expect(visited).toEqual([
      "enter:eventHandler",
      "enter:command",
      "enter:selector",
      "exit:selector",
      "enter:identifier",
      "exit:identifier",
      "exit:command",
      "exit:eventHandler",
    ]);
  });

  it("should support node-specific visitors", () => {
    const ast = parse("toggle .hidden on #modal").node;
    const selectors: string[] = [];

    const visitor = new ASTVisitor({
      selector(node) {
        selectors.push(node.value);
      },
    });

    visit(ast, visitor);
    expect(selectors).toEqual([".hidden", "#modal"]);
  });

  it("should allow visitor to skip subtrees", () => {
    const ast = parse("if x > 5 then add .big else add .small").node;
    const visited: string[] = [];

    const visitor = new ASTVisitor({
      enter(node, context) {
        visited.push(node.type);
        if (node.type === "conditionalExpression") {
          context.skip(); // Skip visiting children
        }
      },
    });

    visit(ast, visitor);
    expect(visited).toEqual(["conditionalExpression"]);
  });
});
```

**Implementation:**

```typescript
// src/visitor/visitor.ts
export interface VisitorContext {
  skip(): void;
  stop(): void;
  replace(node: ASTNode): void;
}

export class ASTVisitor {
  constructor(private handlers: VisitorHandlers) {}
  // Implementation after tests pass
}
```

### Day 3-4: Advanced Visitor Features

**Test First:**

```typescript
describe("ASTVisitor - Advanced Features", () => {
  it("should collect node paths during traversal", () => {
    const ast = parse("on click add .active to me").node;
    const paths: string[] = [];

    const visitor = new ASTVisitor({
      enter(node, context) {
        paths.push(context.getPath().join("/"));
      },
    });

    visit(ast, visitor);
    expect(paths).toContain("eventHandler/commands/0");
  });

  it("should support parent node access", () => {
    const ast = parse("my value + 10").node;
    let capturedParent: ASTNode | null = null;

    const visitor = new ASTVisitor({
      identifier(node, context) {
        if (node.name === "value") {
          capturedParent = context.getParent();
        }
      },
    });

    visit(ast, visitor);
    expect(capturedParent?.type).toBe("memberExpression");
  });

  it("should maintain scope information", () => {
    const ast = parse("on click set x to 5 then log x").node;
    const scopes: Map<string, any>[] = [];

    const visitor = new ASTVisitor({
      command(node, context) {
        if (node.name === "log") {
          scopes.push(new Map(context.getScope()));
        }
      },
    });

    visit(ast, visitor);
    expect(scopes[0].get("x")).toBe(5);
  });
});
```

### Day 5: Visitor Utilities

**Test First:**

```typescript
describe("Visitor Utilities", () => {
  it("should find all nodes matching predicate", () => {
    const ast = parse("add .one to me then add .two to you").node;

    const nodes = findNodes(
      ast,
      (node) => node.type === "selector" && node.value.startsWith("."),
    );

    expect(nodes).toHaveLength(2);
    expect(nodes.map((n) => n.value)).toEqual([".one", ".two"]);
  });

  it("should find first node matching predicate", () => {
    const ast = parse("if x > 5 then add .big").node;

    const node = findFirst(ast, (n) => n.type === "command");
    expect(node?.name).toBe("add");
  });

  it("should get all ancestors of a node", () => {
    const ast = parse("on click add .active").node;
    const targetNode = findFirst(ast, (n) => n.type === "selector");

    const ancestors = getAncestors(ast, targetNode!);
    expect(ancestors.map((n) => n.type)).toEqual(["command", "eventHandler"]);
  });
});
```

## Phase 2: AST Transformation (Week 2)

### Day 6-7: Basic Transformations

**Test First:**

```typescript
// tests/transformer/transformer.test.ts
describe("AST Transformer - Basic", () => {
  it("should transform nodes using visitor pattern", () => {
    const ast = parse("add .old to me").node;

    const transformed = transform(ast, {
      selector(node) {
        if (node.value === ".old") {
          return { ...node, value: ".new" };
        }
      },
    });

    const newSelector = findFirst(transformed, (n) => n.type === "selector");
    expect(newSelector?.value).toBe(".new");
  });

  it("should support removing nodes", () => {
    const ast = parse('log "debug" then add .active').node;

    const transformed = transform(ast, {
      command(node) {
        if (node.name === "log") {
          return null; // Remove node
        }
      },
    });

    const commands = findNodes(transformed, (n) => n.type === "command");
    expect(commands).toHaveLength(1);
    expect(commands[0].name).toBe("add");
  });

  it("should support replacing nodes with multiple nodes", () => {
    const ast = parse("toggle .active on me").node;

    const transformed = transform(ast, {
      command(node) {
        if (node.name === "toggle") {
          return [
            createCommand("remove", [".active"], ["me"]),
            createCommand("add", [".inactive"], ["me"]),
          ];
        }
      },
    });

    const commands = findNodes(transformed, (n) => n.type === "command");
    expect(commands).toHaveLength(2);
  });
});
```

### Day 8-9: Advanced Transformations

**Test First:**

```typescript
describe("AST Transformer - Advanced", () => {
  it("should support transformation context", () => {
    const ast = parse("on click set counter to counter + 1").node;

    const transformed = transform(ast, {
      identifier(node, context) {
        if (node.name === "counter" && context.isInAssignment()) {
          return { ...node, name: "clickCount" };
        }
      },
    });

    const identifiers = findNodes(
      transformed,
      (n) => n.type === "identifier" && n.name === "clickCount",
    );
    expect(identifiers).toHaveLength(2);
  });

  it("should optimize redundant operations", () => {
    const ast = parse("add .a then remove .a then add .a").node;

    const optimized = optimize(ast, {
      redundantClassOperations: true,
    });

    const commands = findNodes(optimized, (n) => n.type === "command");
    expect(commands).toHaveLength(1);
    expect(commands[0].name).toBe("add");
  });

  it("should batch similar operations", () => {
    const ast =
      parse("add .one to me then add .two to me then add .three to me").node;

    const optimized = optimize(ast, {
      batchSimilarOperations: true,
    });

    const commands = findNodes(optimized, (n) => n.type === "command");
    expect(commands).toHaveLength(1);
    expect(commands[0].name).toBe("add");
    expect(commands[0].args).toHaveLength(3); // Combined classes
  });
});
```

### Day 10: Transformation Utilities

**Test First:**

```typescript
describe("Transformation Utilities", () => {
  it("should normalize AST structure", () => {
    const ast = parse("on  click   add   .active").node;

    const normalized = normalize(ast);
    const generated = generate(normalized);

    expect(generated).toBe("on click add .active");
  });

  it("should inline simple variables", () => {
    const ast = parse("set x to 5 then add .active to x").node;

    const inlined = inlineVariables(ast);
    const lastCommand = findLast(inlined, (n) => n.type === "command");

    expect(lastCommand?.args[1]).toEqual({
      type: "literal",
      value: 5,
    });
  });

  it("should extract repeated expressions", () => {
    const ast = parse("if x * 2 + 1 > 10 then log x * 2 + 1").node;

    const extracted = extractCommonExpressions(ast);
    const setCommands = findNodes(
      extracted,
      (n) => n.type === "command" && n.name === "set",
    );

    expect(setCommands).toHaveLength(1); // Created temp variable
  });
});
```

## Phase 3: AST Analysis & Metrics (Week 3)

### Day 11-12: Code Complexity Analysis

**Test First:**

```typescript
// tests/analyzer/complexity.test.ts
describe("Complexity Analysis", () => {
  it("should calculate cyclomatic complexity", () => {
    const ast = parse(`
      on click
        if x > 5 then
          add .big
        else if x > 2 then
          add .medium
        else
          add .small
        end
    `).node;

    const complexity = calculateComplexity(ast);

    expect(complexity).toEqual({
      cyclomatic: 3, // 3 decision points
      cognitive: 5, // Nesting and conditions
      halstead: {
        vocabulary: 12,
        length: 15,
        difficulty: 2.5,
      },
    });
  });

  it("should identify code smells", () => {
    const ast = parse(`
      on click
        if a then if b then if c then if d then add .nested end end end end
    `).node;

    const smells = detectCodeSmells(ast);

    expect(smells).toContainEqual({
      type: "excessive-nesting",
      severity: "high",
      location: expect.any(Object),
      message: "Nesting depth of 4 exceeds recommended maximum of 3",
    });
  });

  it("should calculate maintainability index", () => {
    const ast = parse("on click toggle .active on me").node;

    const metrics = analyzeMetrics(ast);

    expect(metrics.maintainabilityIndex).toBeGreaterThan(80);
    expect(metrics.readabilityScore).toBeGreaterThan(90);
  });
});
```

### Day 13-14: Dependency & Pattern Analysis

**Test First:**

```typescript
describe("Pattern Analysis", () => {
  it("should detect common patterns", () => {
    const ast = parse(`
      on click
        toggle .menu on #sidebar
        toggle .overlay on body
    `).node;

    const patterns = detectPatterns(ast);

    expect(patterns).toContainEqual({
      type: "toggle-pair",
      confidence: 0.9,
      suggestion: "Consider using a behavior for coordinated toggles",
    });
  });

  it("should analyze variable dependencies", () => {
    const ast = parse(`
      set x to 5
      set y to x * 2
      set z to y + x
      log z
    `).node;

    const deps = analyzeDependencies(ast);

    expect(deps.graph).toEqual({
      x: [],
      y: ["x"],
      z: ["x", "y"],
    });

    expect(deps.order).toEqual(["x", "y", "z"]);
  });

  it("should identify dead code", () => {
    const ast = parse(`
      set unused to 42
      on click add .active
    `).node;

    const deadCode = findDeadCode(ast);

    expect(deadCode).toHaveLength(1);
    expect(deadCode[0].type).toBe("unused-variable");
    expect(deadCode[0].name).toBe("unused");
  });
});
```

### Day 15: Performance Analysis

**Test First:**

```typescript
describe("Performance Analysis", () => {
  it("should identify performance bottlenecks", () => {
    const ast = parse(`
      on click
        repeat for item in <.items/>
          add .active to item
          wait 10ms
        end
    `).node;

    const bottlenecks = analyzePerformance(ast);

    expect(bottlenecks).toContainEqual({
      type: "dom-thrashing",
      severity: "medium",
      location: expect.any(Object),
      suggestion: "Batch DOM operations outside of loop",
    });
  });

  it("should suggest optimizations", () => {
    const ast = parse(`
      on click
        add .one to me
        add .two to me  
        add .three to me
    `).node;

    const suggestions = suggestOptimizations(ast);

    expect(suggestions).toContainEqual({
      type: "batch-operations",
      impact: "high",
      suggestion: "Combine multiple add operations: add .one .two .three to me",
    });
  });
});
```

## Phase 4: Code Generation (Week 4)

### Day 16-17: Basic Code Generation

**Test First:**

```typescript
// tests/generator/generator.test.ts
describe("Code Generator - Basic", () => {
  it("should generate hyperscript from AST", () => {
    const ast = parse("on click add .active to me").node;

    const generated = generate(ast);

    expect(generated).toBe("on click add .active to me");
  });

  it("should preserve formatting options", () => {
    const ast = parse("if x>5 then add .big else add .small end").node;

    const generated = generate(ast, {
      spacing: {
        aroundOperators: true,
        afterCommas: true,
      },
      indentation: "  ",
    });

    expect(generated).toBe(
      "if x > 5 then\n" +
        "  add .big\n" +
        "else\n" +
        "  add .small\n" +
        "end",
    );
  });

  it("should support minification", () => {
    const ast = parse("on click add .active to me then wait 1s").node;

    const minified = generate(ast, { minify: true });

    expect(minified).toBe("on click add.active to me then wait 1s");
  });
});
```

### Day 18-19: Advanced Generation

**Test First:**

```typescript
describe("Code Generator - Advanced", () => {
  it("should generate with source maps", () => {
    const ast = parse("on click\n  add .active\n  to me").node;

    const { code, sourceMap } = generateWithSourceMap(ast, {
      sourceFileName: "input.hs",
      outputFileName: "output.hs",
    });

    expect(sourceMap.mappings).toBeDefined();
    expect(sourceMap.sources).toContain("input.hs");
  });

  it("should generate JavaScript from hyperscript AST", () => {
    const ast = parse("on click toggle .active on me").node;

    const js = generateJavaScript(ast);

    expect(js).toContain("addEventListener");
    expect(js).toContain("classList.toggle");
  });

  it("should generate TypeScript with type annotations", () => {
    const ast = parse("on click set count to count + 1").node;

    const ts = generateTypeScript(ast, {
      strict: true,
    });

    expect(ts).toContain(": number");
    expect(ts).toContain(": HTMLElement");
  });
});
```

### Day 20: Template Generation

**Test First:**

```typescript
describe("Template Generation", () => {
  it("should generate from templates", () => {
    const template = parseTemplate("on {{event}} add .{{class}} to {{target}}");

    const generated = generateFromTemplate(template, {
      event: "click",
      class: "active",
      target: "me",
    });

    expect(generated).toBe("on click add .active to me");
  });

  it("should support conditional template sections", () => {
    const template = parseTemplate(`
      on click
        {{#if hasCondition}}
          if {{condition}} then
        {{/if}}
        add .{{class}}
    `);

    const generated = generateFromTemplate(template, {
      hasCondition: true,
      condition: "x > 5",
      class: "active",
    });

    expect(generated).toContain("if x > 5 then");
  });
});
```

## Phase 5: AST Query Language (Week 5)

### Day 21-22: Query Engine

**Test First:**

```typescript
// tests/query/query.test.ts
describe("AST Query Language", () => {
  it("should query using CSS-like selectors", () => {
    const ast = parse("on click add .active to me then remove .inactive").node;

    const nodes = query(ast, 'command[name="add"]');

    expect(nodes).toHaveLength(1);
    expect(nodes[0].name).toBe("add");
  });

  it("should support complex queries", () => {
    const ast = parse(`
      on click
        if x > 5 then
          add .big to me
        else
          add .small to you
        end
    `).node;

    const nodes = query(
      ast,
      'conditionalExpression command:has(identifier[name="me"])',
    );

    expect(nodes).toHaveLength(1);
    expect(nodes[0].args[0].value).toBe(".big");
  });

  it("should support XPath-like queries", () => {
    const ast = parse("on click set x to 5 then log x").node;

    const nodes = queryXPath(
      ast,
      '//command[@name="set"]/following-sibling::command',
    );

    expect(nodes).toHaveLength(1);
    expect(nodes[0].name).toBe("log");
  });
});
```

### Day 23-24: Pattern Matching

**Test First:**

```typescript
describe("Pattern Matching", () => {
  it("should match AST patterns", () => {
    const ast = parse("add .active to me then remove .inactive from me").node;

    const pattern = parsePattern(
      "add $class to $target then remove $_ from $target",
    );
    const matches = matchPattern(ast, pattern);

    expect(matches).toEqual({
      class: { type: "selector", value: ".active" },
      target: { type: "identifier", name: "me" },
    });
  });

  it("should support wildcard matching", () => {
    const ast = parse("on click if x > 5 then add .big end").node;

    const matches = matchWildcard(ast, "on * if * then add .big");

    expect(matches).toBeTruthy();
  });

  it("should extract repeated patterns", () => {
    const ast = parse(`
      on click toggle .menu
      on hover toggle .tooltip  
      on focus toggle .highlight
    `).node;

    const patterns = extractPatterns(ast);

    expect(patterns[0]).toEqual({
      pattern: "on $event toggle $class",
      occurrences: 3,
      bindings: [
        { event: "click", class: ".menu" },
        { event: "hover", class: ".tooltip" },
        { event: "focus", class: ".highlight" },
      ],
    });
  });
});
```

## Phase 6: AI-Friendly APIs (Week 6)

### Day 25-26: Natural Language Interface

**Test First:**

```typescript
// tests/ai/natural-language.test.ts
describe("Natural Language APIs", () => {
  it("should explain AST in natural language", () => {
    const ast = parse("on click toggle .active on me").node;

    const explanation = explainAST(ast);

    expect(explanation).toBe(
      'When clicked, toggle the "active" class on the current element',
    );
  });

  it("should generate AST from intent", () => {
    const intent = "when the user hovers, show a tooltip";

    const ast = generateFromIntent(intent);
    const code = generate(ast);

    expect(code).toMatch(/on hover/);
    expect(code).toMatch(/show|add/);
  });

  it("should suggest improvements", () => {
    const ast = parse(`
      on click
        add .red to me
        remove .blue from me
        add .green to me
        remove .yellow from me
    `).node;

    const suggestions = suggestImprovements(ast);

    expect(suggestions[0]).toEqual({
      type: "simplification",
      description: "Group class operations",
      suggestion:
        "on click add .red .green to me and remove .blue .yellow from me",
      impact: "readability",
    });
  });
});
```

### Day 27-28: Semantic Analysis

**Test First:**

```typescript
describe("Semantic Analysis for AI", () => {
  it("should extract semantic meaning", () => {
    const ast = parse("on click toggle .dark-mode on body").node;

    const semantics = extractSemantics(ast);

    expect(semantics).toEqual({
      intent: "theme-switching",
      trigger: "user-interaction",
      effect: "visual-state-change",
      scope: "global",
      tags: ["ui", "theme", "toggle", "accessibility"],
    });
  });

  it("should find similar code patterns", () => {
    const ast1 = parse("on click add .active to me").node;
    const ast2 = parse("on mousedown add .pressed to me").node;
    const ast3 = parse("on hover set x to 5").node;

    const similar = findSimilar(ast1, [ast2, ast3]);

    expect(similar[0].similarity).toBeGreaterThan(0.8);
    expect(similar[0].ast).toBe(ast2);
  });

  it("should generate variations", () => {
    const ast = parse("on click add .active").node;

    const variations = generateVariations(ast, {
      count: 3,
      aspects: ["event", "action", "target"],
    });

    expect(variations).toHaveLength(3);
    expect(variations.map((v) => generate(v))).toContain(
      "on hover add .active",
    );
  });
});
```

### Day 29-30: Integration & Polish

**Test First:**

```typescript
describe("Complete AI Toolkit Integration", () => {
  it("should provide end-to-end AI workflow", async () => {
    // Natural language to code
    const intent = "make a button that toggles dark mode";
    const ast = await generateFromIntent(intent);

    // Analyze and improve
    const analysis = await analyzeAST(ast);
    const improved = await applyImprovements(ast, analysis.suggestions);

    // Generate optimized code
    const code = generate(improved, { optimize: true });

    expect(code).toMatch(/toggle.*dark/i);
    expect(analysis.complexity.cyclomatic).toBeLessThan(3);
  });

  it("should support conversational refinement", async () => {
    const conversation = createAIConversation();

    // Initial request
    let ast = await conversation.request("add a click handler");
    expect(generate(ast)).toMatch(/on click/);

    // Refinement
    ast = await conversation.refine("make it toggle a class instead");
    expect(generate(ast)).toMatch(/on click toggle/);

    // Further refinement
    ast = await conversation.refine(
      'the class should be "active" on the parent',
    );
    expect(generate(ast)).toBe("on click toggle .active on parent");
  });
});
```

## Implementation Guidelines

### TDD Workflow

1. **Red Phase**: Write failing test with clear expectations
2. **Green Phase**: Implement minimal code to pass test
3. **Refactor Phase**: Improve code quality while keeping tests green

### Code Organization

```typescript
// Example structure for each module
// src/visitor/visitor.ts
export interface VisitorHandlers {
  enter?: (node: ASTNode, context: VisitorContext) => void;
  exit?: (node: ASTNode, context: VisitorContext) => void;
  [nodeType: string]:
    | ((node: any, context: VisitorContext) => void)
    | undefined;
}

export class ASTVisitor {
  // Implementation driven by tests
}

// src/index.ts - Public API
export { ASTVisitor, visit } from "./visitor";
export { optimize, transform } from "./transformer";
export { analyze, calculateComplexity } from "./analyzer";
export { generate, generateJavaScript } from "./generator";
export { matchPattern, query } from "./query";
export { explainAST, generateFromIntent } from "./ai";
```

### Quality Standards

- **Test Coverage**: Minimum 95% coverage
- **Documentation**: JSDoc for all public APIs
- **Examples**: Working example for each major feature
- **Performance**: Benchmarks for critical operations
- **Type Safety**: Strict TypeScript with no `any` types

## Success Metrics

### Week 1 Deliverables

- ✅ Complete visitor pattern implementation
- ✅ 100% test coverage for traversal
- ✅ Performance: <1ms for 1000-node AST traversal

### Week 2 Deliverables

- ✅ Full transformation API
- ✅ 5+ optimization passes
- ✅ Performance: <5ms for complex transformations

### Week 3 Deliverables

- ✅ Comprehensive analysis suite
- ✅ 10+ metrics calculated
- ✅ Pattern detection with 90%+ accuracy

### Week 4 Deliverables

- ✅ Multi-target code generation
- ✅ Source map support
- ✅ 100% round-trip accuracy

### Week 5 Deliverables

- ✅ Query language implementation
- ✅ Pattern matching engine
- ✅ Performance: <1ms for complex queries

### Week 6 Deliverables

- ✅ Natural language APIs
- ✅ AI integration examples
- ✅ Published npm package

## Next Steps

1. **Setup Project Structure**
   ```bash
   cd ~/projects/hyperfixi
   mkdir -p packages/ast-toolkit
   cd packages/ast-toolkit
   npm init
   ```

2. **Install Dependencies**
   ```bash
   npm install -D vitest typescript @types/node
   npm install @hyperfixi/core
   ```

3. **Create First Test**
   ```bash
   mkdir -p tests/visitor
   # Create visitor.test.ts with first test
   npm test -- --watch
   ```

4. **Begin TDD Cycle**
   - Write test
   - See it fail
   - Implement feature
   - See test pass
   - Refactor

This plan provides a comprehensive, test-driven approach to building an advanced
AST toolkit that will differentiate HyperFixi in the lightweight scripting
library space while providing powerful tools for developers and AI systems
alike.
