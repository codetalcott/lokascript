# Custom Bundles

Generate custom LokaScript bundles with only the commands you need.

## When to Use Custom Bundles

Use custom bundles when:

- You need fine-grained control over bundle contents
- You're not using Vite (the plugin handles this automatically)
- You want to pre-generate bundles for CDN distribution
- You need specific size constraints

## Bundle Generator CLI

```bash
cd packages/core

# Generate from config file
npm run generate:bundle -- --config bundle-configs/my-app.config.json

# Generate from command line
npm run generate:bundle -- \
  --commands toggle,add,remove,show,hide \
  --blocks if \
  --output dist/my-bundle.ts

# Include positional expressions
npm run generate:bundle -- --commands toggle,add --positional --output dist/my-bundle.ts

# Enable htmx integration
npm run generate:bundle -- --commands toggle,set --blocks fetch --htmx --output dist/my-bundle.ts
```

## CLI Options

```bash
npx tsx scripts/generate-inline-bundle.ts [options]

Options:
  --config <file>       JSON config file
  --commands <list>     Comma-separated list of commands
  --blocks <list>       Comma-separated list of blocks (if, repeat, for, while, fetch)
  --output <file>       Output file path (any directory, paths auto-computed)
  --name <name>         Bundle name (default: "Custom")
  --htmx                Enable htmx integration
  --positional          Enable positional expressions (first, last, next, etc.)
  --global <name>       Global variable name (default: "lokascript")
  --strict              Fail on unknown commands or blocks (validation mode)
  --max-iterations <n>  Maximum loop iterations for blocks (default: 1000)
  --help                Show help
```

### Strict Validation Mode

Use `--strict` to catch typos and invalid command names:

```bash
# This will fail if 'toogle' (typo) is not a valid command
npm run generate:bundle -- --commands toggle,toogle --output dist/my-bundle.ts --strict
# Error: Bundle generation failed (strict mode): Unknown command 'toogle'
```

Without `--strict`, unknown commands are silently skipped with a warning.

## Configuration File Format

```json
{
  "name": "MyBundle",
  "commands": ["toggle", "add", "remove", "show", "hide"],
  "blocks": ["if", "repeat"],
  "output": "src/my-bundle.ts",
  "htmxIntegration": true,
  "positionalExpressions": true,
  "globalName": "lokascript"
}
```

### Config Options

| Option                  | Type     | Default        | Description                                             |
| ----------------------- | -------- | -------------- | ------------------------------------------------------- |
| `name`                  | string   | required       | Bundle name (used in comments and errors)               |
| `commands`              | string[] | required       | List of commands to include                             |
| `blocks`                | string[] | `[]`           | Block commands: `if`, `repeat`, `for`, `while`, `fetch` |
| `output`                | string   | required       | Output TypeScript file path                             |
| `htmxIntegration`       | boolean  | `false`        | Add `htmx:afterSettle` listener for htmx integration    |
| `positionalExpressions` | boolean  | `false`        | Include `first`, `last`, `next`, `previous`, etc.       |
| `globalName`            | string   | `"lokascript"` | Global variable name for browser                        |

## Available Commands

### DOM Commands

| Command       | Size | Description                        |
| ------------- | ---- | ---------------------------------- |
| `toggle`      | Low  | Toggle CSS classes/attributes      |
| `add`         | Low  | Add CSS classes                    |
| `remove`      | Low  | Remove elements                    |
| `removeClass` | Low  | Remove CSS classes                 |
| `show`        | Low  | Show elements (display: '')        |
| `hide`        | Low  | Hide elements (display: none)      |
| `put`         | Low  | Insert content (into/before/after) |
| `append`      | Low  | Append content                     |

### Data Commands

| Command     | Size | Description              |
| ----------- | ---- | ------------------------ |
| `set`       | Low  | Set variables/properties |
| `get`       | Low  | Get values               |
| `increment` | Low  | Increment numeric values |
| `decrement` | Low  | Decrement numeric values |

### Animation Commands

| Command      | Size   | Description              |
| ------------ | ------ | ------------------------ |
| `transition` | Medium | CSS transitions          |
| `wait`       | Low    | Delay execution          |
| `take`       | Low    | Take class from siblings |

### Event Commands

| Command   | Size    | Description            |
| --------- | ------- | ---------------------- |
| `send`    | Low     | Dispatch custom events |
| `trigger` | Low     | Alias for send         |
| `log`     | Minimal | Console logging        |

### Navigation Commands

| Command | Size | Description                           |
| ------- | ---- | ------------------------------------- |
| `go`    | Low  | Navigate (back, forward, URL, scroll) |

### Execution Commands

| Command  | Size | Description          |
| -------- | ---- | -------------------- |
| `call`   | Low  | Call functions       |
| `return` | Low  | Return from handlers |
| `focus`  | Low  | Focus elements       |

### Control Flow Commands

| Command    | Size | Description            |
| ---------- | ---- | ---------------------- |
| `break`    | Low  | Exit from a loop       |
| `continue` | Low  | Skip to next iteration |

## Block Commands

Block commands enable control flow structures:

| Block    | Size   | Description           | Example                                          |
| -------- | ------ | --------------------- | ------------------------------------------------ |
| `if`     | Medium | Conditional execution | `if me has .active then hide me end`             |
| `repeat` | Medium | Loop N times          | `repeat 3 times add .pulse end`                  |
| `for`    | Medium | Iterate collection    | `for each item in .items toggle .active on item` |
| `while`  | Medium | Conditional loop      | `while :count < 10 increment :count end`         |
| `fetch`  | Medium | HTTP requests         | `fetch /api/data as json then put it into #out`  |

## Positional Expressions

Enable with `--positional` or `"positionalExpressions": true`:

| Expression            | Description                        |
| --------------------- | ---------------------------------- |
| `first in .items`     | First matching element             |
| `last in .items`      | Last matching element              |
| `next <selector>`     | Next sibling matching selector     |
| `previous <selector>` | Previous sibling matching selector |
| `closest <selector>`  | Closest ancestor matching selector |
| `parent`              | Direct parent element              |

## Commands NOT Available in Lite Bundles

These commands require the full runtime:

| Category              | Commands                                    |
| --------------------- | ------------------------------------------- |
| Advanced execution    | `async`, `js`                               |
| Complex DOM           | `make`, `swap`, `morph`, `process-partials` |
| Data binding          | `bind`, `persist`, `default`                |
| Complex utility       | `beep`, `tell`, `copy`, `pick`              |
| Complex navigation    | `push-url`, `replace-url`                   |
| Advanced control flow | `halt`, `exit`, `throw`, `unless`           |
| Advanced animation    | `settle`, `measure`                         |
| Behaviors             | `install`                                   |

If you need these, use the full `lokascript-browser.js` bundle.

## Bundle Size Comparison

| Bundle          | Commands | Gzipped Size |
| --------------- | -------- | ------------ |
| Minimal         | 3        | ~4 KB        |
| Forms           | 10       | ~5 KB        |
| Animation       | 8        | ~5 KB        |
| Hybrid Complete | 21       | ~7 KB        |
| Full            | 43       | ~203 KB      |

## Pre-Built Bundle Configs

Use these as starting points:

### Lite (1.9 KB)

```json
{
  "name": "Lite",
  "commands": ["toggle", "add", "remove", "show", "hide", "set", "get", "put"]
}
```

### Lite Plus (2.6 KB)

```json
{
  "name": "LitePlus",
  "commands": [
    "toggle",
    "add",
    "remove",
    "show",
    "hide",
    "set",
    "get",
    "put",
    "append",
    "increment",
    "decrement",
    "log",
    "wait",
    "focus"
  ]
}
```

### Hybrid Complete (7.3 KB)

```json
{
  "name": "HybridComplete",
  "commands": [
    "toggle",
    "add",
    "remove",
    "show",
    "hide",
    "set",
    "get",
    "put",
    "append",
    "take",
    "increment",
    "decrement",
    "log",
    "send",
    "trigger",
    "wait",
    "transition",
    "call",
    "focus",
    "return"
  ],
  "blocks": ["if", "repeat", "for", "while", "fetch"],
  "positionalExpressions": true
}
```

## Example Configurations

### Landing Page (Minimal)

```json
{
  "name": "Landing",
  "commands": ["toggle", "show", "hide"],
  "output": "dist/landing-bundle.ts"
}
```

### Forms Application

```json
{
  "name": "Forms",
  "commands": ["toggle", "add", "remove", "show", "hide", "set", "get", "focus", "send"],
  "blocks": ["if"],
  "output": "dist/forms-bundle.ts",
  "htmxIntegration": true
}
```

### Animation-Heavy Site

```json
{
  "name": "Animation",
  "commands": ["toggle", "add", "remove", "show", "hide", "transition", "wait", "take"],
  "output": "dist/animation-bundle.ts"
}
```

### Interactive Dashboard

```json
{
  "name": "Dashboard",
  "commands": [
    "toggle",
    "add",
    "remove",
    "show",
    "hide",
    "set",
    "get",
    "put",
    "append",
    "increment",
    "decrement",
    "log",
    "send",
    "trigger",
    "wait",
    "transition"
  ],
  "blocks": ["if", "repeat", "for", "fetch"],
  "positionalExpressions": true,
  "output": "dist/dashboard-bundle.ts"
}
```

### htmx Integration

```json
{
  "name": "HtmxApp",
  "commands": ["toggle", "add", "remove", "show", "hide", "set", "put"],
  "blocks": ["if", "fetch"],
  "htmxIntegration": true,
  "output": "dist/htmx-bundle.ts"
}
```

## Building the Bundle

After generating the TypeScript file, build with Rollup:

```javascript
// rollup.config.mjs
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'dist/my-bundle.ts',
  output: {
    file: 'dist/lokascript-custom.js',
    format: 'iife',
    name: 'lokascript',
  },
  plugins: [
    nodeResolve({ browser: true }),
    typescript({ declaration: false }),
    terser({ compress: { passes: 3 } }),
  ],
};
```

Build:

```bash
npx rollup -c rollup.config.mjs
```

## CDN Distribution

Generate bundles for CDN hosting:

```bash
# Generate multiple bundles
npm run generate:bundle -- --config configs/lite.json --output dist/cdn/lite.ts
npm run generate:bundle -- --config configs/standard.json --output dist/cdn/standard.ts

# Build all with rollup
npx rollup -c rollup.cdn.config.mjs
```

Serve from your CDN:

```html
<script src="https://cdn.example.com/lokascript/lite.js"></script>
```

## Bundle Analysis

Check what's in a bundle:

```bash
npm run analyze:bundle -- dist/my-bundle.js
```

Output:

```text
Bundle: my-bundle.js
Size: 5.2 KB (gzip: 2.1 KB)
Commands: toggle, add, remove, show, hide
Blocks: if
Expressions: basic
```

## How It Works

The generator creates inline TypeScript that:

1. **Imports the modular parser** - Only the HybridParser class (~600 lines)
2. **Includes minimal runtime** - Just `evaluate()` and `executeCommand()`
3. **Includes only specified commands** - Each command is ~10-30 lines
4. **Auto-initializes** - Processes `[_]` attributes on DOM ready

This achieves 4-7 KB gzipped bundles compared to 203 KB for the full bundle.

### Parser Dependency

Generated bundles always include the HybridParser (~500 lines). This is intentional:

- Bundles interpret hyperscript at runtime
- Parser converts `_="..."` attributes to AST
- Expression evaluation requires AST structure

For automatic command detection, use the [Vite Plugin](/en/guide/vite-plugin) instead.

## Hybrid Parser vs Full Parser

| Parser | Size       | Features                                           |
| ------ | ---------- | -------------------------------------------------- |
| Hybrid | ~5-10 KB   | Most use cases, event modifiers, blocks            |
| Full   | ~60-200 KB | Complex expressions, behaviors, full compatibility |

The hybrid parser covers ~85% of use cases at a fraction of the size.

## Next Steps

- [Bundle Selection](/en/guide/bundles) - Pre-built bundle options
- [Vite Plugin](/en/guide/vite-plugin) - Automatic bundle generation
- [Installation](/en/guide/installation) - Getting started
