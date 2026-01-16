# Examples

Real-world usage patterns and examples for HyperFixi.

## Table of Contents

- [Basic DOM Manipulation](#basic-dom-manipulation)
- [Event Handling](#event-handling)
- [Form Processing](#form-processing)
- [Animation and Timing](#animation-and-timing)
- [Modal Dialogs](#modal-dialogs)
- [Dynamic Lists](#dynamic-lists)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Performance Patterns](#performance-patterns)

## Basic DOM Manipulation

### Show/Hide Elements

```typescript
import { hyperscript } from 'hyperfixi';

const button = document.getElementById('toggleButton');
const panel = document.getElementById('panel');

button?.addEventListener('click', async () => {
  const context = hyperscript.createContext(panel);

  // Simple toggle logic
  if (panel?.style.display === 'none') {
    await hyperscript.eval('show me', context);
  } else {
    await hyperscript.eval('hide me', context);
  }
});
```

### Class Management

```typescript
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', async () => {
    // Remove active class from all tabs
    for (const t of tabs) {
      const context = hyperscript.createContext(t);
      await hyperscript.eval('remove ".active"', context);
    }

    // Add active class to clicked tab
    const activeContext = hyperscript.createContext(tab);
    await hyperscript.eval('add ".active"', activeContext);

    // Show corresponding content
    const contentContext = hyperscript.createContext(contents[index]);
    await hyperscript.eval('show me', contentContext);
  });
});
```

### Content Updates

```typescript
const counter = { value: 0 };
const display = document.getElementById('counter-display');

function updateCounter() {
  const context = hyperscript.createContext(display);
  context.variables?.set('count', counter.value);

  hyperscript.eval('put count into me', context);
}

document.getElementById('increment')?.addEventListener('click', () => {
  counter.value++;
  updateCounter();
});
```

## Event Handling

### Click Handlers with State

```typescript
const loadingButton = document.getElementById('loadButton');

loadingButton?.addEventListener('click', async () => {
  const context = hyperscript.createContext(loadingButton);

  try {
    // Show loading state
    await hyperscript.eval('add ".loading"', context);
    await hyperscript.eval('put "Loading..." into me', context);

    // Simulate async operation
    await hyperscript.eval('wait 2s', context);

    // Show success state
    await hyperscript.eval('remove ".loading"', context);
    await hyperscript.eval('add ".success"', context);
    await hyperscript.eval('put "Success!" into me', context);

    // Reset after delay
    await hyperscript.eval('wait 1s', context);
    await hyperscript.eval('remove ".success"', context);
    await hyperscript.eval('put "Load Data" into me', context);
  } catch (error) {
    // Handle error state
    await hyperscript.eval('remove ".loading"', context);
    await hyperscript.eval('add ".error"', context);
    await hyperscript.eval('put "Error!" into me', context);
  }
});
```

### Keyboard Event Handling

```typescript
const searchInput = document.getElementById('search') as HTMLInputElement;
const resultsPanel = document.getElementById('results');

searchInput?.addEventListener('keydown', async event => {
  const context = hyperscript.createContext(searchInput);

  if (event.key === 'Enter') {
    await hyperscript.eval('add ".searching"', context);

    // Perform search
    const query = searchInput.value;
    const results = await performSearch(query);

    // Update results
    if (resultsPanel) {
      const resultsContext = hyperscript.createContext(resultsPanel);
      resultsContext.variables?.set('resultCount', results.length);
      await hyperscript.eval('show me', resultsContext);
    }

    await hyperscript.eval('remove ".searching"', context);
  }

  if (event.key === 'Escape') {
    await hyperscript.eval('put "" into me', context);
    if (resultsPanel) {
      const resultsContext = hyperscript.createContext(resultsPanel);
      await hyperscript.eval('hide me', resultsContext);
    }
  }
});
```

## Form Processing

### Form Validation

```typescript
const form = document.getElementById('signupForm') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const submitButton = document.getElementById('submit') as HTMLButtonElement;

emailInput?.addEventListener('blur', async () => {
  const context = hyperscript.createContext(emailInput);
  const email = emailInput.value;

  if (!email.includes('@')) {
    await hyperscript.eval('add ".error"', context);

    // Show error message
    const errorDiv = document.getElementById('email-error');
    if (errorDiv) {
      const errorContext = hyperscript.createContext(errorDiv);
      await hyperscript.eval('put "Please enter a valid email" into me', errorContext);
      await hyperscript.eval('show me', errorContext);
    }
  } else {
    await hyperscript.eval('remove ".error"', context);
    await hyperscript.eval('add ".valid"', context);

    // Hide error message
    const errorDiv = document.getElementById('email-error');
    if (errorDiv) {
      const errorContext = hyperscript.createContext(errorDiv);
      await hyperscript.eval('hide me', errorContext);
    }
  }
});

form?.addEventListener('submit', async event => {
  event.preventDefault();

  const context = hyperscript.createContext(submitButton);

  // Disable button and show loading
  await hyperscript.eval('add ".loading"', context);
  await hyperscript.eval('put "Submitting..." into me', context);

  try {
    // Collect form data using hyperscript
    const formContext = hyperscript.createContext(form);
    const formData = await hyperscript.eval('me as Values', formContext);

    // Submit data
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      await hyperscript.eval('remove ".loading"', context);
      await hyperscript.eval('add ".success"', context);
      await hyperscript.eval('put "Success!" into me', context);
    } else {
      throw new Error('Submission failed');
    }
  } catch (error) {
    await hyperscript.eval('remove ".loading"', context);
    await hyperscript.eval('add ".error"', context);
    await hyperscript.eval('put "Error occurred" into me', context);
  }
});
```

## Animation and Timing

### Fade In/Out Animation

```typescript
async function fadeIn(element: HTMLElement) {
  const context = hyperscript.createContext(element);

  // Start invisible
  element.style.opacity = '0';
  await hyperscript.eval('show me', context);

  // Animate opacity
  for (let opacity = 0; opacity <= 1; opacity += 0.1) {
    element.style.opacity = opacity.toString();
    await hyperscript.eval('wait 50ms', context);
  }
}

async function fadeOut(element: HTMLElement) {
  const context = hyperscript.createContext(element);

  // Animate opacity down
  for (let opacity = 1; opacity >= 0; opacity -= 0.1) {
    element.style.opacity = opacity.toString();
    await hyperscript.eval('wait 50ms', context);
  }

  // Hide element
  await hyperscript.eval('hide me', context);
}
```

### Staggered Animations

```typescript
const items = document.querySelectorAll('.animate-item');

async function staggerIn() {
  for (const [index, item] of items.entries()) {
    const context = hyperscript.createContext(item);

    // Wait based on index for stagger effect
    context.variables?.set('delay', index * 100);
    await hyperscript.eval('wait delay', context);

    // Animate in
    await hyperscript.eval('add ".visible"', context);
  }
}
```

### Typing Effect

```typescript
async function typeText(element: HTMLElement, text: string) {
  const context = hyperscript.createContext(element);

  // Clear existing text
  await hyperscript.eval('put "" into me', context);

  // Type each character
  for (let i = 0; i <= text.length; i++) {
    const partial = text.substring(0, i);
    context.variables?.set('text', partial);
    await hyperscript.eval('put text into me', context);
    await hyperscript.eval('wait 100ms', context);
  }
}
```

## Modal Dialogs

### Simple Modal

```typescript
class Modal {
  private modal: HTMLElement;
  private overlay: HTMLElement;

  constructor(modalId: string) {
    this.modal = document.getElementById(modalId)!;
    this.overlay = document.getElementById('modal-overlay')!;

    this.setupEventHandlers();
  }

  async show() {
    const modalContext = hyperscript.createContext(this.modal);
    const overlayContext = hyperscript.createContext(this.overlay);

    await hyperscript.eval('show me', overlayContext);
    await hyperscript.eval('wait 10ms', modalContext); // Allow overlay to render
    await hyperscript.eval('show me', modalContext);
    await hyperscript.eval('add ".visible"', modalContext);
  }

  async hide() {
    const modalContext = hyperscript.createContext(this.modal);
    const overlayContext = hyperscript.createContext(this.overlay);

    await hyperscript.eval('remove ".visible"', modalContext);
    await hyperscript.eval('wait 300ms', modalContext); // Wait for animation
    await hyperscript.eval('hide me', modalContext);
    await hyperscript.eval('hide me', overlayContext);
  }

  private setupEventHandlers() {
    // Close on overlay click
    this.overlay.addEventListener('click', event => {
      if (event.target === this.overlay) {
        this.hide();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.hide();
      }
    });

    // Close button
    const closeButton = this.modal.querySelector('.close-button');
    closeButton?.addEventListener('click', () => this.hide());
  }
}

// Usage
const confirmModal = new Modal('confirm-modal');

document.getElementById('show-modal')?.addEventListener('click', () => {
  confirmModal.show();
});
```

## Dynamic Lists

### Todo List

```typescript
class TodoList {
  private list: HTMLElement;
  private input: HTMLInputElement;
  private todos: Array<{ id: number; text: string; completed: boolean }> = [];
  private nextId = 1;

  constructor() {
    this.list = document.getElementById('todo-list')!;
    this.input = document.getElementById('todo-input') as HTMLInputElement;

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    document.getElementById('add-todo')?.addEventListener('click', () => {
      this.addTodo();
    });

    this.input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.addTodo();
      }
    });
  }

  async addTodo() {
    const text = this.input.value.trim();
    if (!text) return;

    const todo = { id: this.nextId++, text, completed: false };
    this.todos.push(todo);

    await this.renderTodo(todo);

    // Clear input
    const inputContext = hyperscript.createContext(this.input);
    await hyperscript.eval('put "" into me', inputContext);
  }

  async renderTodo(todo: { id: number; text: string; completed: boolean }) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id.toString();

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;

    const span = document.createElement('span');
    span.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // Add event handlers with hyperscript
    checkbox.addEventListener('change', async () => {
      const context = hyperscript.createContext(li);

      if (checkbox.checked) {
        await hyperscript.eval('add ".completed"', context);
      } else {
        await hyperscript.eval('remove ".completed"', context);
      }
    });

    deleteBtn.addEventListener('click', async () => {
      const context = hyperscript.createContext(li);

      // Animate out
      await hyperscript.eval('add ".removing"', context);
      await hyperscript.eval('wait 300ms', context);

      // Remove from DOM and data
      li.remove();
      this.todos = this.todos.filter(t => t.id !== todo.id);
    });

    // Add to list with animation
    const listContext = hyperscript.createContext(this.list);
    this.list.appendChild(li);

    const itemContext = hyperscript.createContext(li);
    await hyperscript.eval('add ".new"', itemContext);
    await hyperscript.eval('wait 10ms', itemContext); // Allow DOM update
    await hyperscript.eval('add ".visible"', itemContext);
  }
}

// Initialize
new TodoList();
```

## State Management

### Simple State Store

```typescript
class StateStore {
  private state: Record<string, any> = {};
  private subscribers: Array<(state: any) => void> = [];

  setState(updates: Record<string, any>) {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  getState() {
    return { ...this.state };
  }

  subscribe(callback: (state: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.getState()));
  }
}

// Usage with HyperFixi
const store = new StateStore();

// Counter component
const counterDisplay = document.getElementById('counter');
const incrementBtn = document.getElementById('increment');

store.subscribe(async state => {
  if (counterDisplay) {
    const context = hyperscript.createContext(counterDisplay);
    context.variables?.set('count', state.count || 0);
    await hyperscript.eval('put count into me', context);
  }
});

incrementBtn?.addEventListener('click', () => {
  const currentState = store.getState();
  store.setState({ count: (currentState.count || 0) + 1 });
});

// Theme component
const themeToggle = document.getElementById('theme-toggle');

store.subscribe(async state => {
  const body = document.body;
  const context = hyperscript.createContext(body);

  if (state.theme === 'dark') {
    await hyperscript.eval('add ".dark-theme"', context);
    await hyperscript.eval('remove ".light-theme"', context);
  } else {
    await hyperscript.eval('add ".light-theme"', context);
    await hyperscript.eval('remove ".dark-theme"', context);
  }
});

themeToggle?.addEventListener('click', () => {
  const currentState = store.getState();
  const newTheme = currentState.theme === 'dark' ? 'light' : 'dark';
  store.setState({ theme: newTheme });
});
```

## Error Handling

### Graceful Error Recovery

```typescript
async function safeExecute(code: string, context: any, fallbackAction?: () => void) {
  try {
    return await hyperscript.eval(code, context);
  } catch (error) {
    console.error('HyperFixi execution failed:', error);

    // Show error state
    const errorContext = hyperscript.createContext(context.me);
    await hyperscript.eval('add ".error"', errorContext);

    // Execute fallback if provided
    if (fallbackAction) {
      fallbackAction();
    }

    // Auto-recover after delay
    setTimeout(async () => {
      await hyperscript.eval('remove ".error"', errorContext);
    }, 3000);
  }
}

// Usage
const button = document.getElementById('risky-button');
button?.addEventListener('click', async () => {
  const context = hyperscript.createContext(button);

  await safeExecute('add ".processing"', context, () => console.log('Fallback: Processing failed'));
});
```

### Validation with Error Messages

```typescript
async function validateAndShow(element: HTMLElement, condition: boolean, errorMessage: string) {
  const context = hyperscript.createContext(element);

  if (!condition) {
    await hyperscript.eval('add ".invalid"', context);

    // Show error message
    const errorDiv = element.nextElementSibling as HTMLElement;
    if (errorDiv?.classList.contains('error-message')) {
      const errorContext = hyperscript.createContext(errorDiv);
      errorContext.variables?.set('message', errorMessage);
      await hyperscript.eval('put message into me', errorContext);
      await hyperscript.eval('show me', errorContext);
    }

    return false;
  } else {
    await hyperscript.eval('remove ".invalid"', context);
    await hyperscript.eval('add ".valid"', context);

    // Hide error message
    const errorDiv = element.nextElementSibling as HTMLElement;
    if (errorDiv?.classList.contains('error-message')) {
      const errorContext = hyperscript.createContext(errorDiv);
      await hyperscript.eval('hide me', errorContext);
    }

    return true;
  }
}
```

## Performance Patterns

### Compilation Caching

```typescript
class HyperscriptCache {
  private cache = new Map<string, any>();

  async run(code: string, context: any) {
    let compiled = this.cache.get(code);

    if (!compiled) {
      compiled = hyperscript.compileSync(code);
      if (compiled.success) {
        this.cache.set(code, compiled);
      }
    }

    if (compiled.success) {
      return await hyperscript.execute(compiled.ast, context);
    } else {
      throw new Error('Compilation failed: ' + compiled.errors[0]?.message);
    }
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const cache = new HyperscriptCache();

// Repeated executions will use cached compilation
await cache.run('hide me', context1);
await cache.run('hide me', context2);
await cache.run('hide me', context3);
```

### Batch Operations

```typescript
async function batchUpdate(elements: HTMLElement[], operation: string) {
  const promises = elements.map(async element => {
    const context = hyperscript.createContext(element);
    return hyperscript.eval(operation, context);
  });

  await Promise.all(promises);
}

// Usage
const cards = Array.from(document.querySelectorAll('.card')) as HTMLElement[];
await batchUpdate(cards, 'add ".loading"');

// Simulate async work
await new Promise(resolve => setTimeout(resolve, 2000));

await batchUpdate(cards, 'remove ".loading"');
await batchUpdate(cards, 'add ".loaded"');
```

### Debounced Execution

```typescript
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced search
const searchInput = document.getElementById('search') as HTMLInputElement;
const searchResults = document.getElementById('search-results');

const debouncedSearch = debounce(async (query: string) => {
  if (searchResults) {
    const context = hyperscript.createContext(searchResults);

    if (query.length > 2) {
      context.variables?.set('query', query);
      await hyperscript.eval('add ".searching"', context);

      // Perform search
      const results = await performSearch(query);

      context.variables?.set('count', results.length);
      await hyperscript.eval('remove ".searching"', context);
      await hyperscript.eval('add ".has-results"', context);
    } else {
      await hyperscript.eval('remove ".searching"', context);
      await hyperscript.eval('remove ".has-results"', context);
    }
  }
}, 300);

searchInput?.addEventListener('input', event => {
  debouncedSearch((event.target as HTMLInputElement).value);
});
```

---

These examples demonstrate real-world usage patterns for HyperFixi. For more advanced scenarios and integration patterns, see the [Advanced Guide](./ADVANCED.md).
