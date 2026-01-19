# Documentation Site & Bundle Distribution Plan

This document outlines the strategy for LokaScript's documentation website, bundle naming conventions, and distribution approach.

## Overview

LokaScript needs a documentation site that:

1. Helps users understand how LokaScript differs from standard \_hyperscript
2. Guides users to the right bundle for their needs
3. Provides searchable documentation without ongoing service costs
4. Demonstrates LokaScript's capabilities by using it for interactivity

## Key Differentiators to Communicate

LokaScript is a clean-room implementation inspired by \_hyperscript, not a fork or drop-in replacement.

| Aspect          | \_hyperscript    | LokaScript               |
| --------------- | ---------------- | ------------------------ |
| Bundle size     | 45 KB min        | 2-10 KB (tree-shakeable) |
| TypeScript      | No               | Full type definitions    |
| Tree-shaking    | No               | Yes, per-command         |
| Multilingual    | No               | 20+ languages            |
| htmx attributes | Separate library | Built-in option          |
| Vite plugin     | No               | Zero-config              |
| Behaviors       | Yes              | Partial                  |
| Web Workers     | Yes              | No                       |

**Important**: ~85% syntax compatible. Compatibility not guaranteed in either direction. Many sites can replace htmx + \_hyperscript with a single LokaScript bundle.

---

## Bundle Naming Convention

### Current State (Inconsistent)

```
lokascript-lite.js
lokascript-lite-plus.js
lokascript-hybrid-complete.js
lokascript-hybrid-hx.js
lokascript-browser.js
lokascript-multilingual.js
```

Problems:

- "lite" vs "lite-plus" - unclear differentiation
- "hybrid" - meaningless to users
- "complete" - complete compared to what?
- Inconsistent suffix patterns

### Proposed Naming Scheme

**Base tiers** (capability level):

- `micro` - Regex parser, 8 commands, no blocks (~2 KB)
- `standard` - AST parser, 21 commands, blocks, expressions (~6 KB) **← default**
- `full` - Everything including semantic parser (~250 KB)

**Suffixes** (additive, combinable):

- `-htmx` - htmx attribute compatibility
- `-i18n` - Keyword aliases for non-English
- `-i18n-{region}` - Specific language regions

### Pre-built Bundle Matrix

| Bundle Name                           | Size (gzip) | Description             |
| ------------------------------------- | ----------- | ----------------------- |
| `lokascript-micro.js`                 | ~2 KB       | Minimal, regex parser   |
| `lokascript-standard.js`              | ~6 KB       | **Recommended default** |
| `lokascript-standard-htmx.js`         | ~9 KB       | + htmx attributes       |
| `lokascript-standard-i18n.js`         | ~7 KB       | + all keyword aliases   |
| `lokascript-standard-i18n-western.js` | ~6.5 KB     | + en, es, pt, fr, de    |
| `lokascript-standard-i18n-htmx.js`    | ~10 KB      | + both features         |
| `lokascript-full.js`                  | ~250 KB     | Everything              |

### npm Package Exports

```json
{
  "exports": {
    ".": "./dist/lokascript-standard.js",
    "./micro": "./dist/lokascript-micro.js",
    "./standard": "./dist/lokascript-standard.js",
    "./standard-htmx": "./dist/lokascript-standard-htmx.js",
    "./standard-i18n": "./dist/lokascript-standard-i18n.js",
    "./standard-i18n-western": "./dist/lokascript-standard-i18n-western.js",
    "./standard-i18n-htmx": "./dist/lokascript-standard-i18n-htmx.js",
    "./full": "./dist/lokascript-full.js"
  }
}
```

Usage:

```javascript
import 'lokascript'; // standard (default)
import 'lokascript/micro'; // minimal
import 'lokascript/standard-htmx'; // with htmx
```

---

## Distribution Strategy

### Tier 1: Pre-built CDN Bundles

For users who want quick setup without build tools:

```html
<script src="https://unpkg.com/lokascript"></script>
<!-- or specific variant -->
<script src="https://unpkg.com/lokascript/dist/lokascript-standard-htmx.js"></script>
```

Maintain 5-7 pre-built variants covering 90% of use cases.

### Tier 2: Vite Plugin (Recommended)

Automatic tree-shaking generates optimal bundles:

```javascript
// vite.config.js
import { lokascript } from '@lokascript/vite-plugin';

export default {
  plugins: [lokascript()],
};
```

The plugin scans `_="..."` attributes and generates a bundle with only the commands used.

### Tier 3: Custom Bundle via Wizard

For users needing specific combinations, the wizard generates a config file:

```json
{
  "$schema": "https://lokascript.dev/schemas/bundle-config.json",
  "name": "my-lokascript-bundle",
  "parser": "ast",
  "commands": ["toggle", "add", "remove", "put", "set", "fetch"],
  "blocks": ["if", "repeat", "fetch"],
  "features": {
    "eventModifiers": true,
    "positional": true,
    "htmx": false
  },
  "i18n": {
    "enabled": true,
    "languages": ["en", "es", "ja"]
  }
}
```

User builds locally:

```bash
npx lokascript build --config lokascript.config.json
```

---

## SQLite as Bundle Metadata Store

With 30+ potential bundle combinations, we need a structured way to:

- Calculate bundle sizes for user selections
- Track command dependencies
- Store i18n keyword mappings
- Enable powerful search across documentation

### Schema

```sql
-- Commands and their dependencies
CREATE TABLE commands (
  name TEXT PRIMARY KEY,
  category TEXT NOT NULL,              -- 'class', 'dom', 'flow', 'data', etc.
  size_bytes INTEGER NOT NULL,
  requires TEXT,                       -- JSON array of dependencies
  description TEXT,
  syntax TEXT,
  examples TEXT                        -- JSON array
);

-- Block commands (if, repeat, for, while, fetch)
CREATE TABLE blocks (
  name TEXT PRIMARY KEY,
  size_bytes INTEGER NOT NULL,
  requires TEXT,
  description TEXT,
  syntax TEXT
);

-- Features and what they include
CREATE TABLE features (
  name TEXT PRIMARY KEY,
  commands TEXT NOT NULL,              -- JSON array
  blocks TEXT,                         -- JSON array
  size_bytes INTEGER NOT NULL,
  description TEXT
);

-- i18n keywords per language per command
CREATE TABLE i18n_keywords (
  language TEXT NOT NULL,
  command TEXT NOT NULL,
  keyword TEXT NOT NULL,
  PRIMARY KEY (language, command)
);

-- Language metadata
CREATE TABLE languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  word_order TEXT NOT NULL,            -- 'SVO', 'SOV', 'VSO'
  direction TEXT DEFAULT 'ltr',
  region TEXT                          -- 'western', 'east-asian', 'rtl', etc.
);

-- Pre-calculated bundle presets
CREATE TABLE bundle_presets (
  name TEXT PRIMARY KEY,
  config TEXT NOT NULL,                -- JSON config
  size_gzip INTEGER NOT NULL,
  description TEXT,
  use_case TEXT
);

-- Documentation content (for FTS search)
CREATE VIRTUAL TABLE docs USING fts5(
  title,
  path,
  section,
  content,
  category,
  tokenize='porter unicode61'
);
```

### Wizard Queries

```sql
-- Calculate estimated bundle size for a selection
SELECT
  SUM(size_bytes) as total_size,
  GROUP_CONCAT(name) as included_commands
FROM commands
WHERE name IN ('toggle', 'add', 'remove', 'put', 'set');

-- Find smallest preset matching user requirements
SELECT name, size_gzip, description
FROM bundle_presets
WHERE json_extract(config, '$.features.htmx') = :needs_htmx
  AND json_extract(config, '$.i18n.enabled') = :needs_i18n
ORDER BY size_gzip ASC
LIMIT 1;

-- Get all keywords for selected languages
SELECT language, command, keyword
FROM i18n_keywords
WHERE language IN ('en', 'es', 'ja')
ORDER BY command, language;

-- Search documentation
SELECT title, path, snippet(docs, 3, '<mark>', '</mark>', '...', 32) as snippet
FROM docs
WHERE docs MATCH :query
ORDER BY rank
LIMIT 10;
```

---

## Documentation Site Architecture

### Technology Stack

- **VitePress** - Static site generation with Vue support
- **LokaScript** - All interactive elements (dogfooding)
- **SQLite WASM** - Search and bundle wizard data
- **GitHub Pages** - Free hosting

### Directory Structure

```
docs/
├── .vitepress/
│   ├── config.ts
│   ├── theme/
│   │   ├── index.ts              # Load LokaScript globally
│   │   └── styles/
│   └── scripts/
│       └── build-search-db.ts    # Generate search.db at build time
│
├── public/
│   ├── lokascript-standard.js     # For docs interactivity
│   ├── search.db                 # SQLite database
│   └── bundle-metadata.db        # Command/feature data
│
├── index.md                      # Landing page with value prop
│
├── guide/
│   ├── getting-started.md
│   ├── vs-hyperscript.md         # Comparison with feature table
│   ├── migrating.md              # Migration guide
│   └── choosing-a-bundle.md
│
├── wizard/
│   └── index.md                  # Interactive bundle builder
│
├── reference/
│   ├── commands/
│   │   ├── index.md              # Command overview
│   │   ├── toggle.md
│   │   ├── add.md
│   │   └── ...
│   ├── expressions.md
│   ├── events.md
│   └── i18n/
│       ├── index.md
│       └── [language].md         # Per-language keyword reference
│
├── examples/
│   ├── index.md                  # Gallery overview
│   ├── basics.md
│   ├── forms.md
│   ├── htmx-patterns.md
│   └── multilingual.md
│
└── api/
    ├── vite-plugin.md
    ├── cli.md
    └── programmatic.md
```

### Size Budget

| Asset                        | Size (gzipped)  |
| ---------------------------- | --------------- |
| sql.js WASM                  | ~200 KB         |
| search.db                    | ~50-100 KB      |
| bundle-metadata.db           | ~20-50 KB       |
| LokaScript standard          | ~6 KB           |
| **Total interactive assets** | **~280-360 KB** |

This is a one-time download with aggressive caching. Compared to Algolia DocSearch (~40 KB but with ongoing costs), this provides more functionality at zero recurring cost.

---

## Bundle Wizard UX

### Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LokaScript Bundle Builder                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ How is this different from _hyperscript?               [Learn] │   │
│  │                                                                 │   │
│  │ LokaScript is a modern, modular implementation with:             │   │
│  │ • Tree-shakeable bundles (2-10 KB vs 45 KB)                     │   │
│  │ • Full TypeScript support                                       │   │
│  │ • 20+ language support                                          │   │
│  │ • Built-in htmx-like features                                   │   │
│  │                                                                 │   │
│  │ ~85% syntax compatible. Can replace htmx + hyperscript          │   │
│  │ for many sites.                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  1. What are you building?                                              │
│                                                                         │
│     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│     │ Small site      │  │ Web app         │  │ Replacing       │      │
│     │ ~2 KB           │  │ ~6 KB           │  │ htmx+hyperscript│      │
│     │                 │  │ ★ Recommended   │  │ ~9 KB           │      │
│     └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                                                         │
│     ┌─────────────────┐                                                │
│     │ International   │                                                │
│     │ app             │                                                │
│     │ ~7-20 KB        │                                                │
│     └─────────────────┘                                                │
│                                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  2. Customize (optional)                                                │
│                                                                         │
│     ☑ Event modifiers (.debounce, .throttle)              included     │
│     ☑ Blocks (if/else, repeat, for each)                  included     │
│     ☐ htmx-style attributes (hx-get, hx-post)             +2.5 KB      │
│     ☐ Non-English keywords                                +0.6 KB      │
│                                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                         │
│  Your Bundle                                                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  lokascript-standard.js                            6.2 KB gzip  │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │                                                                 │   │
│  │  Includes: 21 commands, blocks, expressions, event modifiers    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────┐ ┌───────┐ ┌───────┐                                         │
│  │  CDN  │ │  npm  │ │ Vite  │                                         │
│  └───────┘ └───────┘ └───────┘                                         │
│                                                                         │
│  <!-- CDN -->                                                           │
│  <script src="https://unpkg.com/lokascript"></script>                    │
│                                                            [Copy]       │
│                                                                         │
│  [Download Bundle]         [View Config]         [Read Docs]            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements (LokaScript-powered)

```html
<!-- Use case selector with mutual exclusion -->
<div class="use-cases" _="on click take .selected from .use-case in me">
  <button
    class="use-case"
    data-preset="micro"
    _="on click
       add .selected then
       set $preset to 'micro' then
       call updateBundleDisplay()"
  >
    <h4>Small site</h4>
    <p>~2 KB</p>
  </button>

  <button
    class="use-case selected"
    data-preset="standard"
    _="on click
       add .selected then
       set $preset to 'standard' then
       call updateBundleDisplay()"
  >
    <h4>Web app</h4>
    <p>~6 KB</p>
    <span class="badge">Recommended</span>
  </button>

  <!-- ... more options ... -->
</div>

<!-- Feature toggles that update size estimate -->
<label class="feature-toggle">
  <input
    type="checkbox"
    _="on change
       js(checked) return window.toggleFeature('htmx', checked) end then
       call updateBundleDisplay()"
  />
  htmx-style attributes
  <span class="size-delta">+2.5 KB</span>
</label>

<!-- Tab group for install methods -->
<div class="tabs" _="on click take .active from .tab in me">
  <button class="tab active" _="on click show #cdn-code then hide #npm-code then hide #vite-code">
    CDN
  </button>
  <button class="tab" _="on click hide #cdn-code then show #npm-code then hide #vite-code">
    npm
  </button>
  <button class="tab" _="on click hide #cdn-code then hide #npm-code then show #vite-code">
    Vite
  </button>
</div>
```

---

## Implementation Phases

### Phase 1: Foundation

1. Set up VitePress project structure
2. Create SQLite schema and build scripts
3. Populate command/feature metadata
4. Implement basic search functionality

### Phase 2: Bundle Standardization

1. Rename existing bundles to new naming scheme
2. Update package.json exports
3. Update build configurations
4. Add migration notes for existing users

### Phase 3: Documentation Content

1. Write comparison page (vs-hyperscript.md)
2. Document all commands with examples
3. Create migration guide
4. Write i18n keyword reference

### Phase 4: Interactive Wizard

1. Build wizard UI with LokaScript
2. Connect to SQLite for size calculations
3. Generate config file downloads
4. Test across bundle combinations

### Phase 5: Polish & Launch

1. SEO optimization
2. Performance audit
3. Cross-browser testing
4. Deploy to GitHub Pages

---

## Open Questions

1. **CDN provider**: unpkg vs jsdelivr vs self-hosted?
2. **Versioning in URLs**: `lokascript@1.0.0` or latest?
3. **Bundle config schema**: JSON Schema vs TypeScript types?
4. **Search index scope**: Just docs or also GitHub issues/discussions?

---

## Success Metrics

- Users can find the right bundle in < 30 seconds
- Documentation search returns relevant results
- Zero recurring hosting/service costs
- Site demonstrates LokaScript capabilities effectively
- Clear differentiation from \_hyperscript communicated
