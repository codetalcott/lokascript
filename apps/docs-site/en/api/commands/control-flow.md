# Control Flow Commands

Commands for conditionals, loops, and execution control.

## Conditionals

### `if` / `else`

Execute commands based on conditions.

```html
<!-- Simple if -->
<button _="on click if me has .active remove .active from me">Remove if active</button>

<!-- if/else -->
<button
  _="on click
  if me has .active
    remove .active from me
  else
    add .active to me
  end"
>
  Toggle with Logic
</button>

<!-- else if -->
<button
  _="on click
  if :count < 0
    put 'Negative' into #status
  else if :count == 0
    put 'Zero' into #status
  else
    put 'Positive' into #status
  end"
>
  Check Count
</button>
```

### `unless`

Execute only if condition is false (inverse of `if`).

```html
<button _="on click unless me has .disabled add .active to me">Activate unless disabled</button>
```

### Common Conditions

```html
<!-- Check for class -->
<button _="on click if me has .active ...">Has Class</button>

<!-- Check value -->
<button _="on click if #input.value is empty ...">Is Empty</button>

<!-- Comparison -->
<button _="on click if :count > 10 ...">Greater Than</button>

<!-- String contains -->
<button _="on click if #email.value contains '@' ...">Contains</button>

<!-- Existence check -->
<button _="on click if #modal exists ...">Element Exists</button>
```

## Loops

### `repeat`

Loop a fixed number of times.

```html
<!-- Counted loop -->
<button _="on click repeat 3 times append '!' to #output end">Add 3 Exclamations</button>

<!-- With index -->
<button
  _="on click
  repeat 5 times index i
    append i to #output
  end"
>
  Count to 5
</button>
```

### `for each`

Iterate over collections.

```html
<!-- Iterate array -->
<button _="on click
  for each color in ['red', 'green', 'blue']
    append `<span class="${color}">●</span>` to #colors
  end">
  Add Colors
</button>

<!-- Iterate elements -->
<button _="on click
  for each item in .list-item
    add .processed to item
  end">
  Process All Items
</button>

<!-- With index -->
<button _="on click
  for each item in .item index i
    put i into item
  end">
  Number Items
</button>
```

### `while`

Loop while condition is true.

```html
<button
  _="on click
  set :i to 0 then
  while :i < 5
    append :i to #output then
    increment :i
  end"
>
  While Loop
</button>
```

## Flow Control

### `break`

Exit the current loop.

```html
<button
  _="on click
  for each item in .item
    if item has .stop
      break
    end then
    add .processed to item
  end"
>
  Process Until Stop
</button>
```

### `continue`

Skip to the next iteration.

```html
<button
  _="on click
  for each item in .item
    if item has .skip
      continue
    end then
    add .processed to item
  end"
>
  Skip Flagged Items
</button>
```

### `return`

Exit the handler and optionally return a value.

```html
<button
  _="on click
  if me has .disabled
    return
  end then
  add .active to me"
>
  Early Return
</button>
```

### `exit`

Immediately terminate the current handler.

```html
<button
  _="on click
  if not :isValid exit then
  process the form"
>
  Exit if Invalid
</button>
```

### `halt`

Stop execution and optionally prevent event defaults.

```html
<form
  _="on submit
  if not #email.checkValidity()
    halt
  end"
>
  <!-- Prevents submit if invalid -->
</form>

<!-- Halt and prevent default -->
<a _="on click halt the event then show #modal" href="#"> Open Modal </a>
```

### `throw`

Throw an error.

```html
<button
  _="on click
  if :value < 0
    throw 'Value cannot be negative'
  end"
>
  Validate
</button>
```

## Combining Control Flow

```html
<button
  _="on click
  set :items to <.item/>
  for each item in :items
    if item has .skip
      continue
    end then
    if item has .stop
      break
    end then
    add .processed to item then
    wait 100ms
  end then
  put 'Done!' into #status"
>
  Complex Processing
</button>
```

## Summary Table

| Command    | Description            | Example                       |
| ---------- | ---------------------- | ----------------------------- |
| `if`       | Conditional            | `if x > 5 add .big end`       |
| `else`     | Alternative branch     | `if x > 5 ... else ... end`   |
| `unless`   | Inverse conditional    | `unless disabled ...`         |
| `repeat`   | Fixed iterations       | `repeat 3 times ... end`      |
| `for each` | Collection iteration   | `for each x in items ... end` |
| `while`    | Conditional loop       | `while x < 10 ... end`        |
| `break`    | Exit loop              | `break`                       |
| `continue` | Next iteration         | `continue`                    |
| `return`   | Exit handler           | `return value`                |
| `exit`     | Terminate handler      | `exit`                        |
| `halt`     | Stop + prevent default | `halt the event`              |
| `throw`    | Throw error            | `throw 'error message'`       |

## Next Steps

- [DOM Commands](/en/api/commands/dom) - Element manipulation
- [Async Commands](/en/api/commands/async) - fetch, wait
- [Animation](/en/api/commands/animation) - Transitions
