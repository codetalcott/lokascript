# Custom Bundles

Generate custom LokaScript bundles with only the commands you need.

## When to Use Custom Bundles

Use custom bundles when:

- You need fine-grained control over bundle contents
- You're not using Vite (the plugin handles this automatically)
- You want to pre-generate bundles for CDN distribution

## Bundle Generator CLI

```bash
cd packages/core

# Generate from config file
npm run generate:bundle -- --config bundle-configs/my-app.config.json

# Generate from command line
npm run generate:bundle -- \
  --commands toggle,add,remove,show,hide \
  --blocks if \
  --output dist/my-bundle.js
```

## Configuration File

Create a JSON config file:

```json
{
  "name": "my-app",
  "commands": ["toggle", "add", "remove", "show", "hide", "set", "put"],
  "blocks": ["if", "repeat"],
  "positional": true,
  "output": "dist/my-app-bundle.js"
}
```

Run:

```bash
npm run generate:bundle -- --config bundle-configs/my-app.config.json
```

## Available Options

### Commands

| Command | Size Impact | Description               |
| ------- | ----------- | ------------------------- |
| toggle  | Low         | Toggle classes/attributes |
| add     | Low         | Add classes               |
| remove  | Low         | Remove classes            |
| show    | Low         | Show elements             |
| hide    | Low         | Hide elements             |
| set     | Low         | Set properties            |
| get     | Low         | Get values                |
| put     | Low         | Insert content            |
| append  | Low         | Append content            |
| fetch   | Medium      | HTTP requests             |
| wait    | Low         | Timing delays             |
| log     | Minimal     | Console logging           |
| send    | Low         | Custom events             |
| trigger | Low         | Trigger events            |

### Blocks

| Block  | Size Impact | Description          |
| ------ | ----------- | -------------------- |
| if     | Medium      | Conditionals         |
| repeat | Medium      | Count loops          |
| for    | Medium      | Collection iteration |
| while  | Medium      | Conditional loops    |

### Positional Expressions

Enable with `--positional` or `"positional": true`:

- first, last
- next, previous
- closest, parent

## Pre-Built Bundles

Use these as starting points:

### Lite (1.9 KB)

```json
{
  "commands": ["toggle", "add", "remove", "show", "hide", "set", "get", "put"]
}
```

### Lite Plus (2.6 KB)

```json
{
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
    "blur",
    "return"
  ],
  "blocks": ["if", "repeat", "for", "while", "fetch"],
  "positional": true
}
```

## CDN Distribution

Generate bundles for CDN hosting:

```bash
# Generate multiple bundles
npm run generate:bundle -- --config configs/lite.json --output dist/cdn/lite.js
npm run generate:bundle -- --config configs/standard.json --output dist/cdn/standard.js
npm run generate:bundle -- --config configs/full.json --output dist/cdn/full.js
```

Then serve from your CDN:

```html
<script src="https://cdn.example.com/lokascript/lite.js"></script>
```

## Minification

Bundles are automatically minified. For additional optimization:

```bash
# Generate then optimize
npm run generate:bundle -- --config my-config.json
npx terser dist/my-bundle.js -o dist/my-bundle.min.js -c -m
```

## Bundle Analysis

Check what's in a bundle:

```bash
# Show bundle contents
npm run analyze:bundle -- dist/my-bundle.js
```

Output:

```
Bundle: my-bundle.js
Size: 5.2 KB (gzip: 2.1 KB)
Commands: toggle, add, remove, show, hide
Blocks: if
Expressions: basic
```

## Hybrid Parser vs Full Parser

| Parser | Size       | Features                                           |
| ------ | ---------- | -------------------------------------------------- |
| Hybrid | ~5-10 KB   | Most use cases, event modifiers, blocks            |
| Full   | ~60-200 KB | Complex expressions, behaviors, full compatibility |

The hybrid parser covers ~85% of use cases at a fraction of the size.

## Example Configs

### Landing Page

Minimal interactions:

```json
{
  "name": "landing",
  "commands": ["toggle", "show", "hide"],
  "blocks": [],
  "positional": false
}
```

### Form-Heavy App

Form handling focus:

```json
{
  "name": "forms",
  "commands": ["toggle", "add", "remove", "set", "put", "focus", "blur"],
  "blocks": ["if"],
  "positional": false
}
```

### Interactive Dashboard

Full interactivity:

```json
{
  "name": "dashboard",
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
  "positional": true
}
```

## Next Steps

- [Bundle Selection](/en/guide/bundles) - Pre-built bundle options
- [Vite Plugin](/en/guide/vite-plugin) - Automatic bundle generation
- [Installation](/en/guide/installation) - Getting started
