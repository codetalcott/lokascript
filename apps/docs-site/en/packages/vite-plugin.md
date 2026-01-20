# @lokascript/vite-plugin

Zero-config Vite plugin that generates minimal LokaScript bundles.

## Installation

```bash
npm install @lokascript/vite-plugin @lokascript/core
```

## Quick Start

```javascript
// vite.config.js
import { lokascript } from '@lokascript/vite-plugin';

export default {
  plugins: [lokascript()],
};
```

```javascript
// main.js
import 'lokascript';
```

That's it. The plugin scans your files and generates a bundle with only the commands you use.

## How It Works

1. **Scans** your HTML/Vue/Svelte/JSX files for `_="..."` attributes
2. **Detects** which commands, blocks, and expressions you use
3. **Generates** a minimal bundle (as small as 5 KB)
4. **Regenerates** on HMR when you add new hyperscript

## Options

```javascript
lokascript({
  // Always include these commands (for dynamic hyperscript)
  extraCommands: ['fetch', 'put'],

  // Always include these blocks
  extraBlocks: ['if', 'for'],

  // Include positional expressions (first, last, next, etc.)
  positional: true,

  // Enable htmx attribute compatibility
  htmx: true,

  // Debug logging
  debug: true,

  // File patterns
  include: /\.(html|vue|svelte|jsx|tsx)$/,
  exclude: /node_modules/,
});
```

## Multilingual Support

Enable semantic parsing for 13 languages.

```javascript
// Auto-detect languages from source files
lokascript({ semantic: 'auto' });

// English synonyms only (smallest semantic bundle)
lokascript({ semantic: 'en' });

// Explicit languages
lokascript({ languages: ['en', 'es', 'ja'] });

// Force regional bundle
lokascript({ region: 'western' }); // en, es, pt, fr, de

// Full multilingual with grammar transformation
lokascript({ semantic: true, grammar: true });
```

### Semantic Bundle Sizes

| Option                 | Size (gzip) | Languages             |
| ---------------------- | ----------- | --------------------- |
| `semantic: 'en'`       | ~20 KB      | English               |
| `semantic: 'es'`       | ~16 KB      | Spanish               |
| `region: 'es-en'`      | ~25 KB      | English + Spanish     |
| `region: 'western'`    | ~30 KB      | en, es, pt, fr, de    |
| `region: 'east-asian'` | ~24 KB      | ja, zh, ko            |
| `region: 'priority'`   | ~48 KB      | 11 priority languages |
| `region: 'all'`        | ~61 KB      | All 13 languages      |

## Compile Mode

Pre-compile hyperscript to JavaScript for minimal bundle size.

```javascript
lokascript({
  mode: 'compile', // ~500 bytes vs ~8 KB for interpret
});
```

**Trade-offs:**

| Feature          | Interpret (default) | Compile    |
| ---------------- | ------------------- | ---------- |
| Bundle size      | ~8 KB               | ~500 bytes |
| Block commands   | ✓                   | ✗          |
| Dynamic `eval()` | ✓                   | ✗          |

Use compile mode for simple interactions (toggles, shows, hides) on performance-critical pages.

## Detected Features

### Commands (21)

toggle, add, remove, removeClass, show, hide, set, get, put, append, take, increment, decrement, log, send, trigger, wait, transition, go, call, focus, blur, return

### Blocks (5)

if, repeat, for, while, fetch

### Positional Expressions (6)

first, last, next, previous, closest, parent

## Bundle Size Comparison

| Usage               | Size (gzip) | vs Full     |
| ------------------- | ----------- | ----------- |
| 3 commands          | ~5 KB       | 90% smaller |
| 6 commands          | ~6.5 KB     | 85% smaller |
| 9 commands + blocks | ~8 KB       | 80% smaller |
| All features        | ~40 KB      | same        |

## Supported File Types

- `.html`, `.htm`
- `.vue` (single file components)
- `.svelte`
- `.jsx`, `.tsx`
- `.astro`
- `.php`, `.erb`, `.ejs`, `.hbs`

## Dynamic Hyperscript

For dynamically generated hyperscript that can't be detected:

```javascript
// This can't be detected by static analysis
element.setAttribute('_', `on click ${dynamicCommand} .active`);
```

Use `extraCommands` to include those:

```javascript
lokascript({
  extraCommands: ['toggle', 'add', 'remove'],
});
```

## Virtual Module

The plugin creates a virtual module:

```javascript
// All of these work:
import 'lokascript';
import 'virtual:lokascript';
import '@lokascript/core'; // Redirects to virtual module
```

## Complete Options Reference

| Option          | Type                        | Default               | Description                    |
| --------------- | --------------------------- | --------------------- | ------------------------------ |
| `mode`          | `'interpret' \| 'compile'`  | `'interpret'`         | Bundle mode                    |
| `debug`         | `boolean`                   | `false`               | Debug logging                  |
| `include`       | `RegExp \| string[]`        | See below             | Files to scan                  |
| `exclude`       | `RegExp \| string[]`        | `/node_modules/`      | Files to exclude               |
| `extraCommands` | `string[]`                  | `[]`                  | Always include                 |
| `extraBlocks`   | `string[]`                  | `[]`                  | Always include                 |
| `positional`    | `boolean`                   | `false`               | Include positional expressions |
| `htmx`          | `boolean`                   | `false`               | htmx compatibility             |
| `bundleName`    | `string`                    | `'ViteAutoGenerated'` | Bundle name                    |
| `globalName`    | `string`                    | `'lokascript'`        | Window global                  |
| `semantic`      | `boolean \| 'en' \| 'auto'` | `false`               | Semantic parser                |
| `languages`     | `string[]`                  | `[]`                  | Language codes                 |
| `region`        | `string`                    | auto                  | Regional bundle                |
| `grammar`       | `boolean`                   | `false`               | Grammar transformation         |

## Next Steps

- [Bundle Selection](/en/guide/bundles) - Understand bundle options
- [@lokascript/core](/en/packages/core) - Core package reference
- [Multilingual](/en/guide/multilingual) - Writing in other languages
