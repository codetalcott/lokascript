import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import axios from 'axios';
import { Client, createClient, createDefaultClient } from './client';
import {
  ClientConfig,
  CompileRequest,
  ValidateRequest,
  BatchCompileRequest,
  HyperfixiError,
  NetworkError,
  ValidationError,
  CompilationFailedError,
} from './types';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;
const mockedCreate = axios.create as MockedFunction<typeof axios.create>;

describe('Client', () => {
  let mockAxiosInstance: any;
  let client: Client;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      request: vi.fn(),
      defaults: {
        headers: {
          common: {},
        },
      },
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    mockedCreate.mockReturnValue(mockAxiosInstance);

    // Create client with test config
    const config: ClientConfig = {
      baseURL: 'http://test.example.com',
      timeout: 5000,
      retries: 1,
    };

    client = new Client(config);
  });

  describe('constructor', () => {
    it('should create client with default config', () => {
      const defaultClient = Client.createDefault();
      expect(defaultClient).toBeInstanceOf(Client);
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:3000',
          timeout: 30000,
        })
      );
    });

    it('should create client with custom config', () => {
      const config: ClientConfig = {
        baseURL: 'http://custom.example.com',
        timeout: 10000,
        retries: 5,
        authToken: 'test-token',
        headers: { 'X-Custom': 'value' },
      };

      new Client(config);

      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://custom.example.com',
          timeout: 10000,
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      );
    });

    it('should set auth token in headers', () => {
      const config: ClientConfig = {
        baseURL: 'http://test.com',
        authToken: 'bearer-token',
      };

      new Client(config);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer bearer-token');
    });
  });

  describe('compile', () => {
    it('should compile scripts successfully', async () => {
      const mockResponse = {
        compiled: {
          button: 'document.addEventListener("click", function() { console.log("clicked"); });',
        },
        metadata: {
          button: {
            complexity: 1,
            dependencies: [],
            selectors: ['.active'],
            events: ['click'],
            commands: ['toggle'],
            templateVariables: [],
          },
        },
        timings: { total: 10.5, parse: 2.1, compile: 7.4, cache: 1.0 },
        warnings: [],
        errors: [],
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const request: CompileRequest = {
        scripts: { button: 'on click toggle .active' },
        options: { minify: true },
      };

      const result = await client.compile(request);

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/compile',
        data: request,
      });
    });

    it('should throw ValidationError for invalid request', async () => {
      const request = { scripts: {} } as CompileRequest;

      await expect(client.compile(request)).rejects.toThrow(ValidationError);
      expect(mockAxiosInstance.request).not.toHaveBeenCalled();
    });

    it('should throw CompilationFailedError when compilation has errors', async () => {
      const mockResponse = {
        compiled: {},
        metadata: {},
        timings: { total: 5, parse: 2, compile: 2, cache: 1 },
        warnings: [],
        errors: [
          {
            type: 'SyntaxError',
            message: 'Invalid syntax',
            line: 1,
            column: 5,
          },
        ],
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const request: CompileRequest = {
        scripts: { button: 'invalid script' },
      };

      await expect(client.compile(request)).rejects.toThrow(CompilationFailedError);
    });

    it('should validate compile request parameters', async () => {
      // Invalid scripts type
      await expect(client.compile({ scripts: 'invalid' as any })).rejects.toThrow(ValidationError);

      // Empty scripts
      await expect(client.compile({ scripts: {} })).rejects.toThrow(ValidationError);

      // Non-string script
      await expect(client.compile({ scripts: { test: 123 as any } })).rejects.toThrow(ValidationError);
    });
  });

  describe('compileScript', () => {
    it('should compile single script successfully', async () => {
      const mockResponse = {
        compiled: {
          script_0: 'document.addEventListener("click", function() { console.log("clicked"); });',
        },
        metadata: {
          script_0: {
            complexity: 1,
            dependencies: [],
            selectors: ['.active'],
            events: ['click'],
            commands: ['toggle'],
            templateVariables: [],
          },
        },
        timings: { total: 10.5, parse: 2.1, compile: 7.4, cache: 1.0 },
        warnings: [],
        errors: [],
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const result = await client.compileScript('on click toggle .active', { minify: true });

      expect(result.compiled).toBe(mockResponse.compiled.script_0);
      expect(result.metadata).toEqual(mockResponse.metadata.script_0);
    });

    it('should throw ValidationError for non-string script', async () => {
      await expect(client.compileScript(123 as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('compileWithTemplateVars', () => {
    it('should compile scripts with template variables', async () => {
      const mockResponse = {
        compiled: { button: 'compiled code' },
        metadata: { button: { complexity: 1, dependencies: [], selectors: [], events: [], commands: [], templateVariables: ['userId'] } },
        timings: { total: 10, parse: 2, compile: 7, cache: 1 },
        warnings: [],
        errors: [],
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const scripts = { button: 'on click fetch /api/users/{{userId}}' };
      const templateVars = { userId: 123 };

      const result = await client.compileWithTemplateVars(scripts, templateVars);

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/compile',
        data: {
          scripts,
          context: { templateVars },
        },
      });
    });

    it('should throw ValidationError for invalid scripts', async () => {
      await expect(client.compileWithTemplateVars(null as any, {})).rejects.toThrow(ValidationError);
    });
  });

  describe('validate', () => {
    it('should validate script successfully', async () => {
      const mockResponse = {
        valid: true,
        errors: [],
        warnings: [],
        metadata: {
          complexity: 1,
          dependencies: [],
          selectors: ['.active'],
          events: ['click'],
          commands: ['toggle'],
          templateVariables: [],
        },
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const request: ValidateRequest = { script: 'on click toggle .active' };
      const result = await client.validate(request);

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/validate',
        data: request,
      });
    });

    it('should throw ValidationError for invalid request', async () => {
      await expect(client.validate({ script: '' })).rejects.toThrow(ValidationError);
      await expect(client.validate({ script: 123 as any })).rejects.toThrow(ValidationError);
    });
  });

  describe('validateScript', () => {
    it('should validate single script successfully', async () => {
      const mockResponse = {
        valid: true,
        errors: [],
        warnings: [],
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const result = await client.validateScript('on click toggle .active');

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should throw ValidationError for non-string script', async () => {
      await expect(client.validateScript(123 as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('batchCompile', () => {
    it('should batch compile scripts successfully', async () => {
      const mockResponse = {
        compiled: {
          button: 'compiled button code',
          form: 'compiled form code',
        },
        metadata: {
          button: { complexity: 1, dependencies: [], selectors: [], events: ['click'], commands: ['toggle'], templateVariables: [] },
          form: { complexity: 2, dependencies: [], selectors: [], events: ['submit'], commands: ['fetch'], templateVariables: [] },
        },
        timings: { total: 15.2, parse: 3.1, compile: 10.1, cache: 2.0 },
        warnings: [],
        errors: [],
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const request: BatchCompileRequest = {
        definitions: [
          { id: 'button', script: 'on click toggle .active' },
          { id: 'form', script: 'on submit fetch /api/save' },
        ],
      };

      const result = await client.batchCompile(request);

      expect(result).toEqual(mockResponse);
    });

    it('should throw ValidationError for invalid request', async () => {
      // Non-array definitions
      await expect(client.batchCompile({ definitions: 'invalid' as any })).rejects.toThrow(ValidationError);

      // Empty definitions
      await expect(client.batchCompile({ definitions: [] })).rejects.toThrow(ValidationError);

      // Invalid definition
      await expect(client.batchCompile({
        definitions: [{ id: '', script: 'test' }],
      })).rejects.toThrow(ValidationError);

      await expect(client.batchCompile({
        definitions: [{ id: 'test', script: '' }],
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('health', () => {
    it('should get health status successfully', async () => {
      const mockResponse = {
        status: 'healthy',
        version: '0.1.0',
        uptime: 12345,
        cache: {
          hits: 100,
          misses: 20,
          hitRatio: 0.83,
          size: 50,
          maxSize: 100,
        },
        timestamp: '2023-12-01T10:00:00Z',
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const result = await client.health();

      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('cacheStats', () => {
    it('should get cache stats successfully', async () => {
      const mockResponse = {
        hits: 150,
        misses: 30,
        hitRatio: 0.83,
        size: 75,
        maxSize: 100,
      };

      mockAxiosInstance.request.mockResolvedValue({ data: mockResponse });

      const result = await client.cacheStats();

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/cache/stats',
      });
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: { message: 'Cache cleared' } });

      await client.clearCache();

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/cache/clear',
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      // Mock the actual error that would be thrown by handleAxiosError
      const networkError = new NetworkError('Network request failed');
      mockAxiosInstance.request.mockRejectedValue(networkError);

      await expect(client.health()).rejects.toThrow(NetworkError);
    });

    it('should handle HTTP error responses', async () => {
      // Mock the actual error that would be thrown by handleAxiosError
      const validationError = new ValidationError('Bad Request', 400);
      mockAxiosInstance.request.mockRejectedValue(validationError);

      await expect(client.health()).rejects.toThrow(ValidationError);
    });

    it('should handle server errors', async () => {
      // Mock the actual error that would be thrown by handleAxiosError
      const serverError = new HyperfixiError('Internal Server Error', 500);
      mockAxiosInstance.request.mockRejectedValue(serverError);

      await expect(client.health()).rejects.toThrow(HyperfixiError);
    });
  });

  describe('retry logic', () => {
    it('should retry on server errors', async () => {
      const serverError = new HyperfixiError('Server Error', 500);

      const successResponse = {
        data: {
          status: 'healthy',
          version: '0.1.0',
          uptime: 12345,
          cache: { hits: 100, misses: 20, hitRatio: 0.83, size: 50, maxSize: 100 },
          timestamp: new Date(),
        },
      };

      mockAxiosInstance.request
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue(successResponse);

      const result = await client.health();
      expect(result.status).toBe('healthy');
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should not retry on client errors', async () => {
      // Mock the actual error that would be thrown by handleAxiosError
      const clientError = new ValidationError('Bad Request', 400);

      mockAxiosInstance.request.mockRejectedValue(clientError);

      await expect(client.health()).rejects.toThrow(ValidationError);
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });
  });
});

describe('factory functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreate.mockReturnValue({
      defaults: { headers: { common: {} } },
      interceptors: { response: { use: vi.fn() } },
      request: vi.fn(),
    });
  });

  it('should create client with createClient', () => {
    const config = { baseURL: 'http://test.com' };
    const client = createClient(config);
    
    expect(client).toBeInstanceOf(Client);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://test.com',
      })
    );
  });

  it('should create default client with createDefaultClient', () => {
    const client = createDefaultClient();
    
    expect(client).toBeInstanceOf(Client);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:3000',
      })
    );
  });
});