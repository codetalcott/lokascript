/**
 * Fetch Command Implementation
 * HTTP request command with full event integration
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core';
import { 
  emitConfigEvent, 
  emitBeforeEvent, 
  emitAfterEvent, 
  emitErrorEvent, 
  emitFinallyEvent, 
  emitSwappedEvent,
  dispatchCustomEvent 
} from '../../core/events';

export interface FetchCommandOptions {
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
  credentials?: RequestCredentials;
}

export class FetchCommand implements CommandImplementation {
  public readonly name = 'fetch';
  public readonly syntax = 'fetch <url-expression> [as <type>] [into <target>]';
  public readonly isBlocking = true;
  public readonly hasBody = false;
  public readonly implicitTarget = 'me';
  
  private options: FetchCommandOptions;

  constructor(options: FetchCommandOptions = {}) {
    this.options = {
      method: 'GET',
      headers: {},
      timeout: 10000,
      credentials: 'same-origin',
      ...options,
    };
  }

  async execute(
    context: ExecutionContext, 
    url?: string, 
    options?: any
  ): Promise<any> {
    const element = context.me as HTMLElement;
    let config: any = null;
    
    try {
      // Resolve URL
      const resolvedUrl = this.resolveUrl(url, context);
      if (!resolvedUrl) {
        throw new Error('Fetch command requires a URL');
      }

      // Build request configuration
      config = this.buildConfig(resolvedUrl, options, context);

      // Emit fx:config event - allows modification of config
      if (element && !emitConfigEvent(element, config)) {
        return; // Request cancelled by fx:config handler
      }

      // Emit fx:before event - final chance to cancel
      if (element && !emitBeforeEvent(element, config)) {
        return; // Request cancelled by fx:before handler
      }

      // Execute HTTP request
      const response = await this.executeRequest(config);
      
      // Process response
      const result = await this.processResponse(response, config);
      
      // Update config with response data
      config.response = response;
      config.result = result;

      // Emit fx:after event - allows response processing modification
      if (element && !emitAfterEvent(element, config)) {
        return result; // Swapping cancelled, but return result
      }

      // Apply result to target (if specified)
      if (config.target && config.result) {
        await this.applyResult(config.target, config.result, config);
        
        // Emit fx:swapped event after DOM manipulation
        if (element) {
          emitSwappedEvent(element, config);
        }
      }

      // Dispatch success event
      if (element) {
        dispatchCustomEvent(element, 'hyperscript:fetch', {
          element,
          context,
          command: 'fetch',
          url: resolvedUrl,
          response,
          result,
        });
      }

      return result;

    } catch (error) {
      // Emit fx:error event
      if (element) {
        emitErrorEvent(element, error as Error, config, { name: 'fetch', url });
      }

      // Dispatch error event
      if (element) {
        dispatchCustomEvent(element, 'hyperscript:error', {
          element,
          context,
          command: 'fetch',
          error: error as Error,
          config,
        });
      }

      throw error;

    } finally {
      // Emit fx:finally event - always runs
      if (element && config) {
        emitFinallyEvent(element, config);
      }
    }
  }

  private resolveUrl(url: any, context: ExecutionContext): string | null {
    if (typeof url === 'string') {
      return url;
    }

    if (typeof url === 'function') {
      try {
        return String(url(context));
      } catch (error) {
        console.warn('Error resolving URL function:', error);
        return null;
      }
    }

    return null;
  }

  private buildConfig(url: string, options: any, context: ExecutionContext): any {
    const config = {
      url,
      method: this.options.method,
      headers: { ...this.options.headers },
      credentials: this.options.credentials,
      timeout: this.options.timeout,
      element: context.me,
      context,
      ...options,
    };

    // Parse common options
    if (options) {
      if (options.method) config.method = options.method;
      if (options.headers) config.headers = { ...config.headers, ...options.headers };
      if (options.body) config.body = options.body;
      if (options.target) config.target = this.resolveTarget(options.target, context);
      if (options.format) config.format = options.format;
    }

    return config;
  }

  private async executeRequest(config: any): Promise<Response> {
    const { url, method, headers, body, timeout, credentials } = config;

    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials,
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Add timeout support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async processResponse(response: Response, config: any): Promise<any> {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const format = config.format || 'text';

    switch (format.toLowerCase()) {
      case 'json':
        return await response.json();
      case 'text':
      case 'html':
        return await response.text();
      case 'blob':
        return await response.blob();
      case 'arrayBuffer':
        return await response.arrayBuffer();
      default:
        return await response.text();
    }
  }

  private resolveTarget(target: any, context: ExecutionContext): HTMLElement | null {
    if (target instanceof HTMLElement) {
      return target;
    }

    if (typeof target === 'string') {
      return document.querySelector(target);
    }

    // Default to context element
    return context.me as HTMLElement;
  }

  private async applyResult(target: HTMLElement, result: any, config: any): Promise<void> {
    if (!target || result == null) return;

    const placement = config.placement || 'innerHTML';

    switch (placement) {
      case 'innerHTML':
        target.innerHTML = String(result);
        break;
      case 'outerHTML':
        target.outerHTML = String(result);
        break;
      case 'textContent':
        target.textContent = String(result);
        break;
      case 'append':
        target.insertAdjacentHTML('beforeend', String(result));
        break;
      case 'prepend':
        target.insertAdjacentHTML('afterbegin', String(result));
        break;
      case 'before':
        target.insertAdjacentHTML('beforebegin', String(result));
        break;
      case 'after':
        target.insertAdjacentHTML('afterend', String(result));
        break;
      default:
        target.innerHTML = String(result);
    }
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'Fetch command requires a URL';
    }

    if (args.length > 2) {
      return 'Fetch command accepts at most two arguments: URL and options';
    }

    const url = args[0];
    if (typeof url !== 'string' && typeof url !== 'function') {
      return 'Fetch command URL must be a string or function';
    }

    return null;
  }
}