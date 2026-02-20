/**
 * HTMX Attribute Generator
 *
 * Transforms a FlowSpec into HTMX-compatible HTML attributes.
 * Maps fetch → hx-get, poll → hx-get + hx-trigger, submit → hx-post.
 * Stream (SSE) has no direct HTMX equivalent — returns null with a note.
 */

import type { FlowSpec } from '../types.js';

export interface HTMXAttributes {
  /** Generated HTMX attribute map */
  attrs: Record<string, string>;
  /** Notes about limitations or warnings */
  notes: string[];
}

/**
 * Generate HTMX attributes from a FlowSpec.
 *
 * @returns HTMXAttributes with attr map and notes, or null if the command
 *          has no HTMX equivalent (e.g., transform)
 */
export function generateHTMX(spec: FlowSpec): HTMXAttributes | null {
  switch (spec.action) {
    case 'fetch':
      return generateFetchHTMX(spec);
    case 'poll':
      return generatePollHTMX(spec);
    case 'stream':
      return generateStreamHTMX(spec);
    case 'submit':
      return generateSubmitHTMX(spec);
    case 'transform':
      return null; // No HTMX equivalent for data transforms
    default:
      return null;
  }
}

function generateFetchHTMX(spec: FlowSpec): HTMXAttributes {
  const attrs: Record<string, string> = {};
  const notes: string[] = [];

  if (spec.url) {
    attrs['hx-get'] = spec.url;
  }

  if (spec.target) {
    attrs['hx-target'] = spec.target;
  }

  attrs['hx-swap'] = 'innerHTML';

  if (spec.responseFormat === 'json') {
    notes.push(
      'HTMX expects HTML responses by default. For JSON, use hx-ext="json-enc" or handle in a hyperscript handler.'
    );
  }

  return { attrs, notes };
}

function generatePollHTMX(spec: FlowSpec): HTMXAttributes {
  const attrs: Record<string, string> = {};
  const notes: string[] = [];

  if (spec.url) {
    attrs['hx-get'] = spec.url;
  }

  if (spec.intervalMs) {
    const seconds = spec.intervalMs / 1000;
    attrs['hx-trigger'] = `every ${seconds}s`;
  }

  if (spec.target) {
    attrs['hx-target'] = spec.target;
  }

  attrs['hx-swap'] = 'innerHTML';

  return { attrs, notes };
}

function generateStreamHTMX(spec: FlowSpec): HTMXAttributes {
  const attrs: Record<string, string> = {};
  const notes: string[] = [];

  if (spec.url) {
    attrs['hx-ext'] = 'sse';
    attrs['sse-connect'] = spec.url;
    attrs['sse-swap'] = 'message';
  }

  if (spec.target) {
    attrs['hx-target'] = spec.target;
  }

  notes.push('SSE support requires the htmx sse extension (hx-ext="sse").');

  return { attrs, notes };
}

function generateSubmitHTMX(spec: FlowSpec): HTMXAttributes {
  const attrs: Record<string, string> = {};
  const notes: string[] = [];

  if (spec.url) {
    attrs['hx-post'] = spec.url;
  }

  if (spec.responseFormat === 'json') {
    attrs['hx-ext'] = 'json-enc';
    attrs['hx-encoding'] = 'application/json';
  }

  if (spec.target) {
    attrs['hx-target'] = spec.target;
  }

  return { attrs, notes };
}
