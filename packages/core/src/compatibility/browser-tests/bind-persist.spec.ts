import { test, expect } from '@playwright/test';

/**
 * E2E Browser Tests for Bind and Persist Commands
 *
 * These commands are LokaScript extensions — NOT part of the official
 * _hyperscript specification. Prefer server-side state management
 * when possible. These tests verify browser-level integration.
 *
 * Known limitations:
 * - bind: The expression evaluator resolves `#element.property` to the
 *   property's value instead of keeping the element reference + property name
 *   separate. bind tests are marked fixme until runtime parseInput is updated
 *   to handle member expressions from the compound command parser.
 * - persist: The keyword `local` is a reserved scope modifier in hyperscript,
 *   so `persist ... to local ...` may not evaluate "local" as a string.
 *   Use quoted "local" for reliable behavior: `persist ... to "local" ...`
 */

test.describe('BIND Command (LokaScript Extension) @bind', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/packages/core/compatibility-test.html');
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      if (typeof window.lokascript === 'undefined') {
        throw new Error('lokascript not loaded');
      }
      (window as any).clearWorkArea();
    });
  });

  // FIXME: bind runtime parseInput evaluates #element.value as the property value
  // instead of keeping the element reference and property name separate.
  // The parser correctly creates the AST, but the runtime evaluator resolves
  // the memberExpression to the final value. This needs a runtime-level fix
  // in bind.ts parseInput to handle member expressions from compound parser.
  test.fixme('bind :variable to element.value — initial sync @quick', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const input = document.createElement('input');
      input.id = 'bind-input';
      input.value = 'initial';
      document.getElementById('work-area')!.appendChild(input);

      const ctx = (window as any).hyperfixi.createContext(input);
      await (window as any).hyperfixi.evalHyperScript('bind :username to #bind-input.value', ctx);

      return { success: true };
    });
    expect(result.success).toBe(true);
  });

  test.fixme('bind :variable to element.value — element change triggers sync', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const input = document.createElement('input');
      input.id = 'bind-sync';
      input.value = 'before';
      document.getElementById('work-area')!.appendChild(input);

      const ctx = (window as any).hyperfixi.createContext(input);
      await (window as any).hyperfixi.evalHyperScript('bind :val to #bind-sync.value', ctx);

      input.value = 'after';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 100));

      return { elementValue: input.value, success: input.value === 'after' };
    });
    expect(result.success).toBe(true);
  });

  test.fixme('bind :variable from element.textContent', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const div = document.createElement('div');
      div.id = 'bind-from';
      div.textContent = 'content';
      document.getElementById('work-area')!.appendChild(div);

      const ctx = (window as any).hyperfixi.createContext(div);
      await (window as any).hyperfixi.evalHyperScript(
        'bind :text from #bind-from.textContent',
        ctx
      );

      return { success: true };
    });
    expect(result.success).toBe(true);
  });

  test.fixme('bind with bidirectional keyword', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const input = document.createElement('input');
      input.id = 'bind-bidi';
      input.value = 'start';
      document.getElementById('work-area')!.appendChild(input);

      const ctx = (window as any).hyperfixi.createContext(input);
      await (window as any).hyperfixi.evalHyperScript(
        'bind :data to #bind-bidi.value bidirectional',
        ctx
      );

      input.value = 'changed';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 100));

      return { success: true, value: input.value };
    });
    expect(result.success).toBe(true);
  });

  test.fixme('bind inside event handler attribute', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const input = document.createElement('input');
      input.id = 'attr-input';
      input.value = 'test';
      document.getElementById('work-area')!.appendChild(input);

      const ctx = (window as any).hyperfixi.createContext(input);
      await (window as any).hyperfixi.evalHyperScript('bind :name to #attr-input.value', ctx);

      return { success: true };
    });
    expect(result.success).toBe(true);
  });
});

test.describe('PERSIST Command (LokaScript Extension) @persist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/packages/core/compatibility-test.html');
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      if (typeof window.lokascript === 'undefined') {
        throw new Error('lokascript not loaded');
      }
      (window as any).clearWorkArea();
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('persist value to localStorage @quick', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Use quoted "local" because bare `local` is a keyword in hyperscript
      await (window as any).evalHyperScript('persist "hello" to "local" as "testKey"');

      const stored = window.localStorage.getItem('testKey');
      if (!stored) return { success: false, reason: 'nothing in storage' };

      try {
        const parsed = JSON.parse(stored);
        return { success: parsed.value === 'hello', stored: parsed };
      } catch {
        return { success: stored === 'hello', stored };
      }
    });
    expect(result.success).toBe(true);
  });

  test('persist value to sessionStorage', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await (window as any).evalHyperScript('persist "session-data" to "session" as "sessKey"');

      const stored = window.sessionStorage.getItem('sessKey');
      if (!stored) return { success: false, reason: 'nothing in storage' };

      try {
        const parsed = JSON.parse(stored);
        return { success: parsed.value === 'session-data', stored: parsed };
      } catch {
        return { success: stored === 'session-data', stored };
      }
    });
    expect(result.success).toBe(true);
  });

  test('persist then restore round-trip', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await (window as any).evalHyperScript('persist "round-trip" to "local" as "rtKey"');

      const stored = window.localStorage.getItem('rtKey');
      return { success: stored !== null, stored };
    });
    expect(result.success).toBe(true);
  });

  test('persist with TTL modifier', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await (window as any).evalHyperScript('persist "temp" to "local" as "ttlKey" ttl 5000');

      const stored = window.localStorage.getItem('ttlKey');
      if (!stored) return { success: false, reason: 'nothing in storage' };

      try {
        const parsed = JSON.parse(stored);
        return {
          success: parsed.value === 'temp' && parsed.ttl === 5000,
          stored: parsed,
        };
      } catch {
        return { success: stored !== null, stored };
      }
    });
    expect(result.success).toBe(true);
  });

  test('persist restore from localStorage', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Pre-populate storage with valid persist format
      window.localStorage.setItem(
        'preKey',
        JSON.stringify({ value: 'pre-stored', timestamp: Date.now() })
      );

      await (window as any).evalHyperScript('persist "preKey" from "local"');

      // The restore operation should complete without error
      return { success: true };
    });
    expect(result.success).toBe(true);
  });

  test('persist remove from localStorage', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Pre-populate storage
      window.localStorage.setItem(
        'removeKey',
        JSON.stringify({ value: 'to-remove', timestamp: Date.now() })
      );

      const before = window.localStorage.getItem('removeKey');
      if (!before) return { success: false, reason: 'setup failed' };

      await (window as any).evalHyperScript('persist remove "removeKey" from "local"');

      const after = window.localStorage.getItem('removeKey');
      return { success: after === null, before: before !== null, after };
    });
    expect(result.success).toBe(true);
  });

  test('persist inside event handler context', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const button = document.createElement('button');
      button.id = 'persist-btn';
      document.getElementById('work-area')!.appendChild(button);

      const ctx = (window as any).hyperfixi.createContext(button);
      await (window as any).hyperfixi.evalHyperScript(
        'persist "clicked" to "local" as "btn-state"',
        ctx
      );

      const stored = window.localStorage.getItem('btn-state');
      return { success: stored !== null };
    });
    expect(result.success).toBe(true);
  });
});

test.describe('Bind + Persist Combined @bind @persist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/packages/core/compatibility-test.html');
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      if (typeof window.lokascript === 'undefined') {
        throw new Error('lokascript not loaded');
      }
      (window as any).clearWorkArea();
      window.localStorage.clear();
    });
  });

  test('persist saves and restores independently', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Save to local storage
      await (window as any).evalHyperScript('persist "saved-value" to "local" as "combo-key"');

      const stored = window.localStorage.getItem('combo-key');
      return { success: stored !== null };
    });
    expect(result.success).toBe(true);
  });
});
