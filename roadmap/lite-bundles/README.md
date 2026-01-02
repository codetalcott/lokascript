# HyperFixi Lite Bundles

Size-optimized bundles for projects prioritizing bundle size over features.

## Bundle Comparison

| Bundle | Size | Commands | Parser | Use Case |
|--------|------|----------|--------|----------|
| `hyperfixi-lite.js` | 1.9 KB | 8 | Regex | Minimal interactivity |
| `hyperfixi-lite-plus.js` | 2.6 KB | 14 | Regex | Basic apps |
| `hyperfixi-hybrid-lite.js` | 4.6 KB | 14+blocks | Tiered | Most apps |
| `hyperfixi-hybrid.js` | 5.5 KB | 14+blocks | Full AST | Complex expressions |
| `hyperfixi-hybrid-complete.js` | 6.0 KB | 21+blocks | Full AST | **Recommended** |

## Feature Matrix

| Feature | Lite | Lite+ | Hybrid Lite | Hybrid | Complete |
|---------|------|-------|-------------|--------|----------|
| `toggle .active` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `add/remove .class` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `put X into #el` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `increment/decrement` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `show/hide/focus/blur` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `wait 500ms` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `repeat N times...end` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `if...else...end` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `for each...end` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `fetch url then...` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `while...end` | ❌ | ❌ | ✅ | ✅ | ✅ |
| Event modifiers (.once, .debounce) | ❌ | ❌ | ✅ | ❌ | ✅ |
| i18n aliases | ❌ | ✅ | ✅ | ❌ | ✅ |
| Operator precedence | ❌ | ❌ | ❌ | ✅ | ✅ |
| Positional (first, last, closest) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Function calls (`str.toUpperCase()`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| `return` statement | ❌ | ❌ | ❌ | ✅ | ✅ |

## Usage

```html
<!-- Recommended: Hybrid Complete (6 KB, ~85% coverage) -->
<script src="hyperfixi-hybrid-complete.js"></script>

<!-- Minimal: Just toggles and basic DOM (1.9 KB) -->
<script src="hyperfixi-lite.js"></script>
```

## Build Commands

```bash
npm run build:browser:lite --prefix packages/core
npm run build:browser:lite-plus --prefix packages/core
npm run build:browser:hybrid-lite --prefix packages/core
npm run build:browser:hybrid --prefix packages/core
npm run build:browser:hybrid-complete --prefix packages/core
```

## Choosing a Bundle

- **< 2 KB needed**: Use `lite` (toggles, add/remove class, put)
- **< 3 KB needed**: Use `lite-plus` (adds increment, show/hide, i18n)
- **< 5 KB needed**: Use `hybrid-lite` (adds blocks, event modifiers)
- **< 6 KB needed**: Use `hybrid-complete` (full expressions, best coverage)
- **Full features**: Use `hyperfixi-browser.js` (663 KB)
