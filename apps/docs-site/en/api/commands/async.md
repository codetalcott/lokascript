# Async Commands

Commands for HTTP requests, timing, and asynchronous operations.

## HTTP Requests

### `fetch`

Make HTTP requests with automatic response handling.

```html
<!-- Basic GET -->
<button _="on click fetch /api/data then put it into #output">Load Data</button>

<!-- Fetch as JSON -->
<button _="on click fetch /api/users as json then put it.name into #name">Load User</button>

<!-- Fetch as HTML -->
<button _="on click fetch /partial.html as html then put it into #container">Load Partial</button>

<!-- Fetch as text -->
<button _="on click fetch /api/message as text then put it into #message">Load Message</button>
```

### POST Requests

```html
<!-- POST with body -->
<button
  _="on click
  fetch /api/save with method:'POST', body:'data=value' then
  put 'Saved!' into #status"
>
  Save
</button>

<!-- POST JSON -->
<button
  _="on click
  set :data to { name: #name.value, email: #email.value } then
  fetch /api/users with { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(:data) } as json then
  put it.id into #result"
>
  Create User
</button>

<!-- POST form data -->
<form
  _="on submit halt then
  fetch /api/submit with method:'POST', body: me as FormData then
  put 'Submitted!' into #status"
>
  <input name="name" />
  <button type="submit">Submit</button>
</form>
```

### Request Options

```html
<!-- With timeout -->
<button
  _="on click
  fetch /api/slow with timeout:5000 then
  put it into #result"
>
  Fetch with Timeout
</button>

<!-- With headers -->
<button
  _="on click
  fetch /api/data with headers:{'Authorization': 'Bearer token'} then
  put it into #result"
>
  Authenticated Request
</button>

<!-- Full options -->
<button
  _="on click
  fetch /api/data with {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'value' }),
    timeout: 10000
  } as json then
  put it into #result"
>
  Full Request
</button>
```

### Error Handling

```html
<button
  _="on click
  fetch /api/data as json
  on success put it into #result
  on error put 'Failed to load' into #result"
>
  Fetch with Error Handling
</button>
```

## Timing

### `wait`

Pause execution for a duration or until an event.

```html
<!-- Wait milliseconds -->
<button _="on click wait 500ms then put 'Done!' into me">Wait 500ms</button>

<!-- Wait seconds -->
<button _="on click wait 2s then hide me">Wait 2 seconds</button>

<!-- Wait for event -->
<button
  _="on click
  show #modal then
  wait for click from #close-btn then
  hide #modal"
>
  Show Modal and Wait for Close
</button>

<!-- Wait for event with data extraction -->
<button
  _="on click
  wait for input(value) from #search then
  put value into #preview"
>
  Wait for Input
</button>

<!-- Wait for event or timeout (race) -->
<button
  _="on click
  add .waiting to me then
  wait for response or 5s then
  remove .waiting from me"
>
  Wait with Timeout
</button>
```

### `settle`

Wait for CSS transitions to complete.

```html
<button
  _="on click
  add .fade-out to #element then
  settle then
  remove #element"
>
  Fade Out and Remove
</button>
```

## Async Execution

### `async`

Run commands without blocking.

```html
<!-- Fire and forget -->
<button
  _="on click
  async do
    fetch /api/track with method:'POST'
  end then
  put 'Clicked!' into me"
>
  Track Click Asynchronously
</button>

<!-- Multiple async operations -->
<button
  _="on click
  async do fetch /api/a then put it into #a end
  async do fetch /api/b then put it into #b end
  put 'Loading...' into #status"
>
  Parallel Fetches
</button>
```

## Event Dispatching

### `send`

Send custom events to elements.

```html
<!-- Send custom event -->
<button _="on click send dataLoaded to #app">Send Event</button>

<!-- Send with data -->
<button _="on click send userSelected(userId: 123) to #app">Send with Data</button>

<!-- Listen for custom event -->
<div _="on dataLoaded put 'Data received!' into me">Waiting for event...</div>
```

### `trigger`

Trigger native or custom events.

```html
<!-- Trigger click -->
<button _="on click trigger click on #other-button">Click Other Button</button>

<!-- Trigger submit -->
<button _="on click trigger submit on #form">Submit Form</button>
```

## Common Patterns

### Loading State

```html
<button
  _="on click
  add .loading to me then
  set @disabled of me to true then
  fetch /api/data as json then
  put it into #result then
  remove .loading from me then
  set @disabled of me to false"
>
  Load with State
</button>
```

### Polling

```html
<div
  _="on load
  repeat forever
    fetch /api/status as json then
    put it.status into me then
    wait 5s
  end"
>
  Status: Loading...
</div>
```

### Debounced Search

```html
<input
  _="on input.debounce(300)
  fetch `/api/search?q=${my value}` as json then
  for each result in it
    append `<div>${result.name}</div>` to #results
  end"
/>
```

### Sequential Requests

```html
<button
  _="on click
  fetch /api/user as json then
  set :user to it then
  fetch `/api/user/${:user.id}/posts` as json then
  put it into #posts"
>
  Load User and Posts
</button>
```

## Summary Table

| Command    | Description              | Example                 |
| ---------- | ------------------------ | ----------------------- |
| `fetch`    | HTTP request             | `fetch /api as json`    |
| `wait`     | Pause execution          | `wait 500ms`            |
| `wait for` | Wait for event           | `wait for click`        |
| `settle`   | Wait for CSS transitions | `settle #element`       |
| `async do` | Non-blocking execution   | `async do ... end`      |
| `send`     | Dispatch custom event    | `send loaded to #app`   |
| `trigger`  | Trigger event            | `trigger click on #btn` |

## Response Types

| Type      | Usage           | Returns          |
| --------- | --------------- | ---------------- |
| `as json` | JSON APIs       | Parsed object    |
| `as text` | Plain text      | String           |
| `as html` | HTML fragments  | DOM-ready string |
| (none)    | Response object | Fetch Response   |

## Next Steps

- [Animation](/en/api/commands/animation) - Transitions and timing
- [Control Flow](/en/api/commands/control-flow) - Conditionals and loops
- [DOM Commands](/en/api/commands/dom) - Element manipulation
