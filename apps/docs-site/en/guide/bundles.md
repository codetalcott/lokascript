# Bundle Selection

LokaScript offers multiple bundle sizes. Choose based on what features you need and how much you care about bundle size.

## Bundle Comparison

| Bundle              | Size (gzip) | Commands   | Use Case                              |
| ------------------- | ----------- | ---------- | ------------------------------------- |
| **lite**            | 1.9 KB      | 8          | Toggle, show/hide, basic interactions |
| **lite-plus**       | 2.6 KB      | 14         | Basic + form handling, i18n aliases   |
| **hybrid-complete** | 7.3 KB      | 21+ blocks | Most projects (recommended)           |
| **hybrid-hx**       | 9.5 KB      | 21+ blocks | hybrid-complete + htmx compatibility  |
| **standard**        | 63 KB       | 43         | Full command set                      |
| **browser**         | 224 KB      | 43         | Full bundle with parser               |

## Which Bundle Should I Use?

### Use `hybrid-complete` (Recommended)

For most projects. It includes:

- Full expression parser with operator precedence
- Block commands: `repeat`, `for each`, `if/else`, `fetch`, `while`
- Event modifiers: `.once`, `.prevent`, `.stop`, `.debounce()`, `.throttle()`
- Positional expressions: `first`, `last`, `next`, `previous`, `closest`
- Function calls and method chaining

```html
<button
  _="on click.debounce(300)
  if me has .loading return end then
  add .loading then
  fetch /api/data as json then
  for each item in result
    append item.name to #results
  end then
  remove .loading"
>
  Load Data
</button>
```

### Use `lite` or `lite-plus`

When bundle size is critical and you only need simple interactions:

```html
<!-- These work with lite bundle -->
<button _="on click toggle .active on me">Toggle</button>
<button _="on click show #modal">Show Modal</button>
<button _="on click hide me">Close</button>
```

### Use `hybrid-hx`

When you want htmx-style declarative AJAX attributes:

```html
<button hx-get="/api/users" hx-target="#users-list" hx-swap="innerHTML">Load Users</button>
```

### Use `browser` (Full Bundle)

When you need everything, including:

- All 43 commands
- Complete parser for complex expressions
- Behavior definitions
- Server-side compilation support

## CDN URLs

```html
<!-- Lite (1.9 KB) -->
<script src="https://unpkg.com/@lokascript/core/dist/lokascript-lite.js"></script>

<!-- Lite Plus (2.6 KB) -->
<script src="https://unpkg.com/@lokascript/core/dist/lokascript-lite-plus.js"></script>

<!-- Hybrid Complete (7.3 KB) - Recommended -->
<script src="https://unpkg.com/@lokascript/core/dist/lokascript-hybrid-complete.js"></script>

<!-- Hybrid HX (9.5 KB) -->
<script src="https://unpkg.com/@lokascript/core/dist/lokascript-hybrid-hx.js"></script>

<!-- Full Browser Bundle (224 KB) -->
<script src="https://unpkg.com/@lokascript/core/dist/lokascript-browser.js"></script>
```

## Vite Plugin (Auto-Selection)

The Vite plugin automatically generates the smallest possible bundle:

```javascript
// vite.config.js
import { lokascript } from '@lokascript/vite-plugin';

export default {
  plugins: [lokascript()],
};
```

It scans your files for `_="..."` attributes and includes only the commands you use.

### Force Specific Features

```javascript
lokascript({
  extraCommands: ['fetch', 'put'], // Always include these
  extraBlocks: ['for', 'if'], // Always include these blocks
  positional: true, // Include first, last, next, etc.
  htmx: true, // Include htmx compatibility
});
```

## Feature Matrix

| Feature                  | lite | lite-plus | hybrid-complete | browser |
| ------------------------ | ---- | --------- | --------------- | ------- |
| toggle, add, remove      | ✓    | ✓         | ✓               | ✓       |
| show, hide               | ✓    | ✓         | ✓               | ✓       |
| set, get, put            | ✓    | ✓         | ✓               | ✓       |
| increment, decrement     | ✓    | ✓         | ✓               | ✓       |
| wait                     | -    | ✓         | ✓               | ✓       |
| fetch                    | -    | -         | ✓               | ✓       |
| if/else blocks           | -    | -         | ✓               | ✓       |
| repeat, for each         | -    | -         | ✓               | ✓       |
| Event modifiers          | -    | -         | ✓               | ✓       |
| Positional (first, last) | -    | -         | ✓               | ✓       |
| Method chaining          | -    | -         | ✓               | ✓       |
| Behaviors                | -    | -         | -               | ✓       |
| Full parser              | -    | -         | -               | ✓       |

## Next Steps

- [Commands](/en/guide/commands) - Learn what each command does
- [Expressions](/en/guide/expressions) - Understand expression syntax
- [Vite Plugin](/en/packages/vite-plugin) - Detailed plugin configuration
