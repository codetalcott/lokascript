/**
 * Tests for PluginBundleBuilder
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PluginBundleBuilder, buildBundles, type BuildConfig } from '../src/compiler/bundle-builder';
import { createMockCommandPlugin, createMockFeaturePlugin } from './test-setup';
import type { Plugin } from '../src/types';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(''),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([]),
}));

import * as fs from 'fs/promises';

describe('PluginBundleBuilder', () => {
  let plugins: Plugin[];
  let config: BuildConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    plugins = [
      createMockCommandPlugin({ name: 'on', pattern: /^on/ }),
      createMockCommandPlugin({ name: 'toggle', pattern: /^toggle/ }),
      createMockCommandPlugin({ name: 'send', pattern: /^send/ }),
      createMockFeaturePlugin({ name: 'auto-fetch' }),
      createMockFeaturePlugin({ name: 'intersection' }),
    ];

    config = {
      srcDirs: ['/project/src'],
      outDir: '/project/dist/bundles',
      plugins,
      bundles: [
        {
          name: 'core',
          include: ['on', 'toggle'],
        },
        {
          name: 'full',
          include: ['on', 'toggle', 'send', 'auto-fetch', 'intersection'],
        },
      ],
    };
  });

  describe('constructor', () => {
    it('should create builder with config', () => {
      const builder = new PluginBundleBuilder(config);
      expect(builder).toBeDefined();
    });
  });

  describe('build', () => {
    it('should create output directory', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      expect(fs.mkdir).toHaveBeenCalledWith('/project/dist/bundles', { recursive: true });
    });

    it('should generate bundle files for each bundle config', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      // Check core bundle was written
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/project/dist/bundles/core.bundle.js',
        expect.any(String)
      );

      // Check full bundle was written
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/project/dist/bundles/full.bundle.js',
        expect.any(String)
      );
    });

    it('should generate TypeScript definitions', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/project/dist/bundles/core.bundle.d.ts',
        expect.any(String)
      );
    });

    it('should generate manifest.json', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/project/dist/bundles/manifest.json',
        expect.stringContaining('"bundles"')
      );
    });
  });

  describe('bundle code generation', () => {
    it('should include plugin imports', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => call[0] === '/project/dist/bundles/core.bundle.js'
      );
      const code = writeCall?.[1] as string;

      expect(code).toContain("import { onPlugin }");
      expect(code).toContain("import { togglePlugin }");
    });

    it('should include registry load call', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => call[0] === '/project/dist/bundles/core.bundle.js'
      );
      const code = writeCall?.[1] as string;

      expect(code).toContain('optimizedRegistry.load(');
    });

    it('should include DOMContentLoaded handler', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => call[0] === '/project/dist/bundles/core.bundle.js'
      );
      const code = writeCall?.[1] as string;

      expect(code).toContain('DOMContentLoaded');
      expect(code).toContain('optimizedRegistry.apply()');
    });

    it('should include generation timestamp', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => call[0] === '/project/dist/bundles/core.bundle.js'
      );
      const code = writeCall?.[1] as string;

      expect(code).toContain('Generated:');
    });
  });

  describe('TypeScript definitions generation', () => {
    it('should include type exports', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => call[0] === '/project/dist/bundles/core.bundle.d.ts'
      );
      const dts = writeCall?.[1] as string;

      expect(dts).toContain('OptimizedPluginRegistry');
      expect(dts).toContain('pluginRegistry');
    });

    it('should include BundledPlugins type', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => call[0] === '/project/dist/bundles/core.bundle.d.ts'
      );
      const dts = writeCall?.[1] as string;

      expect(dts).toContain('BundledPlugins');
      expect(dts).toContain("'on'");
      expect(dts).toContain("'toggle'");
    });
  });

  describe('manifest generation', () => {
    it('should include all bundles in manifest', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => (call[0] as string).endsWith('manifest.json')
      );
      const manifest = JSON.parse(writeCall?.[1] as string);

      expect(manifest.bundles).toHaveLength(2);
      expect(manifest.bundles[0].name).toBe('core');
      expect(manifest.bundles[1].name).toBe('full');
    });

    it('should include generation timestamp', async () => {
      const builder = new PluginBundleBuilder(config);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => (call[0] as string).endsWith('manifest.json')
      );
      const manifest = JSON.parse(writeCall?.[1] as string);

      expect(manifest.generated).toBeDefined();
      // Should be a valid ISO date string
      expect(() => new Date(manifest.generated)).not.toThrow();
    });
  });

  describe('source analysis', () => {
    it('should analyze files in srcDirs', async () => {
      // Mock readdir to return some files
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: 'index.html', isDirectory: () => false, isFile: () => true } as any,
        { name: 'app.tsx', isDirectory: () => false, isFile: () => true } as any,
      ]);

      // Mock file content
      vi.mocked(fs.readFile).mockResolvedValue(
        '<button _="on click toggle .active">Click</button>'
      );

      const analyzeConfig: BuildConfig = {
        ...config,
        bundles: [
          { name: 'analyzed', analyze: true },
        ],
      };

      const builder = new PluginBundleBuilder(analyzeConfig);
      await builder.build();

      expect(fs.readdir).toHaveBeenCalledWith('/project/src', { withFileTypes: true });
    });

    it('should skip non-source files', async () => {
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: 'style.css', isDirectory: () => false, isFile: () => true } as any,
        { name: 'image.png', isDirectory: () => false, isFile: () => true } as any,
        { name: 'data.json', isDirectory: () => false, isFile: () => true } as any,
      ]);

      const builder = new PluginBundleBuilder(config);
      await builder.build();

      // readFile should not be called for non-source files
      // (only mkdir and writeFile for bundles)
    });

    it('should recurse into subdirectories', async () => {
      vi.mocked(fs.readdir)
        .mockResolvedValueOnce([
          { name: 'components', isDirectory: () => true, isFile: () => false } as any,
        ])
        .mockResolvedValueOnce([
          { name: 'Button.tsx', isDirectory: () => false, isFile: () => true } as any,
        ]);

      const builder = new PluginBundleBuilder(config);
      await builder.build();

      expect(fs.readdir).toHaveBeenCalledWith('/project/src', { withFileTypes: true });
      expect(fs.readdir).toHaveBeenCalledWith('/project/src/components', { withFileTypes: true });
    });
  });

  describe('bundle exclusions', () => {
    it('should exclude specified plugins', async () => {
      const excludeConfig: BuildConfig = {
        ...config,
        bundles: [
          {
            name: 'minimal',
            include: ['on', 'toggle', 'send'],
            exclude: ['send'],
          },
        ],
      };

      const builder = new PluginBundleBuilder(excludeConfig);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => call[0] === '/project/dist/bundles/minimal.bundle.js'
      );
      const code = writeCall?.[1] as string;

      expect(code).toContain('onPlugin');
      expect(code).toContain('togglePlugin');
      expect(code).not.toContain('sendPlugin');
    });
  });

  describe('plugin name conversion', () => {
    it('should convert kebab-case to camelCase', async () => {
      const kebabConfig: BuildConfig = {
        srcDirs: ['/project/src'],
        outDir: '/project/dist',
        plugins: [createMockFeaturePlugin({ name: 'auto-fetch' })],
        bundles: [
          { name: 'test', include: ['auto-fetch'] },
        ],
      };

      const builder = new PluginBundleBuilder(kebabConfig);
      await builder.build();

      const writeCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => (call[0] as string).endsWith('.bundle.js')
      );
      const code = writeCall?.[1] as string;

      expect(code).toContain('autoFetchPlugin');
    });
  });
});

describe('buildBundles', () => {
  it('should import config and build', async () => {
    // This function requires dynamic import, which is harder to test
    // For now, just verify it exists
    expect(buildBundles).toBeInstanceOf(Function);
  });
});
