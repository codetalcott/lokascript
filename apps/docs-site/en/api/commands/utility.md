# Utility Commands

Commands for debugging, clipboard operations, and context switching.

## Debugging

### `log`

Log values to the browser console.

```html
<!-- Log a string -->
<button _="on click log 'Button clicked!'">Log Message</button>

<!-- Log a value -->
<button _="on click log my value">Log Input Value</button>

<!-- Log multiple values -->
<button _="on click log 'Count:' :count">Log with Label</button>

<!-- Log after operations -->
<button _="on click fetch /api/data as json then log it then put it into #result">
  Fetch and Log
</button>
```

### `beep!`

Debug output with type information. Shows value, type, and representation.

```html
<!-- Debug current context -->
<button _="on click beep!">Debug Context</button>

<!-- Debug a value -->
<button _="on click beep! :myVariable">Debug Variable</button>

<!-- Debug multiple expressions -->
<button _="on click beep! me.id, me.className, :count">Debug Multiple</button>
```

The `beep!` command outputs structured debug information:

```
🔔 beep! Debug Output
  Value: "hello"
  Type: string
  Representation: "hello"
```

## Clipboard

### `copy`

Copy text or element content to the clipboard.

```html
<!-- Copy text -->
<button _="on click copy 'Hello World!'">Copy Text</button>

<!-- Copy element content -->
<button _="on click copy #code-snippet">Copy Code</button>

<!-- Copy input value -->
<button _="on click copy #share-url.value">Copy URL</button>

<!-- Copy with feedback -->
<button
  _="on click
  copy #api-key.value then
  add .copied to me then
  wait 2s then
  remove .copied from me"
>
  Copy API Key
</button>
```

### Copy Events

```javascript
element.addEventListener('copy:success', e => {
  console.log('Copied:', e.detail.text);
});

element.addEventListener('copy:error', e => {
  console.error('Copy failed:', e.detail.error);
});
```

## Context Switching

### `tell`

Execute commands in the context of target elements. Within a `tell` block, `me` refers to the target element.

```html
<!-- Tell single element -->
<button _="on click tell #sidebar hide">Hide Sidebar</button>

<!-- Tell multiple elements -->
<button _="on click tell .notification add .dismissed">Dismiss All</button>

<!-- Tell with multiple commands -->
<button
  _="on click
  tell #modal
    add .visible then
    add .fade-in
  end"
>
  Show Modal
</button>
```

### Common `tell` Patterns

```html
<!-- Tell closest parent -->
<button _="on click tell closest <form/> submit">Submit Form</button>

<!-- Batch operations -->
<button
  _="on click
  tell .item
    remove .selected then
    add .processed
  end"
>
  Process All Items
</button>
```

## Random Selection

### `pick`

Select a random element from a collection.

```html
<!-- Pick from inline items -->
<button _="on click pick 'red', 'green', 'blue' then put it into #result">Random Color</button>

<!-- Pick from array -->
<button _="on click pick from :colors then put it into #selected">Pick Color</button>

<!-- Pick and use -->
<button
  _="on click
  pick 'Hello!', 'Hi there!', 'Greetings!' then
  put it into me"
>
  Random Greeting
</button>
```

### Random Selection Patterns

```html
<!-- Random quote -->
<button
  _="on click
  pick from :quotes then
  put it.text into #quote then
  put '— ' + it.author into #author"
>
  Random Quote
</button>

<!-- Random decision -->
<div
  _="on load
  pick 'A', 'B', 'C' then
  set :variant to it then
  add .variant-{:variant} to me"
>
  A/B/C Test
</div>
```

## Common Patterns

### Copy with Visual Feedback

```html
<button
  _="on click
  copy #share-link.value then
  set my textContent to 'Copied!' then
  wait 2s then
  set my textContent to 'Copy Link'"
>
  Copy Link
</button>
```

### Debug During Development

```html
<form
  _="on submit
  halt then
  log 'Form submitted' then
  beep! me then
  log 'Form data:' my elements"
>
  <!-- form fields -->
</form>
```

### Bulk Operations with Tell

```html
<button
  _="on click
  tell .card
    add .loading then
    set @disabled to true
  end then
  fetch /api/refresh then
  tell .card
    remove .loading then
    set @disabled to false
  end"
>
  Refresh All
</button>
```

## Summary Table

| Command | Description               | Example              |
| ------- | ------------------------- | -------------------- |
| `log`   | Log to console            | `log 'Hello' :value` |
| `beep!` | Debug with type info      | `beep! :myVar`       |
| `copy`  | Copy to clipboard         | `copy #code`         |
| `tell`  | Execute in target context | `tell #modal show`   |
| `pick`  | Random selection          | `pick 'a', 'b', 'c'` |

## Next Steps

- [DOM Commands](/en/api/commands/dom) - Element manipulation
- [Data Commands](/en/api/commands/data) - State and persistence
- [Control Flow](/en/api/commands/control-flow) - Conditionals and loops
