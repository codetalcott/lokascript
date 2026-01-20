# Events

Handle DOM events with the `on` keyword and event modifiers.

## Basic Event Handling

```html
<button _="on click toggle .active on me">Click me</button>
<button _="on dblclick show #modal">Double-click</button>
<div _="on mouseenter add .hover to me">Hover me</div>
```

## Event Modifiers

Modifiers change how events are handled.

### `.once`

Handle the event only once:

```html
<button _="on click.once put 'Clicked!' into me">Click once</button>
```

### `.prevent`

Prevent default browser behavior:

```html
<form _="on submit.prevent fetch /api/submit with method:'POST'">
  <button type="submit">Submit</button>
</form>

<a _="on click.prevent show #modal" href="#">Open Modal</a>
```

### `.stop`

Stop event propagation:

```html
<div _="on click hide me">
  <button _="on click.stop toggle .active on me">Won't hide parent</button>
</div>
```

### `.debounce(ms)`

Wait for pause in events:

```html
<input _="on input.debounce(300) fetch `/api/search?q=${my value}`" />
```

### `.throttle(ms)`

Limit event frequency:

```html
<div _="on scroll.throttle(100) log 'scrolling'">Scroll content</div>
```

### Combining Modifiers

```html
<form _="on submit.prevent.once fetch /api/submit">Submit once only</form>
```

## Keyboard Events

### Key Filtering

```html
<input _="on keydown[key=='Enter'] submit the closest <form/>" />
<input _="on keydown[key=='Escape'] blur me" />
```

### Common Key Patterns

```html
<!-- Enter key -->
<input _="on keydown[key=='Enter'] ..." />

<!-- Escape key -->
<input _="on keydown[key=='Escape'] ..." />

<!-- Arrow keys -->
<div _="on keydown[key=='ArrowDown'] ...">
  <div _="on keydown[key=='ArrowUp'] ...">
    <!-- With modifiers -->
    <input _="on keydown[ctrlKey and key=='s'] halt then save()" />
  </div>
</div>
```

## Mouse Events

```html
<div _="on click ...">Click</div>
<div _="on dblclick ...">Double click</div>
<div _="on mouseenter ...">Mouse enter</div>
<div _="on mouseleave ...">Mouse leave</div>
<div _="on mousemove ...">Mouse move</div>
<div _="on mousedown ...">Mouse down</div>
<div _="on mouseup ...">Mouse up</div>
```

### Hover Pattern

```html
<div
  _="on mouseenter add .hover to me
        on mouseleave remove .hover from me"
>
  Hover me
</div>
```

## Form Events

```html
<input _="on input ..." />
<!-- Value changes -->
<input _="on change ..." />
<!-- Value committed -->
<input _="on focus ..." />
<!-- Gained focus -->
<input _="on blur ..." />
<!-- Lost focus -->
<form _="on submit ...">
  <!-- Form submitted -->
  <form _="on reset ..."><!-- Form reset --></form>
</form>
```

## Delegated Events

Handle events from child elements using `from`:

```html
<ul _="on click from li toggle .selected on you">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

In delegated handlers:

- `me` = the element with the `_` attribute (the `<ul>`)
- `you` = the element that triggered the event (the clicked `<li>`)

## Custom Events

### Send Custom Events

```html
<button _="on click send dataLoaded to #app">Load Complete</button>

<button _="on click send userSelected(userId: 123) to #app">Select User</button>
```

### Listen for Custom Events

```html
<div id="app" _="on dataLoaded put 'Data loaded!' into me">Waiting...</div>

<div _="on userSelected(userId) fetch `/api/user/${userId}`">User details</div>
```

### Trigger Native Events

```html
<button _="on click trigger submit on #form">Submit Form</button>
```

## Event Object

Access the DOM event object:

```html
<button _="on click log event.type">Log event type</button>
<button _="on click log event.target">Log target</button>
<div _="on mousemove put event.clientX + ', ' + event.clientY into #coords">Move mouse here</div>
```

### Extract Event Data

```html
<input _="on input(value) put value into #preview" />
<div _="on mousemove(clientX, clientY) log clientX, clientY"></div>
```

## Window Events

```html
<div _="on load from window show me">Shows when page loads</div>

<div _="on resize from window log 'resized'">Listens to window resize</div>

<div
  _="on scroll from window
  if window.scrollY > 100
    show #back-to-top
  else
    hide #back-to-top
  end"
></div>
```

## Document Events

```html
<div
  _="on keydown from document
  if event.key == 'Escape'
    hide #modal
  end"
></div>
```

## Event Patterns

### Click Outside to Close

```html
<div
  id="modal"
  _="on click from document
  if not (event.target closest #modal)
    hide me
  end"
>
  Modal content
</div>
```

### Escape to Close

```html
<div id="modal" _="on keydown[key=='Escape'] from document hide me">Press Escape to close</div>
```

### Infinite Scroll

```html
<div
  _="on scroll from window
  if (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100
    if not (me has .loading)
      add .loading to me then
      fetch /api/more then
      remove .loading from me
    end
  end"
></div>
```

## Next Steps

- [Context & Variables](/en/guide/context) - me, you, it, locals
- [Commands](/en/guide/commands) - What to do in handlers
- [Async Commands](/en/api/commands/async) - wait, fetch
