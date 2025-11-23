/**
 * Unit Tests for Smart Element Toggle Support
 * Tests details and select element toggle functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToggleCommand } from './toggle';
import type { TypedExecutionContext } from '../../types/command-types';

describe('ToggleCommand - Smart Element Support', () => {
  let toggleCommand: ToggleCommand;
  let mockContext: TypedExecutionContext;

  beforeEach(() => {
    toggleCommand = new ToggleCommand();

    // Create mock context
    mockContext = {
      me: null,
      it: null,
      you: null,
      result: null,
      target: null,
      detail: null,
      locals: new Map(),
      event: null,
    } as any;
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
  });

  describe('Details Element Toggle', () => {
    let testDetails: HTMLDetailsElement;

    beforeEach(() => {
      testDetails = document.createElement('details');
      testDetails.id = 'test-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Click to expand';
      testDetails.appendChild(summary);
      const content = document.createElement('p');
      content.textContent = 'Hidden content';
      testDetails.appendChild(content);
      document.body.appendChild(testDetails);
    });

    it('should detect details element by ID selector', async () => {
      const result = await toggleCommand.execute(mockContext, '#test-details');

      expect(result.success).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value?.[0]).toBe(testDetails);
    });

    it('should open closed details element', async () => {
      expect(testDetails.open).toBe(false);

      const result = await toggleCommand.execute(mockContext, '#test-details');

      expect(result.success).toBe(true);
      expect(testDetails.open).toBe(true);
    });

    it('should close open details element', async () => {
      testDetails.open = true;
      expect(testDetails.open).toBe(true);

      const result = await toggleCommand.execute(mockContext, '#test-details');

      expect(result.success).toBe(true);
      expect(testDetails.open).toBe(false);
    });

    it('should toggle details multiple times', async () => {
      // First toggle: open
      await toggleCommand.execute(mockContext, '#test-details');
      expect(testDetails.open).toBe(true);

      // Second toggle: close
      await toggleCommand.execute(mockContext, '#test-details');
      expect(testDetails.open).toBe(false);

      // Third toggle: open again
      await toggleCommand.execute(mockContext, '#test-details');
      expect(testDetails.open).toBe(true);
    });

    it('should dispatch hyperscript:toggle event for details', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      testDetails.addEventListener('hyperscript:toggle', ((e: CustomEvent) => {
        eventFired = true;
        eventDetail = e.detail;
      }) as EventListener);

      await toggleCommand.execute(mockContext, '#test-details');

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeDefined();
      expect(eventDetail.type).toBe('details');
      expect(eventDetail.state).toBe('opened');
    });

    it('should toggle multiple details elements', async () => {
      // Create second details element
      const details2 = document.createElement('details');
      details2.id = 'details2';
      document.body.appendChild(details2);

      testDetails.className = 'faq';
      details2.className = 'faq';

      // Using tag selector should find all details
      const result = await toggleCommand.execute(mockContext, 'details');

      expect(result.success).toBe(true);
      expect(result.value!.length).toBeGreaterThanOrEqual(2);
      expect(testDetails.open).toBe(true);
      expect(details2.open).toBe(true);
    });
  });

  describe('Select Element Toggle', () => {
    let testSelect: HTMLSelectElement;

    beforeEach(() => {
      testSelect = document.createElement('select');
      testSelect.id = 'test-select';
      const option1 = document.createElement('option');
      option1.value = '1';
      option1.textContent = 'Option 1';
      const option2 = document.createElement('option');
      option2.value = '2';
      option2.textContent = 'Option 2';
      testSelect.appendChild(option1);
      testSelect.appendChild(option2);
      document.body.appendChild(testSelect);
    });

    it('should detect select element by ID selector', async () => {
      const result = await toggleCommand.execute(mockContext, '#test-select');

      expect(result.success).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value?.[0]).toBe(testSelect);
    });

    it('should focus select element when closed', async () => {
      expect(document.activeElement).not.toBe(testSelect);

      const result = await toggleCommand.execute(mockContext, '#test-select');

      expect(result.success).toBe(true);
      expect(document.activeElement).toBe(testSelect);
    });

    it('should blur select element when focused', async () => {
      testSelect.focus();
      expect(document.activeElement).toBe(testSelect);

      const result = await toggleCommand.execute(mockContext, '#test-select');

      expect(result.success).toBe(true);
      expect(document.activeElement).not.toBe(testSelect);
    });

    it('should dispatch hyperscript:toggle event for select', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      testSelect.addEventListener('hyperscript:toggle', ((e: CustomEvent) => {
        eventFired = true;
        eventDetail = e.detail;
      }) as EventListener);

      await toggleCommand.execute(mockContext, '#test-select');

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeDefined();
      expect(eventDetail.type).toBe('select');
    });
  });

  describe('Mixed Element Types', () => {
    it('should not toggle mixed element types with smart detection', async () => {
      const details = document.createElement('details');
      details.id = 'mixed1';
      const select = document.createElement('select');
      select.id = 'mixed2';
      document.body.appendChild(details);
      document.body.appendChild(select);

      // Toggle details element
      const result1 = await toggleCommand.execute(mockContext, '#mixed1');
      expect(result1.success).toBe(true);
      expect(details.open).toBe(true);

      // Toggle select element
      const result2 = await toggleCommand.execute(mockContext, '#mixed2');
      expect(result2.success).toBe(true);
      expect(document.activeElement).toBe(select);
    });
  });

  describe('Backward Compatibility with Smart Elements', () => {
    it('should still toggle classes on details elements', async () => {
      const details = document.createElement('details');
      details.id = 'test';
      document.body.appendChild(details);

      const result = await toggleCommand.execute(mockContext, '.active', details);

      expect(result.success).toBe(true);
      expect(details.classList.contains('active')).toBe(true);
      // Details state should NOT change
      expect(details.open).toBe(false);
    });

    it('should still toggle attributes on details elements', async () => {
      const details = document.createElement('details');
      details.id = 'test';
      document.body.appendChild(details);

      const result = await toggleCommand.execute(mockContext, '@disabled', details);

      expect(result.success).toBe(true);
      expect(details.hasAttribute('disabled')).toBe(true);
      // Details state should NOT change
      expect(details.open).toBe(false);
    });

    it('should still toggle classes on select elements', async () => {
      const select = document.createElement('select');
      select.id = 'test';
      document.body.appendChild(select);

      const result = await toggleCommand.execute(mockContext, '.highlighted', select);

      expect(result.success).toBe(true);
      expect(select.classList.contains('highlighted')).toBe(true);
    });
  });

  describe('Summary Element Toggle', () => {
    let testDetails: HTMLDetailsElement;
    let testSummary: HTMLElement;

    beforeEach(() => {
      testDetails = document.createElement('details');
      testDetails.id = 'test-details';
      testSummary = document.createElement('summary');
      testSummary.id = 'test-summary';
      testSummary.textContent = 'Click to expand';

      const content = document.createElement('p');
      content.textContent = 'Hidden content';

      testDetails.appendChild(testSummary);
      testDetails.appendChild(content);
      document.body.appendChild(testDetails);
    });

    it('should detect summary element and toggle parent details', async () => {
      expect(testDetails.open).toBe(false);

      const result = await toggleCommand.execute(mockContext, '#test-summary');

      expect(result.success).toBe(true);
      expect(testDetails.open).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value?.[0]).toBe(testDetails);
    });

    it('should toggle parent details when using "me" on summary', async () => {
      mockContext.me = testSummary;

      const result = await toggleCommand.execute(mockContext, testSummary);

      expect(result.success).toBe(true);
      expect(testDetails.open).toBe(true);
    });

    it('should close open details when toggling summary', async () => {
      testDetails.open = true;

      const result = await toggleCommand.execute(mockContext, '#test-summary');

      expect(result.success).toBe(true);
      expect(testDetails.open).toBe(false);
    });

    it('should dispatch event on parent details when toggling summary', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      testDetails.addEventListener('hyperscript:toggle', ((e: CustomEvent) => {
        eventFired = true;
        eventDetail = e.detail;
      }) as EventListener);

      await toggleCommand.execute(mockContext, '#test-summary');

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeDefined();
      expect(eventDetail.type).toBe('details');
      expect(eventDetail.state).toBe('opened');
    });

    it('should handle summary without parent details gracefully', async () => {
      // Create orphan summary (not inside details)
      const orphanSummary = document.createElement('summary');
      orphanSummary.id = 'orphan';
      document.body.appendChild(orphanSummary);

      const result = await toggleCommand.execute(mockContext, orphanSummary);

      // Should succeed but return empty since no parent details
      // Falls back to no action (no parent to toggle)
      expect(result.success).toBe(true);
      expect(result.value).toHaveLength(0);
    });

    it('should allow class toggle on summary elements', async () => {
      // Create second details with summary
      const details2 = document.createElement('details');
      const summary2 = document.createElement('summary');
      summary2.id = 'summary2';
      details2.appendChild(summary2);
      document.body.appendChild(details2);

      // Test that we can toggle classes on summaries using explicit class + target pattern
      const result = await toggleCommand.execute(mockContext, '.faq-summary', testSummary);

      expect(result.success).toBe(true);
      // Should have toggled the class, not the parent details
      expect(testSummary.classList.contains('faq-summary')).toBe(true);
      // Details state should NOT change
      expect(testDetails.open).toBe(false);
    });
  });

  describe('Integration with Dialog Tests', () => {
    it('should handle all smart element types independently', async () => {
      const dialog = document.createElement('dialog');
      dialog.id = 'dialog1';
      const details = document.createElement('details');
      details.id = 'details1';
      const select = document.createElement('select');
      select.id = 'select1';

      document.body.appendChild(dialog);
      document.body.appendChild(details);
      document.body.appendChild(select);

      // Toggle each element type
      await toggleCommand.execute(mockContext, '#dialog1');
      await toggleCommand.execute(mockContext, '#details1');
      await toggleCommand.execute(mockContext, '#select1');

      expect(dialog.open).toBe(true);
      expect(details.open).toBe(true);
      expect(document.activeElement).toBe(select);
    });

    it('should handle summary elements as part of smart toggle system', async () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.id = 'summary1';
      details.appendChild(summary);
      document.body.appendChild(details);

      await toggleCommand.execute(mockContext, '#summary1');

      expect(details.open).toBe(true);
    });
  });
});
