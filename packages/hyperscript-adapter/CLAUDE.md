# CLAUDE.md — hyperscript-adapter

## What This Package Does

Adapter plugin that enables the **original \_hyperscript** runtime to accept hyperscript written in 24 languages. Works as a text preprocessor: intercepts `getScript()`, translates non-English input to English via `@lokascript/semantic`, then lets \_hyperscript parse normally.

## Structure

```
src/
├── index.ts              # Node.js entry — exports plugin, preprocess, types
├── browser.ts            # Browser IIFE entry — auto-registers with _hyperscript
├── plugin.ts             # _hyperscript.use() plugin factory + standalone preprocess()
├── preprocessor.ts       # Semantic translation with confidence gating
└── language-resolver.ts  # Cascading lang detection (element → ancestor → document)
test/
├── preprocessor.test.ts  # 25 tests: 5 commands × 5 languages
├── language-resolver.test.ts  # 8 tests: DOM attribute resolution
└── plugin.test.ts        # 10 tests: plugin registration and behavior
demo/
└── index.html            # Live demo with ES/JA/KO/ZH/FR examples
```

## Commands

```bash
npm run typecheck          # TypeScript validation
npm run test:run           # Vitest (43 tests, jsdom environment)
npm run build              # ESM + CJS + browser IIFE
```

## Key Design Decisions

- **Zero changes to other packages**: semantic, i18n, and \_hyperscript are consumed as-is
- **Preprocessor, not AST mapping**: \_hyperscript AST nodes are closure objects tightly coupled to the parser — reproducing them from semantic data would mean reimplementing every command parser
- **Confidence gating**: semantic analysis below threshold falls through to original text, avoiding bad translations
- **Browser IIFE bundles semantic**: ~530 KB self-contained; no separate script load needed

## Integration Point

The plugin overrides `runtime.getScript()` (\_hyperscript.js line 1809), which reads `_="..."` attributes and returns raw strings. The override translates non-English strings to English before they reach the lexer.
