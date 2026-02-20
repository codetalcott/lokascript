/**
 * FlowScript Command Schemas
 *
 * Defines the semantic structure of data flow commands using the framework's
 * defineCommand/defineRole helpers. Each schema specifies roles (source, destination,
 * style, duration, etc.) and per-language marker overrides for 4 languages.
 */

import { defineCommand, defineRole } from '@lokascript/framework';

// =============================================================================
// FETCH — Single HTTP request with target
// =============================================================================

export const fetchSchema = defineCommand({
  action: 'fetch',
  description: 'Fetch data from a URL and deliver to a target element',
  category: 'source',
  primaryRole: 'source',
  roles: [
    defineRole({
      role: 'source',
      description: 'URL to fetch from',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 2,
      sovPosition: 2,
    }),
    defineRole({
      role: 'style',
      description: 'Response format (json, html, text)',
      required: false,
      expectedTypes: ['expression'],
      svoPosition: 1,
      sovPosition: 1,
      markerOverride: {
        en: 'as',
        es: 'como',
        ja: 'で',
        ar: 'ك',
      },
    }),
    defineRole({
      role: 'destination',
      description: 'Target element to deliver data to',
      required: false,
      expectedTypes: ['selector', 'expression'],
      svoPosition: 0,
      sovPosition: 0,
      markerOverride: {
        en: 'into',
        es: 'en',
        ja: 'に',
        ar: 'في',
      },
    }),
  ],
});

// =============================================================================
// POLL — Repeated fetch with interval
// =============================================================================

export const pollSchema = defineCommand({
  action: 'poll',
  description: 'Repeatedly fetch data at a specified interval',
  category: 'source',
  primaryRole: 'source',
  roles: [
    defineRole({
      role: 'source',
      description: 'URL to poll',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 3,
      sovPosition: 3,
    }),
    defineRole({
      role: 'duration',
      description: 'Polling interval (e.g., 5s, 30s, 1m)',
      required: true,
      expectedTypes: ['expression', 'literal'],
      svoPosition: 2,
      sovPosition: 2,
      markerOverride: {
        en: 'every',
        es: 'cada',
        ja: 'ごとに',
        ar: 'كل',
      },
    }),
    defineRole({
      role: 'destination',
      description: 'Target element for poll results',
      required: false,
      expectedTypes: ['selector', 'expression'],
      svoPosition: 1,
      sovPosition: 1,
      markerOverride: {
        en: 'into',
        es: 'en',
        ja: 'に',
        ar: 'في',
      },
    }),
  ],
});

// =============================================================================
// STREAM — Server-Sent Events connection
// =============================================================================

export const streamSchema = defineCommand({
  action: 'stream',
  description: 'Open a streaming connection (SSE) to a URL',
  category: 'source',
  primaryRole: 'source',
  roles: [
    defineRole({
      role: 'source',
      description: 'URL for SSE stream',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 2,
      sovPosition: 2,
    }),
    defineRole({
      role: 'style',
      description: 'Stream type (sse)',
      required: false,
      expectedTypes: ['expression'],
      svoPosition: 1,
      sovPosition: 1,
      markerOverride: {
        en: 'as',
        es: 'como',
        ja: 'で',
        ar: 'ك',
      },
    }),
    defineRole({
      role: 'destination',
      description: 'Target element for streamed data',
      required: false,
      expectedTypes: ['selector', 'expression'],
      svoPosition: 0,
      sovPosition: 0,
      markerOverride: {
        en: 'into',
        es: 'en',
        ja: 'に',
        ar: 'في',
      },
    }),
  ],
});

// =============================================================================
// SUBMIT — Form submission
// =============================================================================

export const submitSchema = defineCommand({
  action: 'submit',
  description: 'Submit form data to a URL',
  category: 'action',
  primaryRole: 'patient',
  roles: [
    defineRole({
      role: 'patient',
      description: 'Form element to submit',
      required: true,
      expectedTypes: ['selector', 'expression'],
      svoPosition: 2,
      sovPosition: 1,
    }),
    defineRole({
      role: 'destination',
      description: 'URL to submit to',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 1,
      sovPosition: 2,
      markerOverride: {
        en: 'to',
        es: 'a',
        ja: 'に',
        ar: 'إلى',
      },
    }),
    defineRole({
      role: 'style',
      description: 'Request encoding (json, form, multipart)',
      required: false,
      expectedTypes: ['expression'],
      svoPosition: 0,
      sovPosition: 0,
      markerOverride: {
        en: 'as',
        es: 'como',
        ja: 'で',
        ar: 'ك',
      },
    }),
  ],
});

// =============================================================================
// TRANSFORM — Data transformation step
// =============================================================================

export const transformSchema = defineCommand({
  action: 'transform',
  description: 'Transform data using a function or format string',
  category: 'transform',
  primaryRole: 'patient',
  roles: [
    defineRole({
      role: 'patient',
      description: 'Data to transform',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 2,
      sovPosition: 1,
    }),
    defineRole({
      role: 'instrument',
      description: 'Transform function, format string, or mapping',
      required: true,
      expectedTypes: ['expression', 'literal'],
      svoPosition: 1,
      sovPosition: 2,
      markerOverride: {
        en: 'with',
        es: 'con',
        ja: 'で',
        ar: 'ب',
      },
    }),
  ],
});

// =============================================================================
// All Schemas
// =============================================================================

export const allSchemas = [fetchSchema, pollSchema, streamSchema, submitSchema, transformSchema];
