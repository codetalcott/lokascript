# Toggle Classes

Add and remove CSS classes dynamically for interactive UI.

## Basic Toggle

```html
<div id="box" class="box">Click the button!</div>

<button _="on click toggle .active on #box">Toggle Active</button>
```

```css
.box {
  transition: all 0.3s ease;
}

.box.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: scale(1.1);
}
```

## Toggle on Self

```html
<button _="on click toggle .active on me">Toggle Me</button>
```

Or simply:

```html
<button _="on click toggle .active">Toggle Me</button>
```

When no target is specified, `toggle` applies to `me`.

## Toggle Multiple Classes

```html
<button _="on click toggle .active .highlighted on #box">Toggle Both Classes</button>
```

## Toggle Between Classes

Switch between two mutually exclusive classes:

```html
<button _="on click toggle between .light and .dark on #theme">Toggle Theme</button>
```

## Add and Remove

Sometimes you need explicit control:

```html
<button _="on click add .active to #box">Activate</button>
<button _="on click remove .active from #box">Deactivate</button>
```

## Toggle on Multiple Elements

```html
<button _="on click toggle .highlight on .item">Toggle All Items</button>
```

## Conditional Toggle

```html
<button
  _="on click
  if #box has .active
    remove .active from #box then
    put 'Deactivated' into me
  else
    add .active to #box then
    put 'Activated' into me
  end"
>
  Toggle with Feedback
</button>
```

## Take Class (Exclusive Selection)

Move a class from siblings to the clicked element:

```html
<nav class="tabs">
  <button _="on click take .active from .tab for me" class="tab">Tab 1</button>
  <button _="on click take .active from .tab for me" class="tab">Tab 2</button>
  <button _="on click take .active from .tab for me" class="tab">Tab 3</button>
</nav>
```

Only one tab will have `.active` at a time.

## Toggle with Animation

Let CSS transitions handle the animation:

```html
<button _="on click toggle .expanded on #panel">Expand Panel</button>
```

```css
#panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

#panel.expanded {
  max-height: 500px;
}
```

## Temporary Toggle

Add a class for a duration, then remove it:

```html
<button
  _="on click
  add .flash to #box then
  wait 500ms then
  remove .flash from #box"
>
  Flash
</button>
```

Or with `toggle ... for`:

```html
<button _="on click toggle .highlight on #item for 2s">Highlight for 2 seconds</button>
```

## Patterns

### Card Selection

```html
<div class="cards">
  <div _="on click toggle .selected on me" class="card">Card 1</div>
  <div _="on click toggle .selected on me" class="card">Card 2</div>
  <div _="on click toggle .selected on me" class="card">Card 3</div>
</div>
```

### Accordion

```html
<div class="accordion-item">
  <button _="on click toggle .open on the closest .accordion-item">Section Title</button>
  <div class="content">Content here...</div>
</div>
```

### Dark Mode Toggle

```html
<button _="on click toggle .dark-mode on body">Toggle Dark Mode</button>
```

## Next Steps

- [Show/Hide](/en/cookbook/show-hide) - Control visibility
- [DOM Commands](/en/api/commands/dom) - Full command reference
- [Animation](/en/api/commands/animation) - Transitions and effects
