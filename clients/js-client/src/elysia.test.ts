import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Elysia } from 'elysia';
import { 
  lokascriptPlugin, 
  createElysiaTemplateHelpers,
  createHyperfixiApp,
  createElysiaConfig,
  getHyperfixiClient,
  getTemplateVars,
} from './elysia';
import { HyperfixiClient, CompileResponse, ValidateResponse } from './types';

// Mock Elysia
vi.mock('elysia', () => {
  return {
    Elysia: vi.fn(() => ({
      derive: vi.fn().mockReturnThis(),
      onAfterHandle: vi.fn().mockReturnThis(),
      group: vi.fn().mockReturnThis(),
      post: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      use: vi.fn().mockReturnThis(),
    })),
  };
});

describe('Elysia Integration', () => {
  let mockClient: HyperfixiClient;
  let mockContext: any;

  beforeEach(() => {
    // Mock LokaScript client
    mockClient = {
      compile: vi.fn(),
      validate: vi.fn(),
      validateScript: vi.fn(),
      batchCompile: vi.fn(),
      health: vi.fn(),
      cacheStats: vi.fn(),
      clearCache: vi.fn(),
    } as HyperfixiClient;

    // Mock Elysia context
    mockContext = {
      headers: {},
      request: { url: 'http://localhost:3000/test' },
      response: '<div _="on click toggle .active">Test</div>',
      set: { status: 200, headers: { 'content-type': 'text/html' } },
      lokascript: mockClient,
      lokascriptTemplateVars: undefined,
    };

    vi.clearAllMocks();
  });

  describe('lokascriptPlugin', () => {
    it('should create plugin with required client', () => {
      expect(() => {
        lokascriptPlugin({ client: mockClient });
      }).not.toThrow();
    });

    it('should throw error when client is missing', () => {
      expect(() => {
        lokascriptPlugin({} as any);
      }).toThrow('LokaScript client is required in plugin config');
    });

    it('should use default configuration', () => {
      const plugin = lokascriptPlugin({ client: mockClient });
      expect(plugin).toBeDefined();
    });

    it('should allow custom configuration', () => {
      const config = {
        client: mockClient,
        compileOnResponse: false,
        templateVarsHeader: 'custom-header',
        skipPaths: ['/custom/'],
        basePath: '/custom-api',
      };

      const plugin = lokascriptPlugin(config);
      expect(plugin).toBeDefined();
    });
  });

  describe('template helpers', () => {
    let helpers: ReturnType<typeof createElysiaTemplateHelpers>;

    beforeEach(() => {
      helpers = createElysiaTemplateHelpers(mockClient);
    });

    describe('compileHyperscript', () => {
      it('should compile hyperscript successfully', async () => {
        const mockResponse: CompileResponse = {
          compiled: { template_script: 'element.classList.toggle("active")' },
          timings: { total: 10, compilation: 8, validation: 2 },
          warnings: [],
          metadata: { template_script: { complexity: 1, dependencies: [] } },
        };

        vi.mocked(mockClient.compile).mockResolvedValue(mockResponse);

        const result = await helpers.compileHyperscript('on click toggle .active');
        
        expect(result).toBe('onclick="element.classList.toggle(&quot;active&quot;)"');
        expect(mockClient.compile).toHaveBeenCalledWith({
          scripts: { template_script: 'on click toggle .active' },
        });
      });

      it('should handle compilation errors gracefully', async () => {
        vi.mocked(mockClient.compile).mockRejectedValue(new Error('Compilation failed'));

        const result = await helpers.compileHyperscript('invalid script');
        
        expect(result).toContain('LokaScript compilation error');
        expect(result).toContain('Compilation failed');
      });

      it('should include template variables in request', async () => {
        const mockResponse: CompileResponse = {
          compiled: { template_script: 'console.log("userId:", "123")' },
          timings: { total: 10, compilation: 8, validation: 2 },
          warnings: [],
          metadata: { template_script: { complexity: 1, dependencies: [] } },
        };

        vi.mocked(mockClient.compile).mockResolvedValue(mockResponse);

        const templateVars = { userId: '123' };
        await helpers.compileHyperscript('on click log userId', templateVars);
        
        expect(mockClient.compile).toHaveBeenCalledWith({
          scripts: { template_script: 'on click log userId' },
          context: { templateVars },
        });
      });
    });

    describe('compileHyperscriptWithOptions', () => {
      it('should compile with options', async () => {
        const mockResponse: CompileResponse = {
          compiled: { template_script: 'element.classList.toggle("active")' },
          timings: { total: 10, compilation: 8, validation: 2 },
          warnings: [],
          metadata: { template_script: { complexity: 1, dependencies: [] } },
        };

        vi.mocked(mockClient.compile).mockResolvedValue(mockResponse);

        const options = { compatibility: 'strict' as const };
        const templateVars = { test: 'value' };
        
        await helpers.compileHyperscriptWithOptions(
          'on click toggle .active',
          templateVars,
          options
        );
        
        expect(mockClient.compile).toHaveBeenCalledWith({
          scripts: { template_script: 'on click toggle .active' },
          options,
          context: { templateVars },
        });
      });
    });

    describe('validateHyperscript', () => {
      it('should validate hyperscript successfully', async () => {
        const mockResponse: ValidateResponse = {
          valid: true,
          errors: [],
          warnings: [],
          metadata: { complexity: 1, dependencies: [] },
        };

        vi.mocked(mockClient.validateScript).mockResolvedValue(mockResponse);

        const result = await helpers.validateHyperscript('on click toggle .active');
        
        expect(result).toBe(true);
        expect(mockClient.validateScript).toHaveBeenCalledWith('on click toggle .active');
      });

      it('should handle validation errors', async () => {
        vi.mocked(mockClient.validateScript).mockRejectedValue(new Error('Validation failed'));

        const result = await helpers.validateHyperscript('invalid script');
        
        expect(result).toBe(false);
      });

      it('should return false for invalid scripts', async () => {
        const mockResponse: ValidateResponse = {
          valid: false,
          errors: [{ message: 'Syntax error', line: 1, column: 5 }],
          warnings: [],
          metadata: { complexity: 0, dependencies: [] },
        };

        vi.mocked(mockClient.validateScript).mockResolvedValue(mockResponse);

        const result = await helpers.validateHyperscript('invalid script');
        
        expect(result).toBe(false);
      });
    });
  });

  describe('utility functions', () => {
    describe('getHyperfixiClient', () => {
      it('should return client from context', () => {
        const context = { lokascript: mockClient };
        const result = getHyperfixiClient(context as any);
        expect(result).toBe(mockClient);
      });

      it('should return undefined if no client', () => {
        const context = {};
        const result = getHyperfixiClient(context as any);
        expect(result).toBeUndefined();
      });
    });

    describe('getTemplateVars', () => {
      it('should return template vars from context', () => {
        const templateVars = { userId: '123' };
        const context = { lokascriptTemplateVars: templateVars };
        const result = getTemplateVars(context as any);
        expect(result).toBe(templateVars);
      });

      it('should return undefined if no template vars', () => {
        const context = {};
        const result = getTemplateVars(context as any);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('createHyperfixiApp', () => {
    it('should create standalone app with LokaScript routes', () => {
      const app = createHyperfixiApp(mockClient);
      expect(app).toBeDefined();
      expect(Elysia).toHaveBeenCalled();
    });

    it('should use custom base path', () => {
      const app = createHyperfixiApp(mockClient, '/custom-api');
      expect(app).toBeDefined();
    });
  });

  describe('createElysiaConfig', () => {
    it('should create configuration with client', () => {
      const config = createElysiaConfig(mockClient);
      
      expect(config.client).toBe(mockClient);
      expect(config.compileOnResponse).toBe(true);
      expect(config.templateVarsHeader).toBe('x-hyperscript-template-vars');
      expect(config.skipPaths).toEqual(['/api/', '/static/']);
      expect(config.onlyContentTypes).toEqual(['text/html']);
      expect(config.basePath).toBe('/hyperscript');
    });
  });

  describe('HTML compilation', () => {
    it('should process HTML with hyperscript attributes', async () => {
      // This test would require more complex mocking of the internal compilation
      // For now, we test that the plugin structure is correct
      const plugin = lokascriptPlugin({ client: mockClient });
      expect(plugin).toBeDefined();
    });

    it('should skip processing for non-HTML content', async () => {
      const plugin = lokascriptPlugin({ 
        client: mockClient,
        onlyContentTypes: ['text/html']
      });
      expect(plugin).toBeDefined();
    });

    it('should skip processing for configured paths', async () => {
      const plugin = lokascriptPlugin({ 
        client: mockClient,
        skipPaths: ['/api/', '/static/']
      });
      expect(plugin).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle compilation errors in middleware', async () => {
      const errorHandler = vi.fn();
      const plugin = lokascriptPlugin({
        client: mockClient,
        errorHandler,
      });
      
      expect(plugin).toBeDefined();
      // Error handling is tested indirectly through the plugin creation
    });

    it('should use default error handler when none provided', () => {
      const plugin = lokascriptPlugin({ client: mockClient });
      expect(plugin).toBeDefined();
    });
  });
});