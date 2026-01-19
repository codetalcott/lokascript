import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  ClientConfig,
  CompileRequest,
  CompileResponse,
  ValidateRequest,
  ValidateResponse,
  BatchCompileRequest,
  HealthStatus,
  CacheStats,
  CompilationOptions,
  ScriptMetadata,
  CompilationError,
  HyperfixiClient,
  HyperfixiError,
  NetworkError,
  ValidationError,
  CompilationFailedError,
} from './types';

/**
 * Default client configuration
 */
const DEFAULT_CONFIG: Partial<ClientConfig> = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  headers: {},
};

/**
 * LokaScript JavaScript client for server-side hyperscript compilation
 */
export class Client implements HyperfixiClient {
  private readonly client: AxiosInstance;
  private readonly config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout!,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LokaScript-JS-Client/0.1.0',
        ...this.config.headers,
      },
    });

    // Add auth token if provided
    if (this.config.authToken) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleAxiosError(error)
    );
  }

  /**
   * Create a new client with default configuration
   */
  static createDefault(): Client {
    return new Client(DEFAULT_CONFIG as ClientConfig);
  }

  /**
   * Compile hyperscript to JavaScript
   */
  async compile(request: CompileRequest): Promise<CompileResponse> {
    this.validateCompileRequest(request);

    const response = await this.requestWithRetry<CompileResponse>('POST', '/compile', request);
    
    // Check for compilation errors
    if (response.errors && response.errors.length > 0) {
      throw new CompilationFailedError(
        `Compilation failed with ${response.errors.length} errors`,
        response.errors
      );
    }

    return response;
  }

  /**
   * Compile a single hyperscript
   */
  async compileScript(
    script: string, 
    options?: CompilationOptions
  ): Promise<{ compiled: string; metadata: ScriptMetadata }> {
    if (typeof script !== 'string') {
      throw new ValidationError('Script must be a string');
    }

    const request: CompileRequest = {
      scripts: { script_0: script },
      ...(options && { options }),
    };

    const response = await this.compile(request);
    
    return {
      compiled: response.compiled.script_0!,
      metadata: response.metadata.script_0!,
    };
  }

  /**
   * Compile scripts with template variables
   */
  async compileWithTemplateVars(
    scripts: Record<string, string>,
    templateVars: Record<string, any>,
    options?: CompilationOptions
  ): Promise<CompileResponse> {
    if (!scripts || typeof scripts !== 'object') {
      throw new ValidationError('Scripts must be an object');
    }

    const request: CompileRequest = {
      scripts,
      ...(options && { options }),
      context: {
        templateVars,
      },
    };

    return this.compile(request);
  }

  /**
   * Validate hyperscript syntax
   */
  async validate(request: ValidateRequest): Promise<ValidateResponse> {
    this.validateValidateRequest(request);

    return this.requestWithRetry<ValidateResponse>('POST', '/validate', request);
  }

  /**
   * Validate a single hyperscript
   */
  async validateScript(script: string): Promise<{ valid: boolean; errors: CompilationError[] }> {
    if (typeof script !== 'string') {
      throw new ValidationError('Script must be a string');
    }

    const request: ValidateRequest = { script };
    const response = await this.validate(request);

    return {
      valid: response.valid,
      errors: response.errors,
    };
  }

  /**
   * Batch compile multiple scripts
   */
  async batchCompile(request: BatchCompileRequest): Promise<CompileResponse> {
    this.validateBatchCompileRequest(request);

    const response = await this.requestWithRetry<CompileResponse>('POST', '/batch', request);
    
    // Check for compilation errors
    if (response.errors && response.errors.length > 0) {
      throw new CompilationFailedError(
        `Batch compilation failed with ${response.errors.length} errors`,
        response.errors
      );
    }

    return response;
  }

  /**
   * Get service health status
   */
  async health(): Promise<HealthStatus> {
    const response = await this.requestWithRetry<HealthStatus>('GET', '/health');
    
    // Convert timestamp string to Date if needed
    if (typeof response.timestamp === 'string') {
      response.timestamp = new Date(response.timestamp);
    }

    return response;
  }

  /**
   * Get cache statistics
   */
  async cacheStats(): Promise<CacheStats> {
    return this.requestWithRetry<CacheStats>('GET', '/cache/stats');
  }

  /**
   * Clear compilation cache
   */
  async clearCache(): Promise<void> {
    await this.requestWithRetry('POST', '/cache/clear');
  }

  /**
   * Make HTTP request with retry logic
   */
  private async requestWithRetry<T = any>(
    method: 'GET' | 'POST',
    url: string,
    data?: any
  ): Promise<T> {
    let lastError: Error;
    const maxRetries = this.config.retries || 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response: AxiosResponse<T> = await this.client.request({
          method,
          url,
          data,
        });

        return response.data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof HyperfixiError && error.statusCode && error.statusCode < 500) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Handle Axios errors and convert to appropriate LokaScript errors
   */
  private handleAxiosError(error: AxiosError): never {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = (data as any)?.error || `HTTP ${status} error`;

      if (status >= 400 && status < 500) {
        throw new ValidationError(message, status);
      } else {
        throw new HyperfixiError(message, status, error);
      }
    } else if (error.request) {
      // Network error
      throw new NetworkError('Network request failed', error);
    } else {
      // Other error
      throw new HyperfixiError(error.message, undefined, error);
    }
  }

  /**
   * Validate compile request
   */
  private validateCompileRequest(request: CompileRequest): void {
    if (!request.scripts || typeof request.scripts !== 'object') {
      throw new ValidationError('Scripts must be an object');
    }

    if (Object.keys(request.scripts).length === 0) {
      throw new ValidationError('At least one script must be provided');
    }

    for (const [name, script] of Object.entries(request.scripts)) {
      if (typeof script !== 'string') {
        throw new ValidationError(`Script '${name}' must be a string`);
      }
    }
  }

  /**
   * Validate validate request
   */
  private validateValidateRequest(request: ValidateRequest): void {
    if (!request.script || typeof request.script !== 'string') {
      throw new ValidationError('Script must be a non-empty string');
    }
  }

  /**
   * Validate batch compile request
   */
  private validateBatchCompileRequest(request: BatchCompileRequest): void {
    if (!Array.isArray(request.definitions)) {
      throw new ValidationError('Definitions must be an array');
    }

    if (request.definitions.length === 0) {
      throw new ValidationError('At least one script definition must be provided');
    }

    for (const [index, definition] of request.definitions.entries()) {
      if (!definition.id || typeof definition.id !== 'string') {
        throw new ValidationError(`Definition ${index} must have a valid ID`);
      }

      if (!definition.script || typeof definition.script !== 'string') {
        throw new ValidationError(`Definition ${index} must have a valid script`);
      }
    }
  }
}

/**
 * Create a new LokaScript client with default configuration
 */
export function createClient(config?: Partial<ClientConfig>): Client {
  const finalConfig = { ...DEFAULT_CONFIG, ...config } as ClientConfig;
  return new Client(finalConfig);
}

/**
 * Create a new LokaScript client with default configuration
 */
export function createDefaultClient(): Client {
  return Client.createDefault();
}