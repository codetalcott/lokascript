/**
 * FlowScript Domain Types
 *
 * Output types for the FlowScript code generator. FlowSpec captures the
 * semantic intent of a data flow command — URL, method, response format,
 * target element, polling interval — ready for compilation to vanilla JS,
 * HTMX attributes, or route descriptors.
 */

export type FlowAction = 'fetch' | 'poll' | 'stream' | 'submit' | 'transform';

/**
 * Structured data flow specification.
 *
 * Output of domain-flow's code generator. Can be used to:
 * - Generate vanilla JS (fetch, EventSource, setInterval)
 * - Generate HTMX attributes (hx-get, hx-trigger, hx-target)
 * - Extract route descriptors for server-bridge
 */
export interface FlowSpec {
  /** The command that produced this spec */
  action: FlowAction;

  /** URL for source commands (fetch, poll, stream, submit destination) */
  url?: string;

  /** HTTP method inferred from command type */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /** Response format */
  responseFormat?: 'json' | 'html' | 'text' | 'sse';

  /** Target CSS selector for DOM insertion */
  target?: string;

  /** Polling interval in milliseconds (poll command) */
  intervalMs?: number;

  /** Form selector (submit command) */
  formSelector?: string;

  /** Transform function or format string (transform command) */
  transformFn?: string;

  /** Metadata for debugging */
  metadata: {
    /** Language the command was written in */
    sourceLanguage: string;
    /** Raw role values extracted from the parsed command */
    roles: Record<string, string | undefined>;
  };
}
