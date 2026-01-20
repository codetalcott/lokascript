# Vite Plugin Guide

Use the Vite plugin for automatic, optimized LokaScript bundles.

## Why Use the Plugin?

The plugin automatically:

- Scans your files for `_="..."` attributes
- Detects which commands you use
- Generates a minimal bundle (5-8 KB instead of 224 KB)
- Regenerates on HMR when you add new hyperscript

## Installation

```bash
npm install @lokascript/vite-plugin @lokascript/core
```

## Basic Setup

```javascript
// vite.config.js
import { lokascript } from '@lokascript/vite-plugin';

export default {
  plugins: [lokascript()],
};
```

```javascript
// main.js
import 'lokascript'; // Auto-generated minimal bundle
```

That's it. Write hyperscript and the plugin handles the rest.

## What Gets Detected

### Commands (21)

toggle, add, remove, show, hide, set, get, put, append, take, increment, decrement, log, send, trigger, wait, transition, go, call, focus, blur

### Blocks (5)

if, repeat, for, while, fetch

### Positional Expressions (6)

first, last, next, previous, closest, parent

## Configuration

```javascript
lokascript({
  // Always include these commands
  extraCommands: ['fetch', 'put'],

  // Always include these blocks
  extraBlocks: ['if', 'for'],

  // Include positional expressions
  positional: true,

  // Enable htmx compatibility
  htmx: true,

  // Enable multilingual
  semantic: 'auto', // Auto-detect languages
  semantic: 'en', // English synonyms only
  semantic: true, // All languages

  // Specific languages
  languages: ['en', 'ja', 'ko'],

  // Regional bundle
  region: 'western', // en, es, pt, fr, de
  region: 'east-asian', // ja, zh, ko
  region: 'priority', // 11 priority languages
  region: 'all', // All 23 languages

  // Enable grammar transformation
  grammar: true,

  // Debug logging
  debug: true,
});
```

## Compile Mode

Pre-compile hyperscript to JavaScript for minimal bundle size:

```javascript
lokascript({
  mode: 'compile', // ~500 bytes vs ~8 KB
});
```

**Trade-offs:**

| Feature        | Interpret | Compile    |
| -------------- | --------- | ---------- |
| Bundle size    | ~8 KB     | ~500 bytes |
| Block commands | Yes       | No         |
| Dynamic eval() | Yes       | No         |

Use compile mode for simple interactions (toggles, shows, hides) on performance-critical pages.

## Handling Dynamic Hyperscript

Static analysis can't detect dynamically generated hyperscript:

```javascript
// This won't be detected
element.setAttribute('_', `on click ${cmd} .active`);
```

Use `extraCommands` to include those:

```javascript
lokascript({
  extraCommands: ['toggle', 'add', 'remove'],
});
```

## Supported File Types

- `.html`, `.htm`
- `.vue` (single file components)
- `.svelte`
- `.jsx`, `.tsx`
- `.astro`
- `.php`, `.erb`, `.ejs`, `.hbs`

## Custom File Patterns

```javascript
lokascript({
  include: /\.(html|vue|custom)$/,
  exclude: /node_modules/,
});
```

## Virtual Module

The plugin creates a virtual module:

```javascript
// All of these work:
import 'lokascript';
import 'virtual:lokascript';
import '@lokascript/core';
```

## Bundle Size Comparison

| Usage               | Size (gzip) | Savings |
| ------------------- | ----------- | ------- |
| 3 commands          | ~5 KB       | 90%     |
| 6 commands          | ~6.5 KB     | 85%     |
| 9 commands + blocks | ~8 KB       | 80%     |
| All features        | ~40 KB      | 0%      |

## Framework Examples

### Vue

```vue
<template>
  <button _="on click toggle .active on me">Toggle</button>
</template>
```

### Svelte

```svelte
<button _="on click toggle .active on me">Toggle</button>
```

### React/JSX

```jsx
function Button() {
  return <button _="on click toggle .active on me">Toggle</button>;
}
```

### Astro

```astro
<button _="on click toggle .active on me">Toggle</button>
```

## Multilingual Example

```javascript
// vite.config.js
lokascript({
  semantic: 'auto', // Auto-detect from source
});
```

```html
<!-- Japanese -->
<button _="クリックしたら .active を 切り替え">切り替え</button>

<!-- Spanish -->
<button _="al hacer clic alternar .activo">Alternar</button>
```

## Debugging

Enable debug mode to see what's detected:

```javascript
lokascript({ debug: true });
```

Console output:

```
[lokascript] Detected commands: toggle, add, show, hide
[lokascript] Detected blocks: if
[lokascript] Bundle size: 6.2 KB gzip
```

## Next Steps

- [Bundle Selection](/en/guide/bundles) - Bundle options
- [Custom Bundles](/en/guide/custom-bundles) - Manual bundle generation
- [@lokascript/vite-plugin](/en/packages/vite-plugin) - Full reference
