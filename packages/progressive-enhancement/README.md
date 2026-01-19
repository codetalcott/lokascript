# Progressive Enhancement for LokaScript

A comprehensive progressive enhancement system that detects browser capabilities and applies appropriate enhancements based on what the browser supports. This package provides capability detection, enhancement levels, and an intelligent system for applying progressive enhancements to LokaScript applications.

## Features

- **🔍 Capability Detection** - Detect browser capabilities and assign enhancement levels
- **📊 Enhancement Levels** - Four levels from basic to cutting-edge with appropriate features
- **🎯 Smart Enhancement** - Apply enhancements based on detected capabilities
- **♿ Accessibility First** - Respect user preferences for reduced motion, high contrast, etc.
- **⚡ Performance Optimized** - Lazy loading, caching, and efficient capability detection
- **🧪 TypeScript Support** - Full type definitions with strict typing
- **📱 Mobile Friendly** - Touch gesture support and responsive enhancements

## Installation

```bash
npm install @lokascript/progressive-enhancement
# or
yarn add @lokascript/progressive-enhancement
# or
pnpm add @lokascript/progressive-enhancement
```

## Quick Start

### Auto-Enhancement

The easiest way to get started is with auto-enhancement:

```typescript
import { autoEnhance } from '@lokascript/progressive-enhancement';

// Auto-enhance all elements with data-enhance attribute
autoEnhance();

// Custom configuration
autoEnhance({
  selector: '[data-interactive]',
  strategy: 'aggressive',
  templateVars: { userId: '123' },
});
```

```html
<!-- Elements will be automatically enhanced based on browser capabilities -->
<button data-enhance>Click me</button>
<form data-enhance data-validate>
  <input type="email" required />
  <button type="submit">Submit</button>
</form>
```

### Manual Enhancement

For more control, use the manual enhancement API:

```typescript
import {
  enhance,
  enhanceElement,
  initProgressiveEnhancement,
} from '@lokascript/progressive-enhancement';

// Initialize the system
await initProgressiveEnhancement();

// Enhance specific elements
const results = await enhance('[data-interactive]', {
  userId: '123',
  theme: 'dark',
});

// Enhance a single element
const element = document.querySelector('#my-button');
const result = await enhanceElement(element, { userId: '123' });

console.log(`Enhanced to ${result.level} level with ${result.enhancements.length} enhancements`);
```

## Enhancement Levels

The system provides four capability levels with progressively more advanced features:

### Basic Level

- ✅ JavaScript enabled
- 🔧 Basic form validation
- 🔄 Simple show/hide toggles
- 🧭 Basic navigation helpers

### Enhanced Level

- ✅ ES6 support + Promises
- 🎨 CSS transitions and animations
- 📝 Advanced form validation
- 👁️ Intersection Observer support

### Modern Level

- ✅ Web Components + Fetch API
- 🧩 Custom web components
- 🖼️ Lazy loading with Intersection Observer
- 🎯 Advanced interaction patterns

### Cutting-Edge Level

- ✅ Service Workers + Web Workers
- ⚡ Performance optimizations
- 🎮 Advanced gesture handling
- 🚀 Intelligent resource preloading

## Capability Detection

### Detect Capabilities

```typescript
import { detectCapabilities, detectUserPreferences } from '@lokascript/progressive-enhancement';

// Detect browser capabilities
const capabilities = await detectCapabilities({
  timeout: 2000,
  enablePerformanceMetrics: true,
  cacheResults: true,
  customTests: {
    customFeature: () => 'customAPI' in window,
    advancedFeature: async () => {
      // Async capability test
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 100);
      });
    },
  },
});

console.log(`Capability level: ${capabilities.level}`);
console.log(`Capability score: ${capabilities.score}/100`);
console.log('Features:', capabilities.features);

// Detect user preferences
const preferences = detectUserPreferences();
console.log('Prefers reduced motion:', preferences.reduceMotion);
console.log('Prefers basic experience:', preferences.preferBasic);
```

### Capability Report

```typescript
interface CapabilityReport {
  level: 'basic' | 'enhanced' | 'modern' | 'cutting-edge';
  score: number; // 0-100
  capabilities: Record<string, Capability>;
  userAgent: string;
  timestamp: number;
  features: {
    javascript: boolean;
    es6: boolean;
    modules: boolean;
    webComponents: boolean;
    intersectionObserver: boolean;
    mutationObserver: boolean;
    fetchAPI: boolean;
    promises: boolean;
    asyncAwait: boolean;
    cssGrid: boolean;
    cssCustomProperties: boolean;
    webAnimations: boolean;
    serviceWorker: boolean;
    webWorkers: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
  };
}
```

## Progressive Enhancer

### Create and Configure

```typescript
import { ProgressiveEnhancer } from '@lokascript/progressive-enhancement';

const enhancer = new ProgressiveEnhancer({
  detector: {
    timeout: 2000,
    enablePerformanceMetrics: true,
    cacheResults: true,
  },
  strategy: {
    aggressive: false,
    fallbackTimeout: 3000,
    lazyLoad: true,
    progressivelyEnhance: true,
    respectUserPreferences: true,
  },
  customEnhancements: [
    {
      id: 'custom-feature',
      name: 'Custom Feature',
      level: 'enhanced',
      requires: ['javascript', 'localStorage'],
      script: `
        // Custom enhancement script
        console.log('Custom enhancement applied');
      `,
      priority: 1,
    },
  ],
});

// Initialize and start enhancing
await enhancer.initialize();
const result = await enhancer.enhanceDocument();
```

### Enhancement Strategies

```typescript
// Conservative strategy - safe, respects all user preferences
const conservative = {
  aggressive: false,
  fallbackTimeout: 5000,
  lazyLoad: true,
  progressivelyEnhance: true,
  respectUserPreferences: true,
};

// Balanced strategy - good performance with user respect
const balanced = {
  aggressive: false,
  fallbackTimeout: 3000,
  lazyLoad: true,
  progressivelyEnhance: true,
  respectUserPreferences: true,
};

// Aggressive strategy - maximum features, minimal delay
const aggressive = {
  aggressive: true,
  fallbackTimeout: 1000,
  lazyLoad: false,
  progressivelyEnhance: true,
  respectUserPreferences: false,
};
```

## Template Variables

Use template variables in your enhancements for dynamic behavior:

```typescript
import { enhance } from '@lokascript/progressive-enhancement';

// Template variables are substituted before enhancement
const templateVars = {
  userId: '123',
  apiEndpoint: '/api/v1',
  theme: 'dark',
};

await enhance('[data-interactive]', templateVars);
```

```html
<!-- Template variables in data attributes -->
<button
  data-enhance
  data-action="fetch"
  data-url="{{apiEndpoint}}/users/{{userId}}"
  data-theme="{{theme}}"
>
  Load User Data
</button>
```

## Custom Enhancements

Define your own enhancements for specific capability levels:

```typescript
import type { Enhancement } from '@lokascript/progressive-enhancement';

const customEnhancements: Enhancement[] = [
  {
    id: 'advanced-charts',
    name: 'Advanced Chart Visualization',
    level: 'modern',
    requires: ['javascript', 'webComponents', 'fetchAPI'],
    script: `
      // Advanced chart component
      class AdvancedChart extends HTMLElement {
        connectedCallback() {
          this.loadChartData();
        }
        
        async loadChartData() {
          const response = await fetch(this.getAttribute('data-url'));
          const data = await response.json();
          this.renderChart(data);
        }
        
        renderChart(data) {
          // Chart rendering logic
          console.log('Rendering chart with data:', data);
        }
      }
      
      customElements.define('advanced-chart', AdvancedChart);
    `,
    styles: `
      advanced-chart {
        display: block;
        min-height: 300px;
        background: #f5f5f5;
        border-radius: 8px;
        padding: 1rem;
      }
    `,
    priority: 1,
    conditions: [
      { feature: 'webComponents', operator: 'exists' },
      { feature: 'fetchAPI', operator: 'exists' },
    ],
  },

  {
    id: 'touch-gestures',
    name: 'Touch Gesture Support',
    level: 'cutting-edge',
    requires: ['javascript', 'webAnimations'],
    script: `
      // Touch gesture enhancement
      class TouchGestureHandler {
        constructor(element) {
          this.element = element;
          this.setupGestures();
        }
        
        setupGestures() {
          let startX, startY;
          
          this.element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
          });
          
          this.element.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              if (deltaX > 50) this.onSwipeLeft();
              else if (deltaX < -50) this.onSwipeRight();
            }
          });
        }
        
        onSwipeLeft() {
          console.log('Swiped left');
          // Handle swipe left
        }
        
        onSwipeRight() {
          console.log('Swiped right');
          // Handle swipe right
        }
      }
      
      // Apply to elements with data-gestures
      document.querySelectorAll('[data-gestures]').forEach(el => {
        new TouchGestureHandler(el);
      });
    `,
    priority: 2,
  },
];

// Use custom enhancements
const enhancer = new ProgressiveEnhancer({
  customEnhancements,
});
```

## Performance Optimization

### Lazy Loading

```typescript
// Enable lazy loading for better performance
const config = {
  strategy: {
    lazyLoad: true,
    fallbackTimeout: 3000,
  },
};

// Scripts will be loaded using requestIdleCallback
await enhance('[data-enhance]', templateVars, config);
```

### Caching

```typescript
import {
  detectCapabilities,
  clearCapabilityCache,
  getCachedCapabilities,
} from '@lokascript/progressive-enhancement';

// Capabilities are cached by default
const capabilities1 = await detectCapabilities({ cacheResults: true });
const capabilities2 = await detectCapabilities({ cacheResults: true });
// capabilities1 === capabilities2 (same object)

// Check cached results
const cached = getCachedCapabilities();
if (cached) {
  console.log('Using cached capabilities from', new Date(cached.timestamp));
}

// Clear cache when needed
clearCapabilityCache();
```

### Performance Monitoring

```typescript
const result = await enhance(
  '[data-enhance]',
  {},
  {
    detector: {
      enablePerformanceMetrics: true,
    },
  }
);

console.log('Performance metrics:', result.performance);
// {
//   detectionTime: 45,     // ms to detect capabilities
//   enhancementTime: 23,   // ms to apply enhancements
//   totalTime: 68          // total enhancement time
// }
```

## Error Handling

```typescript
import { enhance } from '@lokascript/progressive-enhancement';

try {
  const results = await enhance('[data-enhance]', templateVars);

  for (const result of results) {
    if (result.warnings.length > 0) {
      console.warn('Enhancement warnings:', result.warnings);
    }

    console.log(`Enhanced to ${result.level} level`);
    console.log(
      'Applied enhancements:',
      result.enhancements.map(e => e.name)
    );
    console.log(
      'Available fallbacks:',
      result.fallbacks.map(f => f.name)
    );
  }
} catch (error) {
  console.error('Enhancement failed:', error);
  // Graceful degradation - the page should still work
}
```

## Testing

The package includes comprehensive test coverage:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Your Enhancements

```typescript
import { describe, it, expect, vi } from 'vitest';
import { detectCapabilities, enhance } from '@lokascript/progressive-enhancement';

describe('Custom Enhancement', () => {
  it('should apply enhancement when capabilities are met', async () => {
    // Mock capabilities
    vi.mocked(detectCapabilities).mockResolvedValue({
      level: 'modern',
      score: 85,
      capabilities: {
        javascript: { name: 'javascript', supported: true },
        webComponents: { name: 'webComponents', supported: true },
      },
      // ... other properties
    });

    const element = document.createElement('div');
    element.setAttribute('data-enhance', 'true');
    document.body.appendChild(element);

    const results = await enhance('[data-enhance]');

    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('modern');
    expect(results[0].enhancements.length).toBeGreaterThan(0);
  });
});
```

## TypeScript Support

The package provides comprehensive TypeScript definitions:

```typescript
import type {
  CapabilityLevel,
  CapabilityReport,
  Enhancement,
  EnhancementResult,
  EnhancementStrategy,
  UserPreferences,
  DetectorConfig,
  EnhancerConfig,
} from '@lokascript/progressive-enhancement';

// Type-safe configuration
const config: EnhancerConfig = {
  strategy: {
    aggressive: false,
    fallbackTimeout: 3000,
    lazyLoad: true,
    progressivelyEnhance: true,
    respectUserPreferences: true,
  },
  detector: {
    timeout: 2000,
    enablePerformanceMetrics: true,
    cacheResults: true,
  },
};
```

## Browser Support

- **Basic Level**: All browsers with JavaScript support
- **Enhanced Level**: Modern browsers with ES6+ support
- **Modern Level**: Browsers with Web Components and modern APIs
- **Cutting-Edge Level**: Latest browsers with Service Workers and advanced APIs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Build the package: `npm run build`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
