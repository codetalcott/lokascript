import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import {
  hyperfixiMiddleware,
  createTemplateHelpers,
  createApiRoutes,
  getHyperfixiClient,
  getTemplateVars,
  createMiddlewareConfig,
} from './express';
import { HyperfixiClient, ExpressMiddlewareConfig } from './types';

// Mock Express
vi.mock('express');

describe('Express Integration', () => {
  let mockClient: HyperfixiClient;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock HyperFixi client
    mockClient = {
      compile: vi.fn(),
      compileScript: vi.fn(),
      compileWithTemplateVars: vi.fn(),
      validate: vi.fn(),
      validateScript: vi.fn(),
      batchCompile: vi.fn(),
      health: vi.fn(),
      cacheStats: vi.fn(),
      clearCache: vi.fn(),
    };

    // Mock Express request
    mockReq = {
      path: '/test',
      get: vi.fn(),
    };

    // Mock Express response
    mockRes = {
      send: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      get: vi.fn(),
      statusCode: 200,
    };

    // Mock next function
    mockNext = vi.fn();
  });

  describe('hyperfixiMiddleware', () => {
    it('should create middleware with client', () => {
      const config: ExpressMiddlewareConfig = {
        client: mockClient,
      };

      const middleware = hyperfixiMiddleware(config);
      expect(typeof middleware).toBe('function');
    });

    it('should throw error without client', () => {
      expect(() => {
        hyperfixiMiddleware({} as ExpressMiddlewareConfig);
      }).toThrow('HyperFixi client is required');
    });

    it('should add client to request', () => {
      const config: ExpressMiddlewareConfig = {
        client: mockClient,
        compileOnResponse: false,
      };

      const middleware = hyperfixiMiddleware(config);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).hyperfixi).toBe(mockClient);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should parse template variables from header', () => {
      const templateVars = { userId: 123 };
      (mockReq.get as MockedFunction<any>).mockReturnValue(JSON.stringify(templateVars));

      const config: ExpressMiddlewareConfig = {
        client: mockClient,
        compileOnResponse: false,
        templateVarsHeader: 'X-Template-Vars',
      };

      const middleware = hyperfixiMiddleware(config);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.get).toHaveBeenCalledWith('X-Template-Vars');
      expect((mockReq as any).hyperfixiTemplateVars).toEqual(templateVars);
    });

    it('should skip paths when configured', () => {
      mockReq.path = '/api/test';

      const config: ExpressMiddlewareConfig = {
        client: mockClient,
        skipPaths: ['/api/'],
      };

      const originalSend = mockRes.send;
      const middleware = hyperfixiMiddleware(config);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.send).toBe(originalSend); // Should not be overridden
      expect(mockNext).toHaveBeenCalled();
    });

    it('should override response methods for HTML processing', () => {
      const config: ExpressMiddlewareConfig = {
        client: mockClient,
        compileOnResponse: true,
      };

      const originalSend = mockRes.send;
      const middleware = hyperfixiMiddleware(config);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.send).not.toBe(originalSend);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle JSON parsing errors gracefully', () => {
      (mockReq.get as MockedFunction<any>).mockReturnValue('invalid-json');

      const config: ExpressMiddlewareConfig = {
        client: mockClient,
        compileOnResponse: false,
      };

      const middleware = hyperfixiMiddleware(config);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).hyperfixiTemplateVars).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createTemplateHelpers', () => {
    let helpers: ReturnType<typeof createTemplateHelpers>;

    beforeEach(() => {
      helpers = createTemplateHelpers(mockClient);
    });

    describe('compileHyperscript', () => {
      it('should compile hyperscript successfully', async () => {
        const mockResponse = {
          compiled: { template_script: 'console.log("compiled");' },
          metadata: {},
          timings: { total: 10, parse: 2, compile: 7, cache: 1 },
          warnings: [],
          errors: [],
        };

        (mockClient.compile as MockedFunction<any>).mockResolvedValue(mockResponse);

        const result = await helpers.compileHyperscript('on click log "test"');

        expect(result).toBe('onclick="console.log(&quot;compiled&quot;);"');
        expect(mockClient.compile).toHaveBeenCalledWith({
          scripts: { template_script: 'on click log "test"' },
          context: undefined,
        });
      });

      it('should compile with template variables', async () => {
        const mockResponse = {
          compiled: { template_script: 'console.log("compiled");' },
          metadata: {},
          timings: { total: 10, parse: 2, compile: 7, cache: 1 },
          warnings: [],
          errors: [],
        };

        (mockClient.compile as MockedFunction<any>).mockResolvedValue(mockResponse);

        const templateVars = { userId: 123 };
        await helpers.compileHyperscript('on click fetch /api/users/{{userId}}', templateVars);

        expect(mockClient.compile).toHaveBeenCalledWith({
          scripts: { template_script: 'on click fetch /api/users/{{userId}}' },
          context: { templateVars },
        });
      });

      it('should handle compilation errors gracefully', async () => {
        (mockClient.compile as MockedFunction<any>).mockRejectedValue(new Error('Compilation failed'));

        const result = await helpers.compileHyperscript('invalid script');

        expect(result).toContain('HyperFixi compilation error');
        expect(result).toContain('Compilation failed');
      });
    });

    describe('compileHyperscriptWithOptions', () => {
      it('should compile with custom options', async () => {
        const mockResponse = {
          compiled: { template_script: 'console.log("compiled");' },
          metadata: {},
          timings: { total: 10, parse: 2, compile: 7, cache: 1 },
          warnings: [],
          errors: [],
        };

        (mockClient.compile as MockedFunction<any>).mockResolvedValue(mockResponse);

        const options = { minify: true };
        const templateVars = { userId: 123 };

        await helpers.compileHyperscriptWithOptions('on click log "test"', templateVars, options);

        expect(mockClient.compile).toHaveBeenCalledWith({
          scripts: { template_script: 'on click log "test"' },
          options,
          context: { templateVars },
        });
      });
    });

    describe('validateHyperscript', () => {
      it('should validate successfully', async () => {
        (mockClient.validateScript as MockedFunction<any>).mockResolvedValue({
          valid: true,
          errors: [],
        });

        const result = await helpers.validateHyperscript('on click toggle .active');

        expect(result).toBe(true);
        expect(mockClient.validateScript).toHaveBeenCalledWith('on click toggle .active');
      });

      it('should return false on validation error', async () => {
        (mockClient.validateScript as MockedFunction<any>).mockRejectedValue(new Error('Validation failed'));

        const result = await helpers.validateHyperscript('invalid script');

        expect(result).toBe(false);
      });
    });
  });

  describe('createApiRoutes', () => {
    let mockRouter: any;

    beforeEach(() => {
      mockRouter = {
        post: vi.fn(),
        get: vi.fn(),
      };

      (express.Router as MockedFunction<any>).mockReturnValue(mockRouter);
    });

    it('should create router with default base path', () => {
      createApiRoutes(mockClient);

      expect(express.Router).toHaveBeenCalled();
      expect(mockRouter.post).toHaveBeenCalledWith('/hyperscript/compile', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith('/hyperscript/validate', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith('/hyperscript/batch', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/hyperscript/health', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/hyperscript/cache/stats', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith('/hyperscript/cache/clear', expect.any(Function));
    });

    it('should create router with custom base path', () => {
      createApiRoutes(mockClient, '/custom');

      expect(mockRouter.post).toHaveBeenCalledWith('/custom/compile', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/custom/health', expect.any(Function));
    });

    describe('route handlers', () => {
      let compileHandler: Function;
      let mockRouterRes: any;

      beforeEach(() => {
        createApiRoutes(mockClient);
        
        // Get the compile handler
        const compileCall = mockRouter.post.mock.calls.find(
          (call: any) => call[0] === '/hyperscript/compile'
        );
        compileHandler = compileCall[1];

        mockRouterRes = {
          json: vi.fn(),
          status: vi.fn().mockReturnThis(),
        };
      });

      it('should handle compile requests successfully', async () => {
        const mockResponse = {
          compiled: { button: 'compiled code' },
          metadata: {},
          timings: { total: 10, parse: 2, compile: 7, cache: 1 },
          warnings: [],
          errors: [],
        };

        (mockClient.compile as MockedFunction<any>).mockResolvedValue(mockResponse);

        const mockRouterReq = {
          body: {
            scripts: { button: 'on click toggle .active' },
          },
        };

        await compileHandler(mockRouterReq, mockRouterRes);

        expect(mockClient.compile).toHaveBeenCalledWith(mockRouterReq.body);
        expect(mockRouterRes.json).toHaveBeenCalledWith(mockResponse);
      });

      it('should handle compile errors', async () => {
        const error = new Error('Compilation failed');
        (mockClient.compile as MockedFunction<any>).mockRejectedValue(error);

        const mockRouterReq = {
          body: { scripts: { button: 'invalid' } },
        };

        await compileHandler(mockRouterReq, mockRouterRes);

        expect(mockRouterRes.status).toHaveBeenCalledWith(500);
        expect(mockRouterRes.json).toHaveBeenCalledWith({
          error: 'Internal server error',
          type: 'UnknownError',
        });
      });
    });
  });

  describe('helper functions', () => {
    it('should get HyperFixi client from request', () => {
      (mockReq as any).hyperfixi = mockClient;

      const client = getHyperfixiClient(mockReq as Request);
      expect(client).toBe(mockClient);
    });

    it('should return undefined when no client in request', () => {
      const client = getHyperfixiClient(mockReq as Request);
      expect(client).toBeUndefined();
    });

    it('should get template vars from request', () => {
      const templateVars = { userId: 123 };
      (mockReq as any).hyperfixiTemplateVars = templateVars;

      const vars = getTemplateVars(mockReq as Request);
      expect(vars).toEqual(templateVars);
    });

    it('should return undefined when no template vars in request', () => {
      const vars = getTemplateVars(mockReq as Request);
      expect(vars).toBeUndefined();
    });

    it('should create middleware config', () => {
      const config = createMiddlewareConfig(mockClient);

      expect(config.client).toBe(mockClient);
      expect(config.compileOnResponse).toBe(true);
      expect(config.templateVarsHeader).toBe('X-Hyperscript-Template-Vars');
      expect(config.skipPaths).toEqual(['/api/', '/static/']);
      expect(config.onlyContentTypes).toEqual(['text/html']);
    });
  });
});