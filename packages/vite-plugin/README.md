# @hyperfixi/vite-plugin

Zero-config Vite plugin that automatically generates minimal HyperFixi bundles based on detected hyperscript usage.

## Features

- **Zero-config**: Just add the plugin and it works
- **Automatic detection**: Scans HTML, Vue, Svelte, JSX/TSX for `_="..."` attributes
- **Minimal bundles**: Only includes commands and blocks you actually use
- **HMR support**: Re-generates bundle when you add new hyperscript
- **Framework agnostic**: Works with any Vite-based project

## Installation

```bash
npm install @hyperfixi/vite-plugin
```

## Usage

```javascript
// vite.config.js
import { hyperfixi } from '@hyperfixi/vite-plugin';

export default {
  plugins: [hyperfixi()]
};
```

Then import hyperfixi anywhere in your code:

```javascript
import 'hyperfixi';
```

That's it! The plugin automatically:
1. Scans your source files for hyperscript usage
2. Detects which commands, blocks, and expressions you use
3. Generates a minimal bundle with only those features
4. Re-generates on file changes during development

## Options

```javascript
hyperfixi({
  // Extra commands to always include (for dynamic hyperscript)
  extraCommands: ['fetch', 'put'],

  // Extra blocks to always include
  extraBlocks: ['if', 'repeat'],

  // Always include positional expressions
  positional: true,

  // Enable htmx integration
  htmx: true,

  // File patterns to scan (defaults to common web files)
  include: /\.(html|vue|svelte|jsx|tsx)$/,

  // File patterns to exclude (defaults to node_modules)
  exclude: /node_modules/,

  // Development fallback strategy
  // 'hybrid-complete': Use pre-built bundle for faster dev (default)
  // 'full': Use full bundle
  // 'auto': Generate minimal bundle even in dev
  devFallback: 'auto',

  // Enable debug logging
  debug: true,
})
```

## How It Works

### Detection

The plugin scans files for hyperscript attributes:

```html
<button _="on click toggle .active">Toggle</button>
<form _="on submit fetch /api then put result into #output">Submit</form>
```

From this, it detects:
- Commands: `toggle`, `fetch`, `put`
- Blocks: none
- Positional: none

### Bundle Generation

Based on detected usage, it generates a minimal bundle:

```
Detected: toggle, fetch, put
Bundle size: ~5 KB gzipped (vs 39 KB full bundle)
```

### Edge Cases

For dynamically generated hyperscript that can't be detected:

```javascript
// This can't be detected by static analysis
element.setAttribute('_', `on click ${dynamicCommand} .active`);
```

Use `extraCommands` to include those:

```javascript
hyperfixi({
  extraCommands: ['toggle', 'add', 'remove']
})
```

## Supported File Types

- `.html`, `.htm`
- `.vue` (single file components)
- `.svelte`
- `.jsx`, `.tsx`
- `.astro`
- `.php`, `.erb`, `.ejs`, `.hbs`

## License

MIT
