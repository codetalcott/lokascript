/**
 * Core HTTP request execution for HyperFixi
 * Handles fetch requests and response processing
 */

/** Minimal runtime interface needed by executor functions */
export interface HyperscriptRuntime {
  resolve(expression: unknown, context: unknown): Promise<unknown>;
}

/** Fetch options subset used by executor */
export interface FetchOptions {
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
}

/** Parsed command with optional fetch options */
export interface ParsedFetchCommand {
  options?: {
    method?: unknown;
    body?: unknown;
    headers?: unknown;
  };
}

/** Fixi-style configuration object */
export interface FixiConfig {
  url: string;
  method: string;
  body: BodyInit | null | undefined;
  headers: HeadersInit;
  target: Element;
  swap: string;
  trigger: Event;
  response: Response | null;
  text: string | null;
}

/**
 * Execute an HTTP request using the fetch API
 */
export async function executeHTTPRequest(
  url: string,
  options: Partial<FetchOptions> = {}
): Promise<{ response: Response; text: string }> {
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    body: options.body,
    headers: options.headers || {},
  };

  const response = await fetch(url, fetchOptions);
  const text = await response.text();

  return { response, text };
}

/**
 * Resolve dynamic expressions using hyperscript runtime
 */
export async function resolveExpression(
  expression: unknown,
  runtime: HyperscriptRuntime,
  context: unknown
): Promise<unknown> {
  if (!expression) return null;
  return await runtime.resolve(expression, context);
}

/**
 * Build fetch options from command configuration
 */
export async function buildFetchOptions(
  command: ParsedFetchCommand,
  runtime: HyperscriptRuntime,
  context: unknown
): Promise<Partial<FetchOptions>> {
  const options: Partial<FetchOptions> = {};

  if (command.options?.method) {
    options.method = (await resolveExpression(command.options.method, runtime, context)) as string;
  }

  if (command.options?.body) {
    options.body = (await resolveExpression(command.options.body, runtime, context)) as BodyInit;
  }

  if (command.options?.headers) {
    options.headers = (await resolveExpression(
      command.options.headers,
      runtime,
      context
    )) as HeadersInit;
  }

  return options;
}

/**
 * Create a fixi-style configuration object
 */
export function createFixiConfig(
  url: string,
  options: Partial<FetchOptions>,
  element: Element,
  event: Event,
  target: Element | null = null,
  swap: string = 'outerHTML'
): FixiConfig {
  return {
    url: url,
    method: (options.method as string) || 'GET',
    body: options.body,
    headers: options.headers || {},
    target: target || element,
    swap: swap,
    trigger: event,
    response: null,
    text: null,
  };
}
