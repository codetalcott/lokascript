# Behaviors Pattern Documentation

LokaScript behaviors provide reusable, htmx-like patterns that can be installed on elements using the `install` command. This document describes the behavior pattern architecture and how to create your own behaviors.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Creating a New Behavior](#creating-a-new-behavior)
- [Registering Behaviors](#registering-behaviors)
- [Available Behaviors](#available-behaviors)
- [Usage Examples](#usage-examples)

## Architecture Overview

A LokaScript behavior follows a consistent pattern with five core components:

### 1. Configuration Interface

Defines the behavior's configuration options:

```typescript
export interface MyBehaviorConfig {
  /** Required configuration */
  target: string | HTMLElement;

  /** Optional configuration with defaults */
  strategy?: SwapStrategy;

  /** Lifecycle callbacks */
  onBeforeFetch?: (url: string) => void | Promise<void>;
  onAfterSwap?: (content: string) => void | Promise<void>;
  onError?: (error: Error) => void;
}
```

### 2. Instance Interface

Defines the behavior instance API (returned to users):

```typescript
export interface MyBehaviorInstance {
  /** Destroy the behavior and cleanup resources */
  destroy: () => void;

  /** Access to current configuration */
  config: MyBehaviorConfig;

  /** Additional methods for programmatic control */
  refresh?: () => Promise<void>;
  update?: (newConfig: Partial<MyBehaviorConfig>) => void;
}
```

### 3. Factory Function

Creates and initializes the behavior instance:

```typescript
export function createMyBehavior(config: MyBehaviorConfig): MyBehaviorInstance {
  const { target, strategy = 'morph', onBeforeFetch, onAfterSwap, onError } = config;

  // Resolve target element
  const resolveTarget = (): HTMLElement | null => {
    if (typeof target === 'string') {
      const element = document.querySelector(target);
      return isHTMLElement(element) ? (element as HTMLElement) : null;
    }
    return isHTMLElement(target) ? target : null;
  };

  // Event handler
  const handleEvent = async (event: Event) => {
    const targetElement = resolveTarget();
    if (!targetElement) {
      console.warn(`MyBehavior: target "${target}" not found`);
      return;
    }

    try {
      // Before callback
      if (onBeforeFetch) {
        await onBeforeFetch(/* ... */);
      }

      // Perform behavior logic
      // ...

      // After callback
      if (onAfterSwap) {
        await onAfterSwap(/* ... */);
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('MyBehavior error:', error);
      }
    }
  };

  // Register event listeners
  window.addEventListener('myevent', handleEvent);

  // Return instance with cleanup
  return {
    destroy: () => {
      window.removeEventListener('myevent', handleEvent);
    },
    config,
  };
}
```

### 4. Behavior Object

Defines how the runtime initializes and destroys the behavior:

```typescript
export const MyBehaviorObject = {
  name: 'MyBehavior',

  /**
   * Initialize behavior on an element
   */
  init(element: HTMLElement, params: Record<string, unknown> = {}): MyBehaviorInstance {
    const config: MyBehaviorConfig = {
      target: (params.target as string | HTMLElement) || element,
      strategy: (params.strategy as SwapStrategy) || 'morph',
      // Map params to config...
    };

    return createMyBehavior(config);
  },

  /**
   * Destroy behavior instance
   */
  destroy(instance: MyBehaviorInstance): void {
    instance.destroy();
  },
};
```

### 5. Registration Function

Registers the behavior with a runtime or registry:

```typescript
export function registerMyBehavior(registry: Map<string, unknown> | any): void {
  if (registry instanceof Map) {
    registry.set('MyBehavior', MyBehaviorObject);
  } else if (registry && typeof registry.set === 'function') {
    registry.set('MyBehavior', MyBehaviorObject);
  } else if (registry && typeof registry === 'object') {
    registry['MyBehavior'] = MyBehaviorObject;
  }
}
```

## Creating a New Behavior

Follow these steps to create a new behavior:

### Step 1: Define Types

Create a new file `src/behaviors/my-behavior.ts`:

```typescript
/**
 * MyBehavior - Description of what it does
 *
 * Features:
 * - Feature 1
 * - Feature 2
 *
 * Usage in hyperscript:
 *   install MyBehavior(target: "#container")
 *
 * Programmatic usage:
 *   import { createMyBehavior } from '@lokascript/core/behaviors';
 *   const instance = createMyBehavior({ target: '#container' });
 */

export interface MyBehaviorConfig {
  target: string | HTMLElement;
  option1?: string;
  option2?: number;
}

export interface MyBehaviorInstance {
  destroy: () => void;
  config: MyBehaviorConfig;
}
```

### Step 2: Implement Factory Function

```typescript
export function createMyBehavior(config: MyBehaviorConfig): MyBehaviorInstance {
  const { target, option1 = 'default', option2 = 42 } = config;

  // Resolve target element
  const resolveTarget = (): HTMLElement | null => {
    if (typeof target === 'string') {
      const element = document.querySelector(target);
      return isHTMLElement(element) ? (element as HTMLElement) : null;
    }
    return isHTMLElement(target) ? target : null;
  };

  // Event handlers
  const handleEvent = (event: Event) => {
    const targetElement = resolveTarget();
    if (!targetElement) return;

    // Behavior logic...
  };

  // Setup
  const targetElement = resolveTarget();
  if (targetElement) {
    targetElement.addEventListener('click', handleEvent);
  }

  // Return instance
  return {
    destroy: () => {
      const targetElement = resolveTarget();
      if (targetElement) {
        targetElement.removeEventListener('click', handleEvent);
      }
    },
    config,
  };
}
```

### Step 3: Create Behavior Object

```typescript
export const MyBehaviorObject = {
  name: 'MyBehavior',

  init(element: HTMLElement, params: Record<string, unknown> = {}): MyBehaviorInstance {
    const config: MyBehaviorConfig = {
      target: (params.target as string | HTMLElement) || element,
      option1: params.option1 as string | undefined,
      option2: params.option2 as number | undefined,
    };

    return createMyBehavior(config);
  },

  destroy(instance: MyBehaviorInstance): void {
    instance.destroy();
  },
};
```

### Step 4: Add Registration Function

```typescript
export function registerMyBehavior(registry: Map<string, unknown> | any): void {
  if (registry instanceof Map) {
    registry.set('MyBehavior', MyBehaviorObject);
  } else if (registry && typeof registry.set === 'function') {
    registry.set('MyBehavior', MyBehaviorObject);
  } else if (registry && typeof registry === 'object') {
    registry['MyBehavior'] = MyBehaviorObject;
  }
}
```

### Step 5: Export from Index

Add to `src/behaviors/index.ts`:

```typescript
export {
  createMyBehavior,
  registerMyBehavior,
  MyBehaviorObject,
  type MyBehaviorConfig,
  type MyBehaviorInstance,
} from './my-behavior';
```

## Registering Behaviors

Behaviors must be registered with the runtime before they can be used in hyperscript:

### Method 1: Register Individual Behavior

```typescript
import { createRuntime } from '@lokascript/core';
import { registerMyBehavior } from '@lokascript/core/behaviors';

const runtime = createRuntime();
const registry = runtime.getBehaviorRegistry();
registerMyBehavior(registry);
```

### Method 2: Register All Behaviors

```typescript
import { createRuntime } from '@lokascript/core';
import { registerAllBehaviors } from '@lokascript/core/behaviors';

const runtime = createRuntime();
const registry = runtime.getBehaviorRegistry();
registerAllBehaviors(registry);
```

### Method 3: Register at Runtime Creation

```typescript
import { createRuntime } from '@lokascript/core';
import { MyBehaviorObject } from '@lokascript/core/behaviors';

const runtime = createRuntime({
  behaviors: {
    MyBehavior: MyBehaviorObject,
  },
});
```

## Available Behaviors

### HistorySwap

Automatically re-fetches content when the user navigates back/forward in browser history.

**Configuration:**

```typescript
interface HistorySwapConfig {
  target: string | HTMLElement; // Target element for swapping
  strategy?: SwapStrategy; // Swap strategy (default: 'morph')
  useViewTransition?: boolean; // Use View Transitions API
  fetchOptions?: RequestInit; // Custom fetch options
  transformUrl?: (url: string) => string; // URL transformer
  onBeforeFetch?: (url: string) => void | Promise<void>;
  onAfterSwap?: (url: string, content: string) => void | Promise<void>;
  onError?: (error: Error, url: string) => void;
}
```

**Features:**

- Listens to `popstate` events (browser back/forward)
- Re-fetches content from current URL
- Swaps content using specified strategy
- Supports View Transitions API
- Adds `hx-swapping` class during fetch
- Dispatches `lokascript:historyswap` event after swap

**Usage:**

```html
<!-- Basic usage -->
<div id="content" _="install HistorySwap(target: '#content')">Content here...</div>

<!-- With custom swap strategy -->
<div _="install HistorySwap(target: '#app', strategy: 'innerHTML')">App content...</div>

<!-- With View Transitions -->
<div _="install HistorySwap(target: '#main', useViewTransition: true)">Main content...</div>
```

**Programmatic usage:**

```typescript
import { createHistorySwap } from '@lokascript/core/behaviors';

const historySwap = createHistorySwap({
  target: '#content',
  strategy: 'morph',
  onBeforeFetch: async url => {
    console.log('Fetching:', url);
  },
  onAfterSwap: async (url, content) => {
    console.log('Swapped:', url);
  },
});

// Cleanup when done
historySwap.destroy();
```

### Boosted

Converts regular links and forms to AJAX requests (similar to htmx `hx-boost`).

**Configuration:**

```typescript
interface BoostedConfig {
  container: HTMLElement; // Container to attach listeners
  target?: string | HTMLElement; // Target for swapping (default: body)
  linkSelector?: string; // CSS selector for links (default: 'a[href]')
  formSelector?: string; // CSS selector for forms (default: 'form')
  boostForms?: boolean; // Whether to boost forms (default: false)
  strategy?: SwapStrategy; // Swap strategy (default: 'morph')
  pushUrl?: boolean; // Push URL to history (default: true)
  useViewTransition?: boolean; // Use View Transitions API
  fetchOptions?: RequestInit; // Custom fetch options
  onBeforeFetch?: (url: string, method: string) => void | boolean | Promise<void | boolean>;
  onAfterSwap?: (url: string, content: string) => void | Promise<void>;
  onError?: (error: Error, url: string) => void;
}
```

**Features:**

- Intercepts link clicks and form submissions
- Fetches content via AJAX
- Swaps content into target element
- Pushes URL to browser history
- Handles external links normally
- Respects modifier keys (Ctrl/Cmd/Shift) for new tabs
- Skips links with `target`, `download`, or `data-no-boost` attributes
- Adds `hx-swapping` and `hx-boosting` classes during fetch
- Dispatches `lokascript:boosted` event after swap

**Usage:**

```html
<!-- Boost all links in a nav -->
<nav _="install Boosted(target: '#content')">
  <a href="/page1">Page 1</a>
  <a href="/page2">Page 2</a>
</nav>

<!-- Boost forms too -->
<div _="install Boosted(target: '#results', boostForms: true)">
  <form action="/search" method="GET">
    <input name="q" />
    <button>Search</button>
  </form>
</div>

<!-- Disable boost on specific links -->
<nav _="install Boosted(target: '#main')">
  <a href="/page1">Boosted</a>
  <a href="/page2" data-no-boost>Normal</a>
  <a href="https://external.com">External (auto-skipped)</a>
</nav>
```

**Programmatic usage:**

```typescript
import { createBoosted } from '@lokascript/core/behaviors';

const boosted = createBoosted({
  container: document.querySelector('nav'),
  target: '#content',
  boostForms: true,
  onBeforeFetch: async (url, method) => {
    console.log(`Fetching ${method} ${url}`);
    // Return false to cancel fetch
    return true;
  },
  onAfterSwap: async (url, content) => {
    console.log('Swapped:', url);
  },
});

// Manually boost a URL
await boosted.boost('/page1');

// Cleanup when done
boosted.destroy();
```

## Usage Examples

### Example 1: SPA with History Support

```html
<!DOCTYPE html>
<html>
  <head>
    <title>SPA Example</title>
  </head>
  <body>
    <nav _="install Boosted(target: '#app', boostForms: true)">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>

    <main id="app" _="install HistorySwap(target: '#app', strategy: 'morph')">
      <!-- Content swapped here -->
    </main>

    <script type="module">
      import { createRuntime } from '@lokascript/core';
      import { registerAllBehaviors } from '@lokascript/core/behaviors';

      const runtime = createRuntime();
      registerAllBehaviors(runtime.getBehaviorRegistry());
      runtime.init();
    </script>
  </body>
</html>
```

### Example 2: Dashboard with AJAX Search

```html
<div class="dashboard">
  <!-- Search form boosted -->
  <aside _="install Boosted(target: '#results', boostForms: true)">
    <form action="/search" method="GET">
      <input name="q" placeholder="Search..." />
      <button type="submit">Search</button>
    </form>
  </aside>

  <!-- Results area -->
  <main id="results">
    <!-- Search results swapped here -->
  </main>
</div>
```

### Example 3: Custom Behavior with Callbacks

```typescript
import { createBoosted } from '@lokascript/core/behaviors';

const boosted = createBoosted({
  container: document.querySelector('nav'),
  target: '#content',

  // Show loading spinner
  onBeforeFetch: async (url, method) => {
    document.querySelector('#spinner').style.display = 'block';
  },

  // Hide spinner and scroll to top
  onAfterSwap: async (url, content) => {
    document.querySelector('#spinner').style.display = 'none';
    window.scrollTo(0, 0);
  },

  // Show error message
  onError: (error, url) => {
    alert(`Failed to load ${url}: ${error.message}`);
  },
});
```

### Example 4: View Transitions

```html
<!-- Enable View Transitions for smooth animations -->
<div _="install Boosted(target: '#main', useViewTransition: true)">
  <a href="/page1">Page 1</a>
  <a href="/page2">Page 2</a>
</div>

<style>
  /* Define view transition animations */
  ::view-transition-old(root) {
    animation: fade-out 0.3s ease-out;
  }

  ::view-transition-new(root) {
    animation: fade-in 0.3s ease-in;
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
</style>
```

## Best Practices

### 1. Always Provide Destroy Method

Cleanup is critical to prevent memory leaks:

```typescript
export function createMyBehavior(config: MyBehaviorConfig): MyBehaviorInstance {
  const handlers = [];

  // Track handlers
  const handleClick = e => {
    /* ... */
  };
  handlers.push({ element: window, event: 'click', handler: handleClick });
  window.addEventListener('click', handleClick);

  return {
    destroy: () => {
      // Clean up all handlers
      handlers.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    },
    config,
  };
}
```

### 2. Use Lazy Element Resolution

Don't cache element references - resolve on demand:

```typescript
// Good: Resolves element each time
const resolveTarget = (): HTMLElement | null => {
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target;
};

const handleEvent = () => {
  const targetElement = resolveTarget(); // Fresh lookup
  if (!targetElement) return;
  // ...
};

// Bad: Element might be stale
const targetElement = document.querySelector(target);
const handleEvent = () => {
  targetElement.innerHTML = '...'; // Might fail if element removed
};
```

### 3. Provide Lifecycle Callbacks

Allow users to hook into behavior lifecycle:

```typescript
export interface MyBehaviorConfig {
  onBeforeAction?: () => void | Promise<void>;
  onAfterAction?: (result: any) => void | Promise<void>;
  onError?: (error: Error) => void;
}
```

### 4. Use Consistent Naming

Follow the established pattern for consistency:

- Config interface: `{BehaviorName}Config`
- Instance interface: `{BehaviorName}Instance`
- Factory function: `create{BehaviorName}`
- Behavior object: `{BehaviorName}Behavior` or `{BehaviorName}Object`
- Register function: `register{BehaviorName}`

### 5. Add CSS Classes for Styling

Add temporary classes during operations:

```typescript
const handleEvent = async () => {
  targetElement.classList.add('hx-loading');
  try {
    await performAction();
  } finally {
    targetElement.classList.remove('hx-loading');
  }
};
```

### 6. Dispatch Custom Events

Allow monitoring and debugging:

```typescript
window.dispatchEvent(
  new CustomEvent('lokascript:mybehavior', {
    detail: { url, result, config },
  })
);
```

## Related Documentation

- [Commands Documentation](./COMMANDS.md) - Command system architecture
- [Runtime Documentation](./RUNTIME.md) - Runtime and execution context
- [Swap Strategies](./commands/dom/swap.ts) - Available swap strategies
- [Morph Adapter](./lib/morph-adapter.ts) - DOM morphing implementation
