/**
 * Route Extractor
 *
 * Extracts server route descriptors from parsed FlowScript commands.
 * Each fetch/poll/stream/submit URL becomes a RouteDescriptor that can
 * be fed into server-bridge for server-side code generation.
 */

import type { FlowSpec } from '../types.js';

/**
 * Lightweight route descriptor — compatible with server-bridge's RouteDescriptor
 * but self-contained to avoid a hard dependency on the server-bridge package.
 */
export interface FlowRouteDescriptor {
  /** URL path (e.g., /api/users, /api/user/{id}) */
  path: string;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Expected response format */
  responseFormat: 'json' | 'html' | 'text' | 'sse';
  /** Path parameters extracted from URL (e.g., ['id'] from /api/user/{id}) */
  pathParams: string[];
  /** Suggested handler function name */
  handlerName: string;
  /** Source command that produced this route */
  sourceCommand: string;
}

/**
 * Extract route descriptors from a FlowSpec.
 * Returns null for commands without URLs (e.g., transform).
 */
export function extractRoute(spec: FlowSpec): FlowRouteDescriptor | null {
  if (!spec.url) return null;

  const path = spec.url;
  const pathParams = extractPathParams(path);
  const handlerName = generateHandlerName(spec);

  return {
    path,
    method: spec.method || 'GET',
    responseFormat: spec.responseFormat || 'text',
    pathParams,
    handlerName,
    sourceCommand: spec.action,
  };
}

/**
 * Extract multiple route descriptors from an array of FlowSpecs.
 * Filters out nulls (commands without URLs).
 */
export function extractRoutes(specs: FlowSpec[]): FlowRouteDescriptor[] {
  return specs.map(extractRoute).filter((r): r is FlowRouteDescriptor => r !== null);
}

/**
 * Extract path parameters from a URL.
 * Supports both {param} and :param syntax.
 */
function extractPathParams(url: string): string[] {
  const params: string[] = [];

  // {param} syntax
  const braceMatches = url.matchAll(/\{(\w+)\}/g);
  for (const match of braceMatches) {
    params.push(match[1]);
  }

  // :param syntax
  const colonMatches = url.matchAll(/:(\w+)/g);
  for (const match of colonMatches) {
    params.push(match[1]);
  }

  return params;
}

/**
 * Generate a suggested handler function name from a FlowSpec.
 */
function generateHandlerName(spec: FlowSpec): string {
  if (!spec.url) return 'handler';

  // Extract the last meaningful path segment
  const segments = spec.url
    .split('/')
    .filter(s => s && !s.startsWith('{') && !s.startsWith(':') && !s.includes('?'));
  const lastSegment = segments[segments.length - 1] || 'data';

  const prefix =
    spec.method === 'POST'
      ? 'create'
      : spec.method === 'PUT'
        ? 'update'
        : spec.method === 'DELETE'
          ? 'delete'
          : 'get';

  // Capitalize first letter
  const name = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  return `${prefix}${name}`;
}
