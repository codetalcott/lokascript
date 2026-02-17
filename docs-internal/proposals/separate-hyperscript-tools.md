# Proposal: Separate Hyperscript Developer Tools for Original \_hyperscript Users

## Problem Statement

Today, a developer who uses the **original \_hyperscript** (not HyperFixi) and wants MCP tools, a language server, or multilingual support must install packages from the `@hyperfixi/*` / `@lokascript/*` ecosystem. These packages:

1. Pull in HyperFixi-specific dependencies (`@hyperfixi/core`, `@lokascript/compilation-service`, `@lokascript/framework`, etc.)
2. Expose 22+ MCP tools, most of which are HyperFixi-specific (compilation, domain registries, server-bridge routes)
3. Present LokaScript/HyperFixi branding and concepts that are irrelevant to vanilla \_hyperscript users
4. Make the "getting started" path confusing — users must understand which mode to select and which dependencies to skip

**Goal:** Make it trivially easy for an original \_hyperscript user to get MCP tools, a language server, and (optionally) multilingual support without ever encountering HyperFixi concepts.

---

## Current State

### 1. MCP Server (`@hyperfixi/mcp-server`)

- **22+ tools** spanning analysis, patterns, validation, LSP bridge, language docs, profiles, compilation, routes, and domain registries
- **Hard dependencies:** `@lokascript/compilation-service`, `@lokascript/framework`, `@lokascript/semantic`, `@hyperfixi/patterns-reference`
- **10 optional peer deps** including domain-sql, domain-bdd, domain-jsx, server-bridge
- **No mode concept** — all tools are always exposed regardless of user context
- A phantom `mcp-server-hyperscript` workspace entry exists in root `package.json` but the directory was never created

### 2. Hyperscript Adapter (`@lokascript/hyperscript-adapter`)

- **Well-separated already** — designed specifically for original \_hyperscript
- Depends only on `@lokascript/semantic` (mandatory) and `@lokascript/i18n` (optional)
- Multiple bundle strategies (full, per-language, regional, lite)
- Clean integration point: overrides `runtime.getScript()` in original \_hyperscript
- **This package is already in good shape for standalone use**

### 3. Language Server (`@lokascript/language-server`)

- Already has a **mode system** (`hyperscript`, `hyperscript-i18n`, `lokascript`, `auto`)
- `command-tiers.ts` cleanly separates \_hyperscript commands (31) from LokaScript extensions (8)
- Both `@lokascript/semantic` and `@hyperfixi/core` are **optional** peer deps
- Falls back to pattern-based analysis when optional deps are missing
- **Structurally ready** but published under `@lokascript/*` branding

### 4. VS Code Extension (`lokascript-vscode`)

- Bundles the language server
- Configuration uses `lokascript.*` namespace
- Settings offer mode selection

---

## Proposal: Three Separation Strategies

### Strategy A: Thin Wrapper Packages (Recommended)

Create lightweight, focused packages that re-export subsets of existing functionality. No code duplication — just different entry points with different defaults.

#### New Packages

**1. `@hyperscript-tools/mcp-server` (or `hyperscript-mcp`)**

A standalone MCP server for original \_hyperscript users.

```
mcp-server-hyperscript/
├── package.json
├── src/
│   └── index.ts          # ~50 lines: subset of tools, hyperscript defaults
└── README.md             # Focused on original _hyperscript
```

**What it provides (8-10 tools, down from 22+):**

| Tool | Source | Why included |
|------|--------|--------------|
| `validate_hyperscript` | validation.ts | Core: syntax checking |
| `suggest_command` | validation.ts | Core: command suggestions |
| `get_code_fixes` | validation.ts | Core: auto-fix suggestions |
| `get_diagnostics` | lsp-bridge.ts | Core: error/warning diagnostics |
| `get_completions` | lsp-bridge.ts | Core: code completions |
| `get_hover_info` | lsp-bridge.ts | Core: hover documentation |
| `get_command_docs` | language-docs.ts | Core: command reference |
| `get_expression_docs` | language-docs.ts | Core: expression reference |
| `analyze_complexity` | analysis.ts | Nice-to-have: code quality |
| `search_patterns` | patterns.ts | Nice-to-have: pattern lookup |

**What it excludes:**
- Compilation tools (HyperFixi compiler)
- Domain registries (SQL, BDD, JSX, BehaviorSpec)
- Profile/translation tools (multilingual)
- Route extraction (server-bridge)
- Multilingual parsing tools

**Dependencies:**
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.25.0"
  },
  "optionalDependencies": {
    "@hyperfixi/patterns-reference": "*"
  }
}
```

The tool implementations would be **inlined** (copied from the full MCP server but stripped of multilingual/compilation features) or imported from a shared internal package. The key constraint: **zero mandatory dependency on `@hyperfixi/core`, `@lokascript/semantic`, or `@lokascript/framework`**.

**Implementation approach:**

```typescript
// mcp-server-hyperscript/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Inline subset of tools — no external HyperFixi deps
import { validationTools, handleValidationTool } from './tools/validation.js';
import { lspBridgeTools, handleLspBridgeTool } from './tools/lsp-bridge.js';
import { languageDocsTools, handleLanguageDocsTool } from './tools/language-docs.js';
import { analysisTools, handleAnalysisTool } from './tools/analysis.js';

const server = new Server(
  { name: 'hyperscript-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// Only register hyperscript-relevant tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    ...validationTools,     // validate, suggest, fix
    ...lspBridgeTools,      // diagnostics, completions, hover
    ...languageDocsTools,   // command/expression docs
    ...analysisTools,       // complexity analysis
  ],
}));
```

**2. `@hyperscript-tools/language-server` (or `hyperscript-language-server`)**

Thin wrapper around `@lokascript/language-server` with `mode: 'hyperscript'` as default.

```
language-server-hyperscript/
├── package.json
├── src/
│   └── server.ts     # ~20 lines: imports LS, sets mode to 'hyperscript'
└── README.md
```

```typescript
// language-server-hyperscript/src/server.ts
// Re-export the language server with hyperscript-only defaults
// Override default settings to mode: 'hyperscript'
import { createConnection } from '@lokascript/language-server';
createConnection({ defaultMode: 'hyperscript' });
```

Alternatively, the existing `@lokascript/language-server` could export a `createServer(options)` factory that accepts a default mode. The wrapper package would just call it with `{ mode: 'hyperscript' }`.

**Dependencies:**
```json
{
  "dependencies": {
    "@lokascript/language-server": "*"
  }
}
```

No `@lokascript/semantic` or `@hyperfixi/core` needed — the language server already falls back gracefully.

**3. `@hyperscript-tools/vscode` (or `hyperscript-vscode`)**

A VS Code extension that bundles the hyperscript-only language server.

- Uses `hyperscript.*` configuration namespace instead of `lokascript.*`
- Defaults to `hyperscript` mode
- No multilingual configuration options shown
- Simpler settings UI

---

#### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  Original _hyperscript Users                                 │
│                                                              │
│  @hyperscript-tools/mcp-server                               │
│  ├── 8-10 tools (validation, LSP, docs, analysis)            │
│  ├── Zero HyperFixi dependencies                             │
│  └── Self-contained tool implementations                     │
│                                                              │
│  @hyperscript-tools/language-server                          │
│  ├── Wraps @lokascript/language-server (mode: 'hyperscript') │
│  ├── No multilingual deps needed                             │
│  └── Pattern-based analysis (no parser required)             │
│                                                              │
│  @hyperscript-tools/vscode                                   │
│  ├── Bundles hyperscript-only LS                             │
│  └── Simplified settings (no language picker)                │
│                                                              │
│  (Optional) @lokascript/hyperscript-adapter                  │
│  └── For multilingual support on top of _hyperscript         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  HyperFixi / LokaScript Users                                │
│                                                              │
│  @hyperfixi/mcp-server (unchanged, full 22+ tools)           │
│  @lokascript/language-server (unchanged, all modes)          │
│  lokascript-vscode (unchanged, full multilingual)            │
└──────────────────────────────────────────────────────────────┘
```

---

### Strategy B: Mode-Based Filtering in Existing Packages

Instead of new packages, add a `mode` configuration to the existing MCP server and improve documentation.

**MCP Server changes:**
- Add `HYPERSCRIPT_MODE=1` environment variable
- When set, `ListToolsRequestSchema` returns only the hyperscript-relevant subset (8-10 tools)
- Document the mode in `.mcp.json` configuration

```json
{
  "mcpServers": {
    "hyperscript": {
      "command": "node",
      "args": ["node_modules/@hyperfixi/mcp-server/dist/index.js"],
      "env": {
        "HYPERSCRIPT_MODE": "1"
      }
    }
  }
}
```

**Pros:** No new packages, no code duplication
**Cons:** Users still install `@hyperfixi/mcp-server` with all its deps; the "getting started" story still requires understanding the hyperfixi ecosystem

---

### Strategy C: Shared Core + Multiple Entry Points (Hybrid)

Extract the hyperscript-compatible subset of tools into a shared internal package, then build both MCP servers on top.

```
packages/
├── mcp-tools-core/          # Shared tool implementations (internal)
│   ├── validation.ts
│   ├── lsp-bridge.ts
│   ├── language-docs.ts
│   └── analysis.ts
├── mcp-server/              # Full HyperFixi MCP (imports core + extensions)
└── mcp-server-hyperscript/  # Hyperscript-only MCP (imports core only)
```

**Pros:** No code duplication, clean separation
**Cons:** More refactoring of existing MCP server, another internal package to maintain

---

## Recommendation: Strategy A (Thin Wrapper Packages)

Strategy A is recommended because:

1. **Simplest user experience:** `npm install @hyperscript-tools/mcp-server` — done
2. **No changes to existing packages:** HyperFixi users are unaffected
3. **Minimal maintenance burden:** The hyperscript-only MCP tools are a stable subset unlikely to change frequently
4. **Clear branding separation:** `@hyperscript-tools/*` vs `@hyperfixi/*` makes the target audience obvious
5. **The adapter is already separated:** No work needed there
6. **The language server mostly works already:** Just needs a wrapper with different defaults

### Implementation Phases

**Phase 1: `mcp-server-hyperscript` package**
- Create the package with inlined, dependency-free tool implementations
- Provide hyperscript command/expression documentation as self-contained data
- Use pattern-based validation (no parser dependency)
- Include `.mcp.json` example configuration
- Write focused README for original \_hyperscript users

**Phase 2: `language-server-hyperscript` wrapper**
- Add `createServer(options)` factory to `@lokascript/language-server`
- Create wrapper package that defaults to `mode: 'hyperscript'`
- Ensure graceful operation with zero optional deps installed

**Phase 3: `hyperscript-vscode` extension**
- Fork VS Code extension with hyperscript-only settings
- Simplified configuration (no language picker, no multilingual options)
- Publish separately to VS Code Marketplace

**Phase 4: Documentation & Getting Started Guide**
- Create a standalone "Hyperscript Tools" landing page/README
- One-liner setup instructions for each tool
- Clear comparison: "Using original \_hyperscript? Start here. Using HyperFixi? Go there."

---

## Naming Considerations

| Option | npm scope | Pros | Cons |
|--------|-----------|------|------|
| `@hyperscript-tools/*` | New scope | Clear purpose, no HyperFixi association | Need to register scope |
| `hyperscript-mcp` etc. | Unscoped | Simple, memorable | May conflict with future packages |
| `@hyperscript/*` | Official-looking | Clean | Might imply official \_hyperscript endorsement |
| `@lokascript/hyperscript-*` | Existing scope | No new scope needed | Still tied to LokaScript branding |

**Recommendation:** `@hyperscript-tools/*` scope — clearly communicates "tools for hyperscript" without implying official endorsement or tying to HyperFixi/LokaScript.

---

## What Stays the Same

- `@lokascript/hyperscript-adapter` — already well-separated, no changes needed
- `@hyperfixi/mcp-server` — unchanged, full feature set for HyperFixi users
- `@lokascript/language-server` — unchanged (add factory export), serves all modes
- `lokascript-vscode` — unchanged for HyperFixi users

---

## User Journey Comparison

### Today (confusing)

```
1. User wants hyperscript MCP tools
2. Finds @hyperfixi/mcp-server
3. Installs it → pulls in @lokascript/semantic, @lokascript/framework, etc.
4. Sees 22+ tools, most irrelevant (compilation, domains, multilingual)
5. Has to figure out which tools matter
6. Unclear if they need @hyperfixi/core
```

### Proposed (simple)

```
1. User wants hyperscript MCP tools
2. Finds @hyperscript-tools/mcp-server (or hyperscript-mcp)
3. npm install → zero heavy dependencies
4. Adds to .mcp.json → gets 8-10 focused tools
5. Done. Everything "just works" for _hyperscript.
6. If they later want multilingual: npm install @lokascript/hyperscript-adapter
7. If they later want HyperFixi: switch to @hyperfixi/mcp-server
```

---

## Open Questions

1. **Should the hyperscript-only MCP server inline its tool code or import from a shared package?** Inlining is simpler but means maintaining two copies of validation/docs logic.

2. **Should the `@hyperscript-tools/mcp-server` reference original \_hyperscript documentation (hyperscript.org) or maintain its own?** Referencing upstream is lower maintenance but means external dependency on docs.

3. **Package naming — do we need to coordinate with the \_hyperscript project?** Using `@hyperscript-tools` is descriptive but could be confused with an official project.

4. **Should the hyperscript adapter (`@lokascript/hyperscript-adapter`) be rebranded under `@hyperscript-tools/i18n` for consistency?** This would give the "hyperscript tools" ecosystem three packages under one scope.
