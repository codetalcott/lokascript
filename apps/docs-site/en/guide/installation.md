# Installation

Get LokaScript running in your project in under a minute.

## Quick Start Options

### Option 1: CDN (Fastest)

Add this script tag to your HTML:

```html
<script src="https://unpkg.com/@lokascript/core/dist/lokascript-browser.js"></script>
```

Then use hyperscript anywhere:

```html
<button _="on click toggle .active on me">Click me</button>
```

### Option 2: Vite Plugin (Recommended)

The Vite plugin automatically generates minimal bundles based on what commands you actually use.

```bash
npm install @lokascript/core @lokascript/vite-plugin
```

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

That's it. The plugin scans your files and includes only the commands you need.

### Option 3: npm (Manual Setup)

```bash
npm install @lokascript/core
```

```javascript
import { hyperscript } from '@lokascript/core';

// Process all elements with _="..." attributes
hyperscript.processNode(document.body);

// Or execute hyperscript programmatically
await hyperscript.eval('toggle .active on me', element);
```

## Verify Installation

Add this to your HTML:

```html
<button _="on click put 'It works!' into the next <div/>">Test LokaScript</button>
<div>Click the button</div>
```

Click the button. If the text changes, you're all set.

## Next Steps

- [Bundle Selection](/en/guide/bundles) - Choose the right bundle size for your project
- [Commands](/en/guide/commands) - Learn the available commands
- [Cookbook](/en/cookbook/) - See practical examples
