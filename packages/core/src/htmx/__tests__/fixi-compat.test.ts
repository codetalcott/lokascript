/**
 * Tests for fixi.js compatibility
 *
 * Tests the fixi-style attributes (fx-*) and fixi-specific features:
 * - fx-action, fx-method, fx-trigger, fx-target, fx-swap, fx-ignore
 * - Request dropping (anti-double-submit)
 * - Fixi event lifecycle: fx:init, fx:config, fx:before, fx:after, fx:error, fx:finally, fx:swapped
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  translateToHyperscript,
  hasFxAttributes,
  hasAnyAttributes,
  type HtmxConfig,
} from '../htmx-translator.js';
import { HtmxAttributeProcessor, FIXI_ATTRS } from '../htmx-attribute-processor.js';

describe('fixi-compat', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('attribute detection', () => {
    it('detects fx-action attribute', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api/data');
      expect(hasFxAttributes(button)).toBe(true);
    });

    it('returns false when no fixi attributes', () => {
      const button = document.createElement('button');
      expect(hasFxAttributes(button)).toBe(false);
    });

    it('hasAnyAttributes detects both htmx and fixi', () => {
      const htmxBtn = document.createElement('button');
      htmxBtn.setAttribute('hx-get', '/api');
      expect(hasAnyAttributes(htmxBtn)).toBe(true);

      const fixiBtn = document.createElement('button');
      fixiBtn.setAttribute('fx-action', '/api');
      expect(hasAnyAttributes(fixiBtn)).toBe(true);

      const plainBtn = document.createElement('button');
      expect(hasAnyAttributes(plainBtn)).toBe(false);
    });
  });

  describe('FIXI_ATTRS constant', () => {
    it('exports all fixi attributes', () => {
      expect(FIXI_ATTRS).toContain('fx-action');
      expect(FIXI_ATTRS).toContain('fx-method');
      expect(FIXI_ATTRS).toContain('fx-trigger');
      expect(FIXI_ATTRS).toContain('fx-target');
      expect(FIXI_ATTRS).toContain('fx-swap');
      expect(FIXI_ATTRS).toContain('fx-ignore');
    });
  });

  describe('collectFxAttributes', () => {
    let processor: HtmxAttributeProcessor;

    beforeEach(() => {
      processor = new HtmxAttributeProcessor({
        processExisting: false,
        watchMutations: false,
      });
    });

    it('collects fx-action as url', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api/users');
      const config = processor.collectFxAttributes(button);
      expect(config.url).toBe('/api/users');
    });

    it('collects fx-method (default GET)', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api');
      const config = processor.collectFxAttributes(button);
      expect(config.method).toBe('GET');
    });

    it('collects fx-method POST', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api');
      button.setAttribute('fx-method', 'POST');
      const config = processor.collectFxAttributes(button);
      expect(config.method).toBe('POST');
    });

    it('handles case-insensitive fx-method', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api');
      button.setAttribute('fx-method', 'post');
      const config = processor.collectFxAttributes(button);
      expect(config.method).toBe('POST');
    });

    it('collects fx-target', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api');
      button.setAttribute('fx-target', '#output');
      const config = processor.collectFxAttributes(button);
      expect(config.target).toBe('#output');
    });

    it('uses outerHTML as default swap (fixi behavior)', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api');
      const config = processor.collectFxAttributes(button);
      expect(config.swap).toBe('outerHTML');
    });

    it('collects custom fx-swap', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api');
      button.setAttribute('fx-swap', 'innerHTML');
      const config = processor.collectFxAttributes(button);
      expect(config.swap).toBe('innerHTML');
    });

    it('collects fx-trigger', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api');
      button.setAttribute('fx-trigger', 'submit');
      const config = processor.collectFxAttributes(button);
      expect(config.trigger).toBe('submit');
    });
  });

  describe('translateToHyperscript with fixi config', () => {
    it('translates basic fixi GET request', () => {
      const button = document.createElement('button');
      const config: HtmxConfig = {
        method: 'GET',
        url: '/api/users',
        swap: 'outerHTML', // fixi default
      };
      const result = translateToHyperscript(config, button);
      expect(result).toContain("fetch '/api/users'");
      expect(result).toContain('as html');
      expect(result).toContain('on click');
      expect(result).toContain('swap me with it'); // outerHTML
    });

    it('translates fixi POST request', () => {
      const button = document.createElement('button');
      const config: HtmxConfig = {
        method: 'POST',
        url: '/api/submit',
        swap: 'outerHTML',
      };
      const result = translateToHyperscript(config, button);
      expect(result).toContain("fetch '/api/submit' via POST");
    });

    it('translates fixi with target', () => {
      const button = document.createElement('button');
      const config: HtmxConfig = {
        method: 'GET',
        url: '/api/data',
        target: '#result',
        swap: 'innerHTML',
      };
      const result = translateToHyperscript(config, button);
      expect(result).toContain('swap innerHTML of #result with it');
    });
  });

  describe('manualProcess with fixi elements', () => {
    let processor: HtmxAttributeProcessor;

    beforeEach(() => {
      processor = new HtmxAttributeProcessor({
        processExisting: false,
        watchMutations: false,
      });
    });

    it('processes fixi element correctly', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api/data');
      button.setAttribute('fx-target', '#output');
      button.setAttribute('fx-swap', 'innerHTML');

      const result = processor.manualProcess(button);
      expect(result).toContain("fetch '/api/data'");
      expect(result).toContain('swap innerHTML of #output with it');
    });

    it('detects fixi vs htmx elements', () => {
      const fixiBtn = document.createElement('button');
      fixiBtn.setAttribute('fx-action', '/api/fixi');

      const htmxBtn = document.createElement('button');
      htmxBtn.setAttribute('hx-get', '/api/htmx');

      const fixiResult = processor.manualProcess(fixiBtn);
      const htmxResult = processor.manualProcess(htmxBtn);

      // Both should produce valid hyperscript
      expect(fixiResult).toContain("fetch '/api/fixi'");
      expect(htmxResult).toContain("fetch '/api/htmx'");
    });
  });

  describe('fx-ignore attribute', () => {
    let processor: HtmxAttributeProcessor;

    beforeEach(() => {
      processor = new HtmxAttributeProcessor({
        processExisting: false,
        watchMutations: false,
        root: document.body,
      });
    });

    it('excludes elements with fx-ignore', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button fx-action="/api/include">Include</button>
        <div fx-ignore>
          <button fx-action="/api/exclude">Exclude</button>
        </div>
      `;
      document.body.appendChild(container);

      const elements = processor.scanForHtmxElements(container);
      expect(elements.length).toBe(1);
      expect(elements[0].textContent).toBe('Include');

      document.body.removeChild(container);
    });

    it('excludes element with direct fx-ignore', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button fx-action="/api/include">Include</button>
        <button fx-action="/api/exclude" fx-ignore>Exclude</button>
      `;
      document.body.appendChild(container);

      const elements = processor.scanForHtmxElements(container);
      expect(elements.length).toBe(1);
      expect(elements[0].textContent).toBe('Include');

      document.body.removeChild(container);
    });
  });

  describe('request dropping', () => {
    let processor: HtmxAttributeProcessor;

    beforeEach(() => {
      processor = new HtmxAttributeProcessor({
        processExisting: false,
        watchMutations: false,
        requestDropping: true,
      });
    });

    it('hasPendingRequest returns false initially', () => {
      const button = document.createElement('button');
      expect(processor.hasPendingRequest(button)).toBe(false);
    });

    it('abortPendingRequest returns false when no pending', () => {
      const button = document.createElement('button');
      expect(processor.abortPendingRequest(button)).toBe(false);
    });
  });

  describe('fixi events', () => {
    let evtContainer: HTMLDivElement;
    let processor: HtmxAttributeProcessor;
    let mockExecute: ReturnType<typeof vi.fn<(code: string, element: Element) => Promise<void>>>;

    beforeEach(() => {
      evtContainer = document.createElement('div');
      document.body.appendChild(evtContainer);
      mockExecute = vi.fn().mockResolvedValue(undefined);
      processor = new HtmxAttributeProcessor({
        root: evtContainer,
        processExisting: false,
        watchMutations: false,
        fixiEvents: true,
        requestDropping: true,
      });
      processor.init(mockExecute);
    });

    afterEach(() => {
      processor.destroy();
      evtContainer.remove();
    });

    it('dispatches fx:init event for fixi elements', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api/test');
      evtContainer.appendChild(button);

      const fxInitHandler = vi.fn();
      button.addEventListener('fx:init', fxInitHandler);

      processor.processElement(button);

      expect(fxInitHandler).toHaveBeenCalled();
    });

    it('cancels processing when fx:init is cancelled', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api/test');
      evtContainer.appendChild(button);

      button.addEventListener('fx:init', e => e.preventDefault());

      processor.processElement(button);

      // Should not execute because fx:init was cancelled
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('dispatches fx:config event for fixi elements', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api/test');
      evtContainer.appendChild(button);

      const fxConfigHandler = vi.fn();
      button.addEventListener('fx:config', fxConfigHandler);

      processor.processElement(button);

      expect(fxConfigHandler).toHaveBeenCalled();
      const event = fxConfigHandler.mock.calls[0][0];
      expect(event.detail.cfg.action).toBe('/api/test');
      expect(event.detail.cfg.method).toBe('GET');
    });

    it('dispatches fx:before event for fixi elements', () => {
      const button = document.createElement('button');
      button.setAttribute('fx-action', '/api/test');
      evtContainer.appendChild(button);

      const fxBeforeHandler = vi.fn();
      button.addEventListener('fx:before', fxBeforeHandler);

      processor.processElement(button);

      expect(fxBeforeHandler).toHaveBeenCalled();
    });

    it('does not dispatch fixi events for htmx elements', () => {
      const button = document.createElement('button');
      button.setAttribute('hx-get', '/api/test');
      evtContainer.appendChild(button);

      const fxInitHandler = vi.fn();
      button.addEventListener('fx:init', fxInitHandler);

      processor.processElement(button);

      expect(fxInitHandler).not.toHaveBeenCalled();
    });
  });

  describe('combined htmx/fixi scanning', () => {
    let processor: HtmxAttributeProcessor;

    beforeEach(() => {
      processor = new HtmxAttributeProcessor({
        processExisting: false,
        watchMutations: false,
        root: document.body,
      });
    });

    it('scans both htmx and fixi elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button hx-get="/api/htmx">HTMX</button>
        <button fx-action="/api/fixi">Fixi</button>
      `;
      document.body.appendChild(container);

      const elements = processor.scanForHtmxElements(container);
      expect(elements.length).toBe(2);

      document.body.removeChild(container);
    });

    it('processes mixed htmx and fixi elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button hx-post="/api/htmx" hx-target="#a">HTMX</button>
        <button fx-action="/api/fixi" fx-method="POST" fx-target="#b">Fixi</button>
      `;
      document.body.appendChild(container);

      const elements = processor.scanForHtmxElements(container);

      // Process both and check they generate valid hyperscript
      for (const el of elements) {
        const result = processor.manualProcess(el);
        expect(result).toContain('fetch');
        expect(result).toContain('via POST');
      }

      document.body.removeChild(container);
    });
  });
});
