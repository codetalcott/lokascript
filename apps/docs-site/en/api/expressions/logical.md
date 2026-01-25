# Logical Expressions

Comparison operators, boolean logic, and conditional expressions.

## Comparison Operators

### Equality

```html
<!-- Loose equality (type coercion) -->
<button _="on click if :count is 5 add .active to me">Check Count</button>
<button _="on click if :count == 5 add .active to me">Check Count</button>
<button _="on click if :name equals 'John' show #greeting">Check Name</button>

<!-- String "5" equals number 5 with loose equality -->
<button _="on click if '5' == 5 log 'equal'">Type Coercion</button>
```

### Inequality

```html
<button _="on click if :count is not 0 enable #submit">Not Zero</button>
<button _="on click if :count != 0 enable #submit">Not Zero</button>
```

### Greater/Less Than

```html
<!-- Greater than -->
<button _="on click if :count > 10 add .warning to me">Over 10</button>
<button _="on click if :count >= 10 add .warning to me">10 or more</button>

<!-- Less than -->
<button _="on click if :count < 5 add .low to me">Under 5</button>
<button _="on click if :count <= 5 add .low to me">5 or less</button>
```

## Boolean Logic

### `and`

Both conditions must be true.

```html
<button
  _="on click
  if :username is not empty and :password is not empty
    enable #submit
  end"
>
  Check Form
</button>
```

### `or`

At least one condition must be true.

```html
<button
  _="on click
  if :role is 'admin' or :role is 'moderator'
    show #admin-panel
  end"
>
  Check Access
</button>
```

### `not`

Negate a condition.

```html
<button _="on click if not me has .disabled add .active to me">Toggle if Enabled</button>

<button _="on click if not :loggedIn show #login-modal">Check Login</button>
```

### Combining Operators

```html
<button
  _="on click
  if (:count > 0 and :count < 100) or :override is true
    process()
  end"
>
  Complex Logic
</button>
```

## Existence and Type Checks

### `exists`

Check if an element exists in the DOM.

```html
<button _="on click if #modal exists show #modal else create modal end">Toggle Modal</button>
```

### `is empty` / `is not empty`

Check if a value is empty (null, undefined, empty string, or empty array).

```html
<input
  _="on input
  if my value is empty
    add .invalid to me
  else
    remove .invalid from me
  end"
/>
```

### `has`

Check if an element has a class.

```html
<button _="on click if me has .active remove .active from me">Check Class</button>

<button _="on click if #container has .loading wait 100ms">Wait for Load</button>
```

### `matches`

Check if a value matches a regular expression.

```html
<input
  _="on input
  if my value matches /^[a-zA-Z]+$/
    remove .invalid from me
  else
    add .invalid to me
  end"
/>
```

## String Conditions

### `contains`

Check if a string contains a substring.

```html
<input
  _="on input
  if my value contains '@'
    remove .invalid from #email
  else
    add .invalid to #email
  end"
/>
```

### `starts with` / `ends with`

```html
<input
  _="on input
  if my value starts with 'https://'
    add .secure to me
  end"
/>

<input
  _="on input
  if my value ends with '.com'
    add .valid-domain to me
  end"
/>
```

## Truthiness

In hyperscript, the following are falsy:

- `false`
- `null`
- `undefined`
- `0`
- `''` (empty string)
- `NaN`

Everything else is truthy.

```html
<button
  _="on click
  if :user
    show #profile
  else
    show #login
  end"
>
  Check User
</button>
```

## Common Patterns

### Form Validation

```html
<form
  _="on submit
  set :valid to true then
  if #email.value is empty
    add .error to #email then
    set :valid to false
  end then
  if #password.value.length < 8
    add .error to #password then
    set :valid to false
  end then
  if not :valid
    halt
  end"
>
  <!-- form fields -->
</form>
```

### Conditional Visibility

```html
<div
  _="on load
  if :userRole is 'admin'
    show .admin-only
  else if :userRole is 'moderator'
    show .mod-only
  else
    hide .restricted
  end"
>
  Content
</div>
```

### Range Check

```html
<input
  type="number"
  _="on input
  get my value as Int then
  if it >= 1 and it <= 100
    remove .error from me
  else
    add .error to me
  end"
/>
```

## Operator Precedence

From highest to lowest:

1. `not`
2. Comparison (`<`, `>`, `<=`, `>=`, `is`, `==`, `!=`)
3. `and`
4. `or`

Use parentheses to clarify complex expressions:

```html
<button _="on click if (a and b) or (c and d) process()">Complex Logic</button>
```

## Summary Table

| Operator        | Description           | Example                    |
| --------------- | --------------------- | -------------------------- |
| `is` / `==`     | Loose equality        | `x is 5`                   |
| `is not` / `!=` | Inequality            | `x is not 0`               |
| `>`             | Greater than          | `x > 10`                   |
| `>=`            | Greater than or equal | `x >= 10`                  |
| `<`             | Less than             | `x < 5`                    |
| `<=`            | Less than or equal    | `x <= 5`                   |
| `and`           | Logical AND           | `a and b`                  |
| `or`            | Logical OR            | `a or b`                   |
| `not`           | Logical NOT           | `not x`                    |
| `exists`        | Element exists        | `#modal exists`            |
| `has`           | Has class             | `me has .active`           |
| `is empty`      | Value is empty        | `value is empty`           |
| `contains`      | String contains       | `value contains '@'`       |
| `starts with`   | String starts with    | `value starts with 'http'` |
| `ends with`     | String ends with      | `value ends with '.com'`   |
| `matches`       | Regex match           | `value matches /pattern/`  |

## Next Steps

- [Selectors](/en/api/expressions/selectors) - Element references
- [Properties](/en/api/expressions/properties) - Accessing properties
- [Type Conversion](/en/api/expressions/conversion) - Converting types
