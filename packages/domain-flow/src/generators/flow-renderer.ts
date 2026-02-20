/**
 * FlowScript Natural Language Renderer
 *
 * Renders a SemanticNode back into natural-language FlowScript syntax
 * for a target language. Inverse of the parser — used by translate().
 */

import type { SemanticNode } from '@lokascript/framework';
import { extractRoleValue } from '@lokascript/framework';

// =============================================================================
// Keyword Tables
// =============================================================================

const COMMAND_KEYWORDS: Record<string, Record<string, string>> = {
  fetch: { en: 'fetch', es: 'obtener', ja: '取得', ar: 'جلب' },
  poll: { en: 'poll', es: 'sondear', ja: 'ポーリング', ar: 'استطلع' },
  stream: { en: 'stream', es: 'transmitir', ja: 'ストリーム', ar: 'بث' },
  submit: { en: 'submit', es: 'enviar', ja: '送信', ar: 'أرسل' },
  transform: { en: 'transform', es: 'transformar', ja: '変換', ar: 'حوّل' },
};

const MARKERS: Record<string, Record<string, string>> = {
  as: { en: 'as', es: 'como', ja: 'で', ar: 'ك' },
  into: { en: 'into', es: 'en', ja: 'に', ar: 'في' },
  every: { en: 'every', es: 'cada', ja: 'ごとに', ar: 'كل' },
  to: { en: 'to', es: 'a', ja: 'に', ar: 'إلى' },
  with: { en: 'with', es: 'con', ja: 'で', ar: 'ب' },
};

// =============================================================================
// Word Order Helpers
// =============================================================================

const SOV_LANGUAGES = new Set(['ja']);
const VSO_LANGUAGES = new Set(['ar']);

function isSOV(lang: string): boolean {
  return SOV_LANGUAGES.has(lang);
}

function kw(command: string, lang: string): string {
  return COMMAND_KEYWORDS[command]?.[lang] ?? command;
}

function mk(marker: string, lang: string): string {
  return MARKERS[marker]?.[lang] ?? marker;
}

// =============================================================================
// Per-Command Renderers
// =============================================================================

function renderFetch(node: SemanticNode, lang: string): string {
  const source = extractRoleValue(node, 'source') || '/';
  const style = extractRoleValue(node, 'style');
  const dest = extractRoleValue(node, 'destination');
  const verb = kw('fetch', lang);
  const parts: string[] = [];

  if (isSOV(lang)) {
    parts.push(source);
    if (style) parts.push(style, mk('as', lang));
    parts.push(verb);
    if (dest) parts.push(dest, mk('into', lang));
  } else {
    parts.push(verb, source);
    if (style) parts.push(mk('as', lang), style);
    if (dest) parts.push(mk('into', lang), dest);
  }

  return parts.join(' ');
}

function renderPoll(node: SemanticNode, lang: string): string {
  const source = extractRoleValue(node, 'source') || '/';
  const duration = extractRoleValue(node, 'duration') || '5s';
  const dest = extractRoleValue(node, 'destination');
  const verb = kw('poll', lang);
  const parts: string[] = [];

  if (isSOV(lang)) {
    parts.push(source);
    parts.push(duration, mk('every', lang));
    parts.push(verb);
    if (dest) parts.push(dest, mk('into', lang));
  } else {
    parts.push(verb, source);
    parts.push(mk('every', lang), duration);
    if (dest) parts.push(mk('into', lang), dest);
  }

  return parts.join(' ');
}

function renderStream(node: SemanticNode, lang: string): string {
  const source = extractRoleValue(node, 'source') || '/';
  const style = extractRoleValue(node, 'style');
  const dest = extractRoleValue(node, 'destination');
  const verb = kw('stream', lang);
  const parts: string[] = [];

  if (isSOV(lang)) {
    parts.push(source);
    if (style) parts.push(style, mk('as', lang));
    parts.push(verb);
    if (dest) parts.push(dest, mk('into', lang));
  } else {
    parts.push(verb, source);
    if (style) parts.push(mk('as', lang), style);
    if (dest) parts.push(mk('into', lang), dest);
  }

  return parts.join(' ');
}

function renderSubmit(node: SemanticNode, lang: string): string {
  const patient = extractRoleValue(node, 'patient') || '#form';
  const dest = extractRoleValue(node, 'destination') || '/';
  const style = extractRoleValue(node, 'style');
  const verb = kw('submit', lang);
  const parts: string[] = [];

  if (isSOV(lang)) {
    parts.push(patient);
    parts.push(dest, mk('to', lang));
    if (style) parts.push(style, mk('as', lang));
    parts.push(verb);
  } else {
    parts.push(verb, patient);
    parts.push(mk('to', lang), dest);
    if (style) parts.push(mk('as', lang), style);
  }

  return parts.join(' ');
}

function renderTransform(node: SemanticNode, lang: string): string {
  const patient = extractRoleValue(node, 'patient') || 'data';
  const instrument = extractRoleValue(node, 'instrument') || 'identity';
  const verb = kw('transform', lang);
  const parts: string[] = [];

  if (isSOV(lang)) {
    parts.push(patient);
    parts.push(instrument, mk('with', lang));
    parts.push(verb);
  } else {
    parts.push(verb, patient);
    parts.push(mk('with', lang), instrument);
  }

  return parts.join(' ');
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Render a FlowScript SemanticNode to natural-language text in the target language.
 */
export function renderFlow(node: SemanticNode, language: string): string {
  switch (node.action) {
    case 'fetch':
      return renderFetch(node, language);
    case 'poll':
      return renderPoll(node, language);
    case 'stream':
      return renderStream(node, language);
    case 'submit':
      return renderSubmit(node, language);
    case 'transform':
      return renderTransform(node, language);
    default:
      return `-- Unknown: ${node.action}`;
  }
}
