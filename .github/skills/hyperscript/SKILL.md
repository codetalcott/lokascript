---
name: hyperscript-developer
version: 1.3.0
description: Write hyperscript code for interactive web UIs. Use when user asks for toggles, modals, form validation, loading states, or other DOM interactions.
---

# HyperFixi Hyperscript Developer

You are an expert at writing hyperscript code for interactive web interfaces. Hyperscript is a declarative, English-like language for adding interactivity to HTML elements.

## When to Use This Skill

**Use hyperscript for:**

- Toggles, show/hide, accordions
- Modal dialogs, dropdowns, tabs
- Form validation and submission
- Loading states and animations
- Debounced search, infinite scroll
- Any DOM manipulation triggered by user events

**Do NOT use hyperscript for:**

- Complex state management (use React/Vue/Svelte)
- Heavy computation or data processing
- Server-side logic
- More than ~10 commands in one handler

## Workflow (Follow This Order)

### 1. Understand the Task

Before writing code, identify:

- What DOM elements are involved?
- What events trigger the behavior?
- What should happen when triggered?

### 2. Find the Right Command

If `@lokascript/mcp-server` is connected (multilingual support), use `suggest_command` with the task description:

```
suggest_command({ task: "show a modal when button is clicked" })
```

Otherwise, consult the [Commands Reference](./references/commands.md).

### 3. Write the Code

Hyperscript goes in `_="..."` attributes:

```html
<button _="on click toggle .active on #menu">Menu</button>
<input _="on input put my value into #preview" />
<form _="on submit.prevent fetch /api/save put 'Saved!' into #status"></form>
```

**Key syntax:**

- `on <event>` - Event handler
- `me` - Current element
- `it` - Last result
- `:var` - Local variable
- `#id` / `.class` - Selectors

### 4. Validate Before Returning

**ALWAYS validate your code** before returning it to the user.

If MCP server is connected:

```
validate_hyperscript({ code: "on click toggle .active" })
```

If validation fails, use `get_diagnostics` for detailed error locations.

## Quick Reference

| Need             | Command                                |
| ---------------- | -------------------------------------- |
| Show/hide        | `show #el`, `hide me`, `toggle .class` |
| Add/remove class | `add .highlight`, `remove .error`      |
| Set content      | `put "text" into #el`                  |
| Set variable     | `set :count to 0`                      |
| HTTP request     | `fetch /api as json`                   |
| Delay            | `wait 500ms`                           |
| Loop             | `repeat 5 times ... end`               |
| Conditional      | `if :x > 0 ... else ... end`           |

See [commands.md](./references/commands.md) for full reference.

## Event Modifiers

```html
<!-- Prevent default -->
<form _="on submit.prevent ...">
  <!-- Run once -->
  <button _="on click.once ...">
    <!-- Debounce -->
    <input _="on input.debounce(300ms) ..." />

    <!-- Key combinations -->
    <input _="on keydown.enter submit closest form" />
    <input _="on keydown.ctrl.s.prevent call save()" />
  </button>
</form>
```

See [events.md](./references/events.md) for full reference.

## Common Mistakes (Avoid These)

1. **Using `click` on forms** - Use `submit` event instead

   ```html
   <!-- Bad -->
   <form _="on click ...">
     <!-- Good -->
     <form _="on submit.prevent ..."></form>
   </form>
   ```

2. **Forgetting `.prevent`** - Form submissions navigate away by default

3. **Complex logic in attributes** - If code exceeds 5 lines, consider JavaScript

4. **Not validating code** - Always use `validate_hyperscript` before returning

5. **Missing selectors** - Verify `#id` and `.class` exist in DOM

## MCP Tools Available

When `@lokascript/mcp-server` is connected:

| Tool                    | When to Use                           |
| ----------------------- | ------------------------------------- |
| `suggest_command`       | Find the right command for a task     |
| `get_examples`          | Get few-shot examples for user's task |
| `validate_hyperscript`  | **Always use before returning code**  |
| `get_diagnostics`       | Get detailed errors with line numbers |
| `translate_hyperscript` | Convert between 24 languages          |
| `explain_code`          | Explain existing hyperscript to user  |

## Multilingual Support

LokaScript supports 24 languages with native word order:

| Language | Example                         |
| -------- | ------------------------------- |
| English  | `on click toggle .active`       |
| Spanish  | `en clic alternar .active`      |
| Japanese | `クリック で .active を トグル` |
| Korean   | `클릭 시 .active 를 토글`       |
| Arabic   | `بدّل .active عند نقر`          |

Use `translate_hyperscript` to convert between languages.

## Debugging

If code doesn't work:

1. Use `validate_hyperscript` to check syntax
2. Add `log` command: `on click log me then toggle .active`
3. Check browser console for errors
4. Verify selectors exist in DOM

## Bundled References

- [Commands Reference](./references/commands.md) - All hyperscript commands
- [Expressions Guide](./references/expressions.md) - Variables, selectors, comparisons
- [Events Reference](./references/events.md) - Event handling and modifiers
- [Common Patterns](./references/patterns.md) - Copy-paste examples
