/**
 * HTML Fixture Generator
 *
 * Generates minimal HTML pages that contain all elements referenced
 * by a BehaviorSpec. Used by test renderers to create test fixtures.
 */

import type { AbstractOperation, BehaviorSpec, TargetRef } from '../operations/types.js';

// =============================================================================
// Public API
// =============================================================================

/**
 * Generate a minimal HTML fixture for a behavior spec.
 *
 * @param spec - The behavior to create a fixture for
 * @param hyperscript - Original hyperscript source to embed as `_="..."` attribute
 */
export function generateFixture(spec: BehaviorSpec, hyperscript?: string): string {
  const elements = collectElements(spec);
  const triggerSelector = targetToSelector(spec.triggerTarget);

  // When trigger is 'self', the hyperscript attribute goes on the first
  // operation target (since 'self' means the element the script is on).
  // When trigger is a specific selector, check if it matches an operation target.
  const triggerIsSeparate =
    triggerSelector !== null && !elements.some(e => e.selector === triggerSelector);

  // Track whether the _= attribute has been placed on an element
  let hyperscriptPlaced = false;

  const lines: string[] = [];

  // Add initial styles for visibility tests
  if (needsInitialStyles(spec.operations)) {
    lines.push('<style>');
    for (const op of spec.operations) {
      if (op.op === 'hide') {
        const sel = targetToSelector(op.target);
        if (sel) lines.push(`  ${sel} { display: block; }`);
      }
      if (op.op === 'show') {
        const sel = targetToSelector(op.target);
        if (sel) lines.push(`  ${sel} { display: none; }`);
      }
    }
    lines.push('</style>');
  }

  // Generate elements
  if (triggerIsSeparate) {
    // Trigger element is separate from targets
    const triggerEl = createTriggerElement(triggerSelector!, hyperscript);
    lines.push(triggerEl);
    hyperscriptPlaced = true;
  }

  for (const el of elements) {
    // Place _= attribute on this element if:
    // 1. It matches the trigger selector, OR
    // 2. Trigger is 'self' and this is the first element (hasn't been placed yet)
    const isTrigger =
      (!triggerIsSeparate && el.selector === triggerSelector) ||
      (triggerSelector === null && !hyperscriptPlaced);
    const attrs = isTrigger && hyperscript ? ` _="${escapeAttr(hyperscript)}"` : '';
    if (isTrigger && hyperscript) hyperscriptPlaced = true;
    const extraClasses = getInitialClasses(el.selector, spec.operations);

    let tag = el.tag;
    let className = el.className;
    if (extraClasses.length > 0) {
      className = className ? `${className} ${extraClasses.join(' ')}` : extraClasses.join(' ');
    }

    const classAttr = className ? ` class="${className}"` : '';
    const idAttr = el.id ? ` id="${el.id}"` : '';

    if (tag === 'input') {
      lines.push(`<${tag}${idAttr}${classAttr}${attrs} />`);
    } else {
      const content = el.defaultContent ?? '';
      lines.push(`<${tag}${idAttr}${classAttr}${attrs}>${content}</${tag}>`);
    }
  }

  // If trigger is self and no explicit elements, create a self-targeting button
  if (elements.length === 0 && spec.triggerTarget.kind === 'self') {
    const attr = hyperscript ? ` _="${escapeAttr(hyperscript)}"` : '';
    lines.push(`<button id="trigger"${attr}>Click me</button>`);
  }

  return lines.join('\n');
}

// =============================================================================
// Element Collection
// =============================================================================

interface FixtureElement {
  selector: string;
  id?: string;
  className?: string;
  tag: string;
  defaultContent?: string;
}

function collectElements(spec: BehaviorSpec): FixtureElement[] {
  const seen = new Set<string>();
  const elements: FixtureElement[] = [];

  for (const op of spec.operations) {
    for (const ref of getTargetRefs(op)) {
      if (ref.kind !== 'selector') continue;
      if (seen.has(ref.value)) continue;
      seen.add(ref.value);

      elements.push(selectorToElement(ref.value));
    }
  }

  return elements;
}

function getTargetRefs(op: AbstractOperation): TargetRef[] {
  const refs: TargetRef[] = [];

  if ('target' in op && op.target) {
    refs.push(op.target as TargetRef);
  }

  return refs;
}

function selectorToElement(selector: string): FixtureElement {
  // ID selector: #foo
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    return {
      selector,
      id,
      tag: inferTagFromId(id),
      defaultContent: inferContent(id),
    };
  }

  // Class selector: .foo
  if (selector.startsWith('.')) {
    const className = selector.slice(1);
    return {
      selector,
      className,
      tag: 'div',
      defaultContent: className,
    };
  }

  // Attribute or complex selector — use div
  return {
    selector,
    tag: 'div',
    defaultContent: '',
  };
}

// =============================================================================
// Smart Element Type Inference
// =============================================================================

const BUTTON_IDS = new Set(['btn', 'button', 'submit', 'trigger', 'action']);
const INPUT_IDS = new Set(['input', 'search', 'email', 'text', 'field', 'query']);
const FORM_IDS = new Set(['form', 'signup', 'login']);
const DIALOG_IDS = new Set(['modal', 'dialog', 'popup', 'overlay']);
const LIST_IDS = new Set(['list', 'items', 'results', 'options']);

function inferTagFromId(id: string): string {
  const lower = id.toLowerCase();
  if (BUTTON_IDS.has(lower)) return 'button';
  if (INPUT_IDS.has(lower)) return 'input';
  if (FORM_IDS.has(lower)) return 'form';
  if (DIALOG_IDS.has(lower)) return 'div';
  if (LIST_IDS.has(lower)) return 'ul';
  return 'div';
}

function inferContent(id: string): string {
  const lower = id.toLowerCase();
  if (BUTTON_IDS.has(lower)) return 'Click';
  if (INPUT_IDS.has(lower)) return '';
  if (LIST_IDS.has(lower)) return '';
  // Capitalize first letter
  return id.charAt(0).toUpperCase() + id.slice(1);
}

// =============================================================================
// Helpers
// =============================================================================

function createTriggerElement(selector: string, hyperscript?: string): string {
  const attr = hyperscript ? ` _="${escapeAttr(hyperscript)}"` : '';
  // If the trigger selector refers to an existing element type, use it
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    return `<button id="${id}"${attr}>Click</button>`;
  }
  return `<button id="trigger"${attr}>Click</button>`;
}

function targetToSelector(ref: TargetRef): string | null {
  if (ref.kind === 'selector') return ref.value;
  if (ref.kind === 'self') return null;
  return null;
}

function needsInitialStyles(ops: AbstractOperation[]): boolean {
  return ops.some(op => op.op === 'hide' || op.op === 'show');
}

function getInitialClasses(selector: string, ops: AbstractOperation[]): string[] {
  const classes: string[] = [];
  for (const op of ops) {
    if (op.op === 'removeClass' && 'target' in op) {
      const targetSel = targetToSelector(op.target);
      if (targetSel === selector || (op.target.kind === 'self' && selector === null)) {
        classes.push(op.className);
      }
    }
  }
  return classes;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
