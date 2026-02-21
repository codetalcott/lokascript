/**
 * Voice/Accessibility Code Generator
 *
 * Transforms semantic AST nodes into executable JavaScript snippets
 * for DOM manipulation, navigation, and accessibility actions.
 */

import type { CodeGenerator, SemanticNode } from '@lokascript/framework';
import { extractRoleValue } from '@lokascript/framework';

// =============================================================================
// String Escaping
// =============================================================================

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// =============================================================================
// Shared Element-Finding Helper (injected into generated code)
// =============================================================================

const FIND_EL = [
  `function _findEl(q, root) {`,
  `  root = root || document;`,
  `  if (q.startsWith('#') || q.startsWith('.') || q.includes('[')) {`,
  `    try { return root.querySelector(q); } catch(e) {}`,
  `  }`,
  `  var el = root.querySelector('[aria-label="' + q + '"]');`,
  `  if (el) return el;`,
  `  el = root.querySelector('[role="' + q + '"]');`,
  `  if (el) return el;`,
  `  var candidates = root.querySelectorAll('button, a, input, [role="button"], [tabindex]');`,
  `  var lq = q.toLowerCase();`,
  `  for (var i = 0; i < candidates.length; i++) {`,
  `    if ((candidates[i].textContent || '').toLowerCase().includes(lq)) return candidates[i];`,
  `    if ((candidates[i].getAttribute('aria-label') || '').toLowerCase().includes(lq)) return candidates[i];`,
  `  }`,
  `  return null;`,
  `}`,
].join('\n');

// =============================================================================
// Per-Command Generators
// =============================================================================

function generateNavigate(node: SemanticNode): string {
  const dest = extractRoleValue(node, 'destination');
  if (!dest) return '// navigate: missing destination';
  if (dest.startsWith('/') || dest.startsWith('http')) {
    return `window.location.href = '${esc(dest)}';`;
  }
  return [
    FIND_EL,
    `var el = _findEl('${esc(dest)}');`,
    `if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });`,
    `else window.location.hash = '${esc(dest)}';`,
  ].join('\n');
}

function generateClick(node: SemanticNode): string {
  const patient = extractRoleValue(node, 'patient');
  if (!patient) return '// click: missing target';
  return [FIND_EL, `var el = _findEl('${esc(patient)}');`, `if (el) el.click();`].join('\n');
}

function generateType(node: SemanticNode): string {
  const text = extractRoleValue(node, 'patient');
  if (!text) return '// type: missing text';
  const dest = extractRoleValue(node, 'destination');
  const target = dest
    ? `_findEl('${esc(dest)}') || document.activeElement`
    : `document.activeElement`;
  return [
    FIND_EL,
    `var el = ${target};`,
    `if (el && ('value' in el || el.isContentEditable)) {`,
    `  if ('value' in el) { el.value = (el.value || '') + '${esc(text)}'; }`,
    `  else { el.textContent = (el.textContent || '') + '${esc(text)}'; }`,
    `  el.dispatchEvent(new Event('input', { bubbles: true }));`,
    `}`,
  ].join('\n');
}

function generateScroll(node: SemanticNode): string {
  const manner = (extractRoleValue(node, 'manner') || 'down').toLowerCase();
  const quantity = extractRoleValue(node, 'quantity');
  const px = quantity ? parseInt(quantity, 10) || 300 : 300;

  switch (manner) {
    case 'up':
      return `window.scrollBy({ top: -${px}, behavior: 'smooth' });`;
    case 'down':
      return `window.scrollBy({ top: ${px}, behavior: 'smooth' });`;
    case 'left':
      return `window.scrollBy({ left: -${px}, behavior: 'smooth' });`;
    case 'right':
      return `window.scrollBy({ left: ${px}, behavior: 'smooth' });`;
    case 'top':
      return `window.scrollTo({ top: 0, behavior: 'smooth' });`;
    case 'bottom':
      return `window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });`;
    default:
      return `window.scrollBy({ top: ${px}, behavior: 'smooth' });`;
  }
}

function generateRead(node: SemanticNode): string {
  const patient = extractRoleValue(node, 'patient');
  if (!patient) return '// read: missing target';
  return [
    FIND_EL,
    `var el = _findEl('${esc(patient)}');`,
    `if (el && el.textContent) {`,
    `  var utterance = new SpeechSynthesisUtterance(el.textContent);`,
    `  speechSynthesis.speak(utterance);`,
    `}`,
  ].join('\n');
}

function generateZoom(node: SemanticNode): string {
  const manner = (extractRoleValue(node, 'manner') || 'in').toLowerCase();
  if (manner === 'reset') {
    return `document.body.style.zoom = '100%';`;
  }
  const delta = manner === 'out' ? -10 : 10;
  return [
    `var current = parseFloat(document.body.style.zoom || '100');`,
    `document.body.style.zoom = (current + ${delta}) + '%';`,
  ].join('\n');
}

function generateSelect(node: SemanticNode): string {
  const patient = extractRoleValue(node, 'patient');
  if (!patient) return '// select: missing target';
  if (patient === 'all' || patient === 'todo' || patient === '全て' || patient === '全部') {
    return `document.execCommand('selectAll');`;
  }
  return [
    FIND_EL,
    `var el = _findEl('${esc(patient)}');`,
    `if (el) {`,
    `  var range = document.createRange();`,
    `  range.selectNodeContents(el);`,
    `  var sel = window.getSelection();`,
    `  sel.removeAllRanges();`,
    `  sel.addRange(range);`,
    `}`,
  ].join('\n');
}

function generateBack(node: SemanticNode): string {
  const quantity = extractRoleValue(node, 'quantity');
  const n = quantity ? parseInt(quantity, 10) || 1 : 1;
  return `history.go(-${n});`;
}

function generateForward(node: SemanticNode): string {
  const quantity = extractRoleValue(node, 'quantity');
  const n = quantity ? parseInt(quantity, 10) || 1 : 1;
  return `history.go(${n});`;
}

function generateFocus(node: SemanticNode): string {
  const patient = extractRoleValue(node, 'patient');
  if (!patient) return '// focus: missing target';
  return [FIND_EL, `var el = _findEl('${esc(patient)}');`, `if (el) el.focus();`].join('\n');
}

function generateClose(node: SemanticNode): string {
  const patient = (extractRoleValue(node, 'patient') || '').toLowerCase();
  if (patient === 'tab' || patient === 'pestaña' || patient === 'タブ' || patient === 'onglet') {
    return `window.close();`;
  }
  if (
    patient === 'dialog' ||
    patient === 'modal' ||
    patient === 'diálogo' ||
    patient === 'ダイアログ' ||
    patient === 'dialogue'
  ) {
    return `var d = document.querySelector('dialog[open]'); if (d) d.close();`;
  }
  // Default: try to close any open dialog or modal
  return [
    `var d = document.querySelector('dialog[open]');`,
    `if (d) { d.close(); }`,
    `else {`,
    `  var m = document.querySelector('[role="dialog"], .modal.show, .modal.open');`,
    `  if (m) m.remove();`,
    `}`,
  ].join('\n');
}

function generateOpen(node: SemanticNode): string {
  const patient = extractRoleValue(node, 'patient');
  if (!patient) return '// open: missing target';
  if (patient.startsWith('/') || patient.startsWith('http')) {
    return `window.open('${esc(patient)}', '_blank');`;
  }
  return [FIND_EL, `var el = _findEl('${esc(patient)}');`, `if (el) el.click();`].join('\n');
}

function generateSearch(node: SemanticNode): string {
  const query = extractRoleValue(node, 'patient');
  if (!query) return '// search: missing query';
  const dest = extractRoleValue(node, 'destination');
  if (
    dest === 'page' ||
    dest === 'página' ||
    dest === 'ページ' ||
    dest === 'الصفحة' ||
    dest === '페이지' ||
    dest === '页面' ||
    dest === 'sayfa'
  ) {
    return `window.find('${esc(query)}');`;
  }
  const selector = dest
    ? `'${esc(dest)}'`
    : `'input[type="search"], [role="searchbox"], input[name="q"], input[name="search"]'`;
  return [
    `var searchInput = document.querySelector(${selector});`,
    `if (searchInput) {`,
    `  searchInput.value = '${esc(query)}';`,
    `  searchInput.dispatchEvent(new Event('input', { bubbles: true }));`,
    `  if (searchInput.form) searchInput.form.submit();`,
    `}`,
  ].join('\n');
}

function generateHelp(node: SemanticNode): string {
  const topic = extractRoleValue(node, 'patient');
  const commands = [
    'navigate',
    'click',
    'type',
    'scroll',
    'read',
    'zoom',
    'select',
    'back',
    'forward',
    'focus',
    'close',
    'open',
    'search',
    'help',
  ];
  if (topic) {
    return `console.log('Help: ${esc(topic)}');`;
  }
  return `console.log('Available commands: ${commands.join(', ')}');`;
}

// =============================================================================
// Public Code Generator
// =============================================================================

export const voiceCodeGenerator: CodeGenerator = {
  generate(node: SemanticNode): string {
    switch (node.action) {
      case 'navigate':
        return generateNavigate(node);
      case 'click':
        return generateClick(node);
      case 'type':
        return generateType(node);
      case 'scroll':
        return generateScroll(node);
      case 'read':
        return generateRead(node);
      case 'zoom':
        return generateZoom(node);
      case 'select':
        return generateSelect(node);
      case 'back':
        return generateBack(node);
      case 'forward':
        return generateForward(node);
      case 'focus':
        return generateFocus(node);
      case 'close':
        return generateClose(node);
      case 'open':
        return generateOpen(node);
      case 'search':
        return generateSearch(node);
      case 'help':
        return generateHelp(node);
      default:
        return `// Unknown voice command: ${node.action}`;
    }
  },
};
