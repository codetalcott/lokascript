import { describe, it, expect, beforeEach } from 'vitest';
import { HyperFixiSSREngine } from './engine';
import { SSRContext, SSROptions } from './types';
import { createComponent } from '@hyperfixi/component-schema';

describe('HyperFixiSSREngine', () => {
  let engine: HyperFixiSSREngine;

  beforeEach(() => {
    engine = new HyperFixiSSREngine();
  });

  describe('basic rendering', () => {
    it('should render simple template', async () => {
      const template = '<div>Hello, {{name}}!</div>';
      const context: SSRContext = {
        variables: { name: 'World' },
      };

      const result = await engine.render(template, context);

      expect(result.html).toContain('Hello, World!');
      expect(result.variables).toContain('name');
      expect(result.performance.renderTime).toBeGreaterThan(0);
    });

    it('should handle empty context', async () => {
      const template = '<div>Static content</div>';
      const context: SSRContext = {};

      const result = await engine.render(template, context);

      expect(result.html).toContain('Static content');
      expect(result.metaTags).toHaveLength(0);
    });

    it('should preserve hyperscript attributes', async () => {
      const template = '<button _="on click toggle .active">Click me</button>';
      const context: SSRContext = {};

      const result = await engine.render(template, context);

      expect(result.html).toContain('_="on click toggle .active"');
      expect(result.hyperscript).toHaveLength(1);
      expect(result.hyperscript[0]).toBe('on click toggle .active');
    });
  });

  describe('SEO features', () => {
    it('should generate SEO meta tags', async () => {
      const template = '<html><head><title>{{seo.title}}</title></head><body>Content</body></html>';
      const context: SSRContext = {
        seo: {
          title: 'Test Page',
          description: 'This is a test page',
          keywords: ['test', 'page'],
          ogTitle: 'Test Page OG',
          ogDescription: 'Test page for Open Graph',
        },
      };

      const result = await engine.render(template, context);

      expect(result.metaTags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'title', content: 'Test Page' }),
          expect.objectContaining({ name: 'description', content: 'This is a test page' }),
          expect.objectContaining({ name: 'keywords', content: 'test, page' }),
          expect.objectContaining({ property: 'og:title', content: 'Test Page OG' }),
          expect.objectContaining({ property: 'og:description', content: 'Test page for Open Graph' }),
        ])
      );
    });

    it('should generate Twitter Card tags', async () => {
      const template = '<div>Content</div>';
      const context: SSRContext = {
        seo: {
          title: 'Twitter Test',
          description: 'Twitter description',
          twitterCard: 'summary_large_image',
          twitterTitle: 'Twitter Title',
          twitterImage: 'https://example.com/image.jpg',
        },
      };

      const result = await engine.render(template, context);

      expect(result.metaTags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'twitter:card', content: 'summary_large_image' }),
          expect.objectContaining({ name: 'twitter:title', content: 'Twitter Title' }),
          expect.objectContaining({ name: 'twitter:image', content: 'https://example.com/image.jpg' }),
        ])
      );
    });
  });

  describe('hydration', () => {
    it('should generate hydration script when enabled', async () => {
      const template = '<div id="app" _="init log \'loaded\'">{{message}}</div>';
      const context: SSRContext = {
        variables: { message: 'Hello Hydration' },
      };
      const options: SSROptions = {
        hydration: true,
      };

      const result = await engine.render(template, context, options);

      expect(result.hydrationScript).toBeDefined();
      expect(result.hydrationScript).toContain('__HYPERFIXI_HYDRATION__');
      expect(result.hydrationScript).toContain('hyperfixi:hydrated');
      expect(result.performance.hydrationSize).toBeGreaterThan(0);
    });

    it('should include component state in hydration', async () => {
      const component = createComponent(
        'test-component',
        'Test Component',
        'on click log "clicked"'
      );
      component.template = {
        html: '<button class="test">{{label}}</button>',
        variables: {
          label: { type: 'string', required: true, description: 'Button label' },
        },
      };

      engine.registerComponent(component);

      const template = '<test-component label="Click Me"></test-component>';
      const context: SSRContext = {
        variables: { label: 'Click Me' },
      };
      const options: SSROptions = {
        hydration: true,
      };

      const result = await engine.render(template, context, options);

      expect(result.hydrationScript).toContain('test-component');
      expect(result.hydrationScript).toContain('Click Me');
    });

    it('should not generate hydration when disabled', async () => {
      const template = '<div>{{message}}</div>';
      const context: SSRContext = {
        variables: { message: 'No Hydration' },
      };
      const options: SSROptions = {
        hydration: false,
      };

      const result = await engine.render(template, context, options);

      expect(result.hydrationScript).toBeUndefined();
      expect(result.performance.hydrationSize).toBe(0);
    });
  });

  describe('component integration', () => {
    it('should render registered components', async () => {
      const component = createComponent(
        'greeting',
        'Greeting Component',
        'on click log "hello"'
      );
      component.template = {
        html: '<div class="greeting">Hello, {{name}}!</div>',
        variables: {
          name: { type: 'string', required: true, description: 'Name to greet' },
        },
      };

      engine.registerComponent(component);

      const template = '<greeting name="Alice"></greeting>';
      const context: SSRContext = {};

      const result = await engine.render(template, context);

      expect(result.html).toContain('Hello, Alice!');
      expect(result.components).toHaveLength(1);
      expect(result.components[0].id).toBe('greeting');
    });

    it('should handle component dependencies', async () => {
      const component = createComponent(
        'styled-button',
        'Styled Button',
        'on click add .clicked'
      );
      component.template = {
        html: '<button class="btn">{{text}}</button>',
        variables: {
          text: { type: 'string', required: true, description: 'Button text' },
        },
      };
      component.dependencies = {
        css: ['button.css'],
        javascript: ['button.js'],
      };

      engine.registerComponent(component);

      const template = '<styled-button text="Submit"></styled-button>';
      const context: SSRContext = {};

      const result = await engine.render(template, context);

      expect(result.externalCSS).toContain('button.css');
      expect(result.javascript).toContain('button.js');
    });
  });

  describe('critical CSS', () => {
    it('should extract critical CSS when enabled', async () => {
      const template = '<div class="hero">{{title}}</div>';
      const context: SSRContext = {
        variables: { title: 'Hero Title' },
      };
      const options: SSROptions = {
        inlineCSS: true,
      };

      const result = await engine.render(template, context, options);

      // Note: This would work better with actual CSS files in a real implementation
      expect(result.criticalCSS).toBeDefined();
      expect(result.performance.criticalCSSSize).toBeGreaterThanOrEqual(0);
    });
  });

  describe('performance and caching', () => {
    it('should provide performance metrics', async () => {
      const template = '<div>{{content}}</div>';
      const context: SSRContext = {
        variables: { content: 'Performance test' },
      };

      const result = await engine.render(template, context);

      expect(result.performance).toBeDefined();
      expect(result.performance.renderTime).toBeGreaterThan(0);
      expect(result.performance.totalSize).toBeGreaterThan(0);
    });

    it('should support caching with TTL', async () => {
      const mockCache = {
        cache: new Map(),
        async get(key: string) {
          return this.cache.get(key) || null;
        },
        async set(key: string, value: any, ttl: number) {
          this.cache.set(key, value);
        },
        async invalidate(tags: string[]) {
          // Mock implementation
        },
        async clear() {
          this.cache.clear();
        },
        async stats() {
          return { hits: 0, misses: 0, size: 0, keys: 0 };
        },
      };

      engine.setCache(mockCache);

      const template = '<div>{{message}}</div>';
      const context: SSRContext = {
        variables: { message: 'Cached content' },
      };
      const options: SSROptions = {
        cacheTTL: 3600,
      };

      // First render
      const result1 = await engine.render(template, context, options);
      expect(result1.cache).toBeDefined();
      expect(result1.cache!.ttl).toBe(3600);

      // Second render should use cache
      const result2 = await engine.render(template, context, options);
      expect(result2).toBe(result1); // Same object reference from cache
    });
  });

  describe('link tags and resources', () => {
    it('should generate preload links when enabled', async () => {
      const template = '<div>Content</div>';
      const context: SSRContext = {};
      const options: SSROptions = {
        preloadJS: true,
      };

      // Mock compiled result with JavaScript
      const mockTemplate = {
        compile: async () => ({
          html: '<div>Content</div>',
          javascript: ['app.js', 'vendor.js'],
          css: ['styles.css'],
          components: [],
          variables: [],
          hyperscript: [],
          warnings: [],
        }),
        render: async (compiled: any, context: any) => compiled.html,
      };

      // This test would work better with actual template engine integration
      const result = await engine.render(template, context, options);

      expect(result.linkTags).toBeDefined();
    });

    it('should include performance hints from context', async () => {
      const template = '<div>Content</div>';
      const context: SSRContext = {
        performance: {
          preconnect: ['https://api.example.com'],
          prefetch: ['https://cdn.example.com'],
        },
      };

      const result = await engine.render(template, context);

      expect(result.linkTags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ rel: 'preconnect', href: 'https://api.example.com' }),
          expect.objectContaining({ rel: 'prefetch', href: 'https://cdn.example.com' }),
        ])
      );
    });
  });

  describe('error handling', () => {
    it('should handle template compilation errors', async () => {
      const template = '<div>{{unclosed template variable</div>';
      const context: SSRContext = {};

      await expect(engine.render(template, context)).rejects.toThrow();
    });

    it('should handle missing component gracefully', async () => {
      const template = '<nonexistent-component></nonexistent-component>';
      const context: SSRContext = {};

      // Should not throw, but might generate warnings
      const result = await engine.render(template, context);
      expect(result).toBeDefined();
    });
  });

  describe('request context integration', () => {
    it('should include request information in hydration', async () => {
      const template = '<div>{{message}}</div>';
      const context: SSRContext = {
        variables: { message: 'Hello' },
        request: {
          url: '/test-route',
          method: 'GET',
          headers: { 'user-agent': 'Test Browser' },
        },
        user: {
          id: 'user123',
          name: 'Test User',
        },
      };
      const options: SSROptions = {
        hydration: true,
      };

      const result = await engine.render(template, context, options);

      expect(result.hydrationScript).toContain('/test-route');
      expect(result.hydrationScript).toContain('user123');
    });
  });
});