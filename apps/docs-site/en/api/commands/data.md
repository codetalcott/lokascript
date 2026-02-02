# Data Commands

Commands for managing state and default values.

## Default Values

### `default`

Set a value only if it doesn't already exist.

```html
<!-- Default variable value -->
<button _="on load default :count to 0">Initialize</button>

<!-- Default attribute -->
<button _="on load default @data-theme to 'light'">Set Theme</button>

<!-- Default element property -->
<input _="on load default my value to 'Enter text...'" />

<!-- Default innerHTML -->
<div _="on load default my innerHTML to 'No content yet'">Loading...</div>
```

## Next Steps

- [DOM Commands](/en/api/commands/dom) - Element manipulation
- [Control Flow](/en/api/commands/control-flow) - Conditionals and loops
- [Async Commands](/en/api/commands/async) - fetch, wait
