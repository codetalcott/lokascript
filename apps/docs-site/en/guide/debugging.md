# Debugging

Tools and techniques for debugging hyperscript code.

## Console Commands

### `log`

Output values to the browser console.

```html
<button _="on click log 'Button clicked!'">Log Message</button>
<button _="on click log 'Value:' my value">Log with Label</button>
<button _="on click log :count :name :data">Log Multiple</button>
```

The `log` command doesn't overwrite `it`, so you can chain:

```html
<button
  _="on click
  fetch /api/data as json then
  log it then
  put it.name into #output"
>
  Fetch, Log, Display
</button>
```

### `beep!`

Debug output with type information.

```html
<!-- Debug current context -->
<button _="on click beep!">Debug Context</button>

<!-- Debug specific value -->
<button _="on click beep! :myVariable">Debug Variable</button>

<!-- Debug multiple expressions -->
<button _="on click beep! me.id, :count, #input.value">Debug Multiple</button>
```

`beep!` outputs structured information:

```
🔔 beep! Debug Output
  Value: "hello"
  Type: string
  Representation: "hello"
```

## Enable Debug Logging

### In Browser Console

```javascript
// Enable detailed logging
lokascript.debugControl.enable();

// Disable logging
lokascript.debugControl.disable();

// Check if enabled
lokascript.debugControl.isEnabled();

// Get detailed status
lokascript.debugControl.status();
```

### Via localStorage

```javascript
// Enable all debug categories
localStorage.setItem('lokascript:debug', '*');

// Then reload the page
location.reload();
```

Debug logging persists across page reloads.

## Debug Log Categories

| Prefix    | Module              | Description                      |
| --------- | ------------------- | -------------------------------- |
| `ATTR:`   | attribute-processor | DOM scanning, element processing |
| `SCRIPT:` | attribute-processor | Script tag compilation           |
| `SCAN:`   | attribute-processor | Document scanning                |
| `PARSE:`  | parser              | Tokenization, AST building       |
| `CMD:`    | commands            | Command execution                |
| `EXPR:`   | expressions         | Expression evaluation            |

## Semantic Parser Events

Listen to semantic parse events to understand parser decisions:

```javascript
window.addEventListener('lokascript:semantic-parse', e => {
  console.log('Semantic parse:', e.detail);
  // {
  //   input: 'toggle .active',
  //   language: 'en',
  //   confidence: 0.95,
  //   semanticSuccess: true,
  //   command: 'toggle',
  //   roles: { patient: '.active' }
  // }
});
```

## Parse Statistics

Get parsing statistics during development:

```javascript
const stats = lokascript.semanticDebug.getStats();
console.log(stats);
// {
//   totalParses: 42,
//   semanticSuccesses: 38,
//   semanticFallbacks: 4,
//   traditionalParses: 0,
//   averageConfidence: 0.91
// }
```

## Compilation Metadata

Every compilation returns metadata about which parser was used:

```javascript
const result = lokascript.compile('toggle .active');
console.log(result.metadata);
// {
//   parserUsed: 'semantic',
//   semanticConfidence: 0.98,
//   semanticLanguage: 'en',
//   warnings: []
// }
```

## Common Debugging Patterns

### Trace Execution Flow

```html
<button
  _="on click
  log '1. Start' then
  add .loading to me then
  log '2. Added loading' then
  fetch /api/data as json then
  log '3. Fetched:' it then
  put it.name into #output then
  log '4. Done'"
>
  Trace Steps
</button>
```

### Debug Event Data

```html
<button
  _="on click
  log 'Event:' event then
  log 'Target:' event.target then
  log 'Type:' event.type"
>
  Log Event
</button>
```

### Debug Context References

```html
<div
  _="on click from .item
  log 'me:' me then
  log 'you:' you then
  log 'event.target:' event.target"
>
  <div class="item">Click me</div>
</div>
```

### Debug Variable State

```html
<button
  _="on click
  beep! :count, :items, :user then
  log '---' then
  log 'Count:' :count then
  log 'Items:' :items then
  log 'User:' :user"
>
  Debug State
</button>
```

### Debug Loop Iterations

```html
<button
  _="on click
  for each item in .list-item index i
    log `Processing item ${i}:` item then
    add .processed to item
  end"
>
  Debug Loop
</button>
```

## Validation

### Validate Before Execution

```javascript
const validation = await hyperscript.validate('toggle .active');

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  validation.errors.forEach(err => {
    console.error(`Line ${err.line}: ${err.message}`);
  });
}
```

## Troubleshooting Tips

### Element Not Found

```html
<!-- Add existence check -->
<button
  _="on click
  log 'Looking for #target' then
  if #target exists
    log 'Found!' then
    toggle .active on #target
  else
    log 'Element not found!'
  end"
>
  Safe Toggle
</button>
```

### Timing Issues

```html
<!-- Debug timing -->
<button
  _="on click
  log 'Starting fetch' then
  set :start to Date.now() then
  fetch /api/data as json then
  set :duration to Date.now() - :start then
  log `Fetch took ${:duration}ms`"
>
  Measure Time
</button>
```

### Unexpected Values

```html
<!-- Type check -->
<button
  _="on click
  log 'Value:' :myVar then
  log 'Type:' typeof :myVar then
  beep! :myVar"
>
  Check Type
</button>
```

## Summary

| Tool/Method                     | Purpose                 |
| ------------------------------- | ----------------------- |
| `log`                           | Basic console output    |
| `beep!`                         | Debug with type info    |
| `debugControl.enable()`         | Enable detailed logging |
| `localStorage lokascript:debug` | Persistent debug mode   |
| `lokascript:semantic-parse`     | Parser decision events  |
| `semanticDebug.getStats()`      | Parsing statistics      |
| `compile().metadata`            | Compilation info        |
| `validate()`                    | Syntax validation       |

## Next Steps

- [Commands](/en/guide/commands) - Available commands
- [Events](/en/guide/events) - Event handling
- [Expressions](/en/guide/expressions) - Expression syntax
