# Hello World

Your first hyperscript interaction.

## The Code

```html
<button _="on click put 'Hello, LokaScript!' into #output">Click me</button>
<div id="output">Output appears here</div>
```

## How It Works

| Part                       | Meaning                         |
| -------------------------- | ------------------------------- |
| `_="..."`                  | The hyperscript attribute       |
| `on click`                 | Listen for click events         |
| `put 'Hello, LokaScript!'` | The value to insert             |
| `into #output`             | Target element with id="output" |

## Try It

Click the button below:

<div class="demo">
  <button _="on click put 'Hello, LokaScript!' into #hello-output">
    Click me
  </button>
  <div id="hello-output" style="padding: 1rem; margin-top: 0.5rem; background: var(--vp-c-bg-soft); border-radius: 4px;">
    Output appears here
  </div>
</div>

## Variations

### Different Events

```html
<!-- On hover -->
<button _="on mouseenter put 'Hovering!' into #output">Hover me</button>

<!-- On double-click -->
<button _="on dblclick put 'Double clicked!' into #output">Double-click me</button>
```

### Different Targets

```html
<!-- Into self -->
<button _="on click put 'Clicked!' into me">Click me</button>

<!-- Into next sibling -->
<button _="on click put 'Hello!' into the next <div/>">Click me</button>
<div></div>
```

### Append Instead of Replace

```html
<button _="on click append ' Click!' to #output">Add text</button>
<div id="output">Count:</div>
```

### HTML Content

```html
<button _="on click put '<strong>Bold!</strong>' into #output">Add HTML</button>
```

## Key Concepts

1. **Event Handling**: `on [event]` sets up listeners
2. **DOM Updates**: `put [value] into [target]` updates content
3. **CSS Selectors**: Standard CSS selectors (`#id`, `.class`)
4. **Declarative**: Describe _what_ should happen, not _how_

## Next Steps

- [Toggle Classes](/en/cookbook/toggle-classes) - Add/remove CSS classes
- [Show/Hide](/en/cookbook/show-hide) - Control visibility
- [Commands](/en/guide/commands) - All available commands
