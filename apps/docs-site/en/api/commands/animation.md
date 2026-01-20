# Animation Commands

Commands for transitions, timing, and visual effects.

## Timing

### `wait`

Pause execution for a specified time.

```html
<!-- Wait milliseconds -->
<button _="on click add .flash to me then wait 500ms then remove .flash from me">Flash</button>

<!-- Wait seconds -->
<button _="on click hide me then wait 2s then show me">Hide for 2 seconds</button>

<!-- Wait for event -->
<button _="on click add .loading then wait for load from #iframe then remove .loading">
  Wait for iframe load
</button>

<!-- Wait for event or timeout -->
<button
  _="on click
  add .waiting then
  wait for click or 3s then
  remove .waiting"
>
  Click or 3s timeout
</button>
```

### `settle`

Wait for CSS transitions and animations to complete.

```html
<!-- Wait for transition to finish -->
<button
  _="on click
  add .fade-out to #box then
  settle then
  remove #box"
>
  Fade and Remove
</button>

<!-- Settle specific element -->
<button
  _="on click
  add .expanding to #panel then
  settle #panel then
  put 'Expanded!' into #panel"
>
  Expand Panel
</button>

<!-- Settle with timeout -->
<button
  _="on click
  add .animating then
  settle for 3000 then
  remove .animating"
>
  Animate with 3s max
</button>
```

## CSS Transitions

### `transition`

Animate CSS properties using transitions.

```html
<!-- Basic transition -->
<button _="on click transition opacity to 0.5">Fade to 50%</button>

<!-- With duration -->
<button _="on click transition left to 100px over 500ms">Slide Right</button>

<!-- With timing function -->
<button _="on click transition background-color to red over 1s with ease-in-out">
  Color Transition
</button>

<!-- Multiple properties -->
<button
  _="on click
  transition opacity to 0 over 300ms then
  transition transform to 'scale(0.8)' over 300ms"
>
  Shrink and Fade
</button>
```

## Measurements

### `measure`

Get element dimensions and positions.

```html
<!-- Measure all properties -->
<button _="on click measure #box then put it.width into #width-display">Get Width</button>

<!-- Measure specific property -->
<button _="on click measure #box height then put it into #result">Get Height</button>

<!-- Store in variable -->
<button _="on click measure #box x and set dragX then log dragX">Get X Position</button>

<!-- Available properties: width, height, x, y, top, left, right, bottom, scrollTop, scrollLeft -->
```

## Movement and Transfer

### `take`

Move classes or attributes between elements (useful for animations).

```html
<!-- Take class from siblings (tab selection) -->
<nav class="tabs">
  <button _="on click take .active from .tab for me" class="tab">Tab 1</button>
  <button _="on click take .active from .tab for me" class="tab">Tab 2</button>
  <button _="on click take .active from .tab for me" class="tab">Tab 3</button>
</nav>

<!-- Take and transfer -->
<button _="on click take .highlight from .card and put it on the next .card">Move Highlight</button>
```

## Common Animation Patterns

### Flash Effect

```html
<button
  _="on click
  add .flash to me then
  wait 200ms then
  remove .flash from me"
>
  Flash
</button>

<style>
  .flash {
    animation: flash 200ms;
  }
  @keyframes flash {
    50% {
      opacity: 0.5;
    }
  }
</style>
```

### Fade Out and Remove

```html
<button
  _="on click
  transition opacity to 0 over 300ms then
  remove me"
>
  Fade and Remove
</button>
```

### Expand/Collapse

```html
<button
  _="on click
  if #panel has .collapsed
    remove .collapsed from #panel then
    settle #panel
  else
    add .collapsed to #panel then
    settle #panel
  end"
>
  Toggle Panel
</button>

<style>
  #panel {
    transition: max-height 300ms;
    max-height: 500px;
    overflow: hidden;
  }
  #panel.collapsed {
    max-height: 0;
  }
</style>
```

### Shake Effect

```html
<button
  _="on click
  add .shake to #input then
  settle then
  remove .shake from #input"
>
  Shake Input
</button>

<style>
  .shake {
    animation: shake 300ms;
  }
  @keyframes shake {
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
</style>
```

### Sequential Animation

```html
<button
  _="on click
  for each card in .card
    add .visible to card then
    wait 100ms
  end"
>
  Stagger Cards
</button>
```

## Summary Table

| Command      | Description              | Example                   |
| ------------ | ------------------------ | ------------------------- |
| `wait`       | Pause execution          | `wait 500ms`              |
| `wait for`   | Wait for event           | `wait for click`          |
| `settle`     | Wait for CSS transition  | `settle #element`         |
| `transition` | Animate CSS property     | `transition opacity to 0` |
| `measure`    | Get dimensions           | `measure #box width`      |
| `take`       | Transfer class/attribute | `take .active from .tabs` |

## CSS Tips

For smooth animations, define transitions in CSS:

```css
/* Transition all properties */
.animated {
  transition: all 300ms ease;
}

/* Specific properties */
.fade {
  transition: opacity 300ms;
}
.slide {
  transition: transform 300ms ease-out;
}

/* Combined */
.modal {
  transition:
    opacity 200ms,
    transform 200ms;
  opacity: 0;
  transform: scale(0.95);
}
.modal.visible {
  opacity: 1;
  transform: scale(1);
}
```

Then use hyperscript to toggle classes:

```html
<button _="on click toggle .visible on #modal">Toggle Modal</button>
```

## Next Steps

- [Async Commands](/en/api/commands/async) - fetch, wait for events
- [DOM Commands](/en/api/commands/dom) - Element manipulation
- [Cookbook](/en/cookbook/) - More animation patterns
