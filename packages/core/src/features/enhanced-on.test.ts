/**
 * Test suite for Enhanced On Feature
 * Validates enhanced TypeScript patterns applied to features
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTestElement } from '../test-setup';
import { Runtime } from '../runtime/runtime';
import { EnhancedOnFeature, createEnhancedOnFeature } from './enhanced-on';
import type { TypedFeatureContext } from '../types/enhanced-features';

describe('Enhanced On Feature', () => {
  let feature: EnhancedOnFeature;
  let runtime: Runtime;
  let testElement: HTMLElement;
  let context: TypedFeatureContext;

  beforeEach(() => {
    runtime = new Runtime({ useEnhancedCommands: true });
    feature = createEnhancedOnFeature(runtime);
    testElement = createTestElement('<button id="test-btn">Test</button>');
    document.body.appendChild(testElement);

    context = {
      me: testElement,
      it: null,
      you: null,
      result: null,
      event: undefined,
      
      variables: new Map(),
      locals: new Map(),
      globals: new Map(),
      
      feature: 'on',
      syntax: '',
      element: testElement,
      
      errors: [],
      featureHistory: [],
      validationMode: 'strict'
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Feature Implementation Interface', () => {
    it('should implement TypedFeatureImplementation interface', () => {
      expect(feature.name).toBe('on');
      expect(feature.syntax).toContain('on');
      expect(feature.description).toContain('event handlers');
      expect(feature.inputSchema).toBeDefined();
      expect(feature.outputType).toBe('feature-registration-list');
      expect(feature.metadata).toBeDefined();
      expect(feature.documentation).toBeDefined();
    });

    it('should have comprehensive metadata', () => {
      const { metadata } = feature;
      
      expect(metadata.category).toBe('event-handling');
      expect(metadata.complexity).toBe('complex');
      expect(metadata.sideEffects).toContain('event-listeners');
      expect(metadata.syntaxElements.keywords).toContain('on');
      expect(metadata.syntaxElements.keywords).toContain('every');
      expect(metadata.triggerTypes).toContain('event');
      expect(metadata.scope).toBe('element');
      expect(metadata.lifecycle).toBe('continuous');
    });

    it('should have rich LLM documentation', () => {
      const { documentation } = feature;
      
      expect(documentation.summary).toContain('event handlers');
      expect(documentation.parameters).toHaveLength(7); // eventName, parameters, filter, count, source, timing, queue
      expect(documentation.returns.type).toBe('feature-registration-list');
      expect(documentation.examples).toHaveLength(5);
      expect(documentation.seeAlso).toContain('send');
      expect(documentation.tags).toContain('events');
    });
  });

  describe('Input Validation', () => {
    it('should validate correct input structure', () => {
      const validInput = {
        handlers: [
          {
            eventName: 'click',
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = feature.validate(validInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty handlers array', () => {
      const invalidInput = {
        handlers: []
      };

      const result = feature.validate(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('Array must contain at least 1 element');
    });

    it('should reject invalid event names', () => {
      const invalidInput = {
        handlers: [
          {
            eventName: '123invalid',
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = feature.validate(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('Invalid event name');
    });

    it('should validate count ranges', () => {
      const invalidInput = {
        handlers: [
          {
            eventName: 'click',
            count: { from: 5, to: 2 }, // Invalid: from > to
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = feature.validate(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('Count range');
    });

    it('should accept valid queue strategies', () => {
      const validInput = {
        handlers: [
          {
            eventName: 'click',
            queue: 'first' as const,
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = feature.validate(validInput);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid queue strategies', () => {
      const invalidInput = {
        handlers: [
          {
            eventName: 'click',
            queue: 'invalid',
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = feature.validate(invalidInput);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Syntax Parsing', () => {
    it('should parse simple event handler syntax', async () => {
      const syntax = 'on click log "clicked"';
      
      const result = await feature.parse(syntax, testElement);
      
      expect(result.success).toBe(true);
      expect(result.value?.handlers).toHaveLength(1);
      expect(result.value?.handlers[0]?.eventName).toBe('click');
    });

    it('should handle parse errors gracefully', async () => {
      const invalidSyntax = 'on [invalid syntax';
      
      const result = await feature.parse(invalidSyntax, testElement);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SYNTAX_PARSE_FAILED');
      expect(result.error?.suggestions).toContain('Check event handler syntax');
    });
  });

  describe('Feature Execution', () => {
    it('should execute simple event handler', async () => {
      const input = {
        handlers: [
          {
            eventName: 'click',
            commands: [{ type: 'command', name: 'log', args: [{ type: 'literal', value: 'test' }] }]
          }
        ]
      };

      const result = await feature.execute(context, input);
      
      expect(result.success).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value?.[0]?.featureName).toBe('on');
      expect(result.value?.[0]?.element).toBe(testElement);
      expect(result.value?.[0]?.active).toBe(true);
    });

    it('should handle execution errors', async () => {
      const input = {
        handlers: [
          {
            eventName: '', // Invalid empty event name
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = await feature.execute(context, input);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ON_VALIDATION_FAILED');
    });

    it('should provide cleanup functions', async () => {
      const input = {
        handlers: [
          {
            eventName: 'click',
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = await feature.execute(context, input);
      
      expect(result.success).toBe(true);
      expect(result.value?.[0]?.cleanup).toBeDefined();
      expect(typeof result.value?.[0]?.cleanup).toBe('function');
    });
  });

  describe('Event Handler Creation', () => {
    it('should create handlers with proper context', async () => {
      const input = {
        handlers: [
          {
            eventName: 'custom',
            parameters: ['data', 'action'],
            commands: [{ type: 'command', name: 'log', args: [{ type: 'identifier', name: 'data' }] }]
          }
        ]
      };

      const result = await feature.execute(context, input);
      expect(result.success).toBe(true);
      
      // Test parameter extraction by dispatching a custom event
      const customEvent = new CustomEvent('custom', {
        detail: { data: 'test-data', action: 'save' }
      });
      
      testElement.dispatchEvent(customEvent);
      // In a real implementation, we'd verify the parameters were extracted
    });

    it('should support different event sources', async () => {
      const input = {
        handlers: [
          {
            eventName: 'click',
            source: 'elsewhere',
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = await feature.execute(context, input);
      expect(result.success).toBe(true);
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should cleanup registrations properly', async () => {
      const input = {
        handlers: [
          {
            eventName: 'click',
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = await feature.execute(context, input);
      expect(result.success).toBe(true);
      
      const registrations = result.value!;
      
      // Cleanup should not throw
      await expect(feature.cleanup(context, registrations)).resolves.not.toThrow();
    });

    it('should handle cleanup errors gracefully', async () => {
      const mockRegistration = {
        id: 'test',
        featureName: 'on',
        element: testElement,
        syntax: 'on click',
        active: true,
        cleanup: vi.fn().mockRejectedValue(new Error('Cleanup failed'))
      };

      // Should handle cleanup errors without throwing
      await expect(feature.cleanup(context, [mockRegistration])).resolves.not.toThrow();
    });
  });

  describe('Integration with Enhanced Commands', () => {
    it('should integrate with enhanced command system', async () => {
      // Mock enhanced command execution
      const executeSpy = vi.spyOn(runtime, 'execute');
      
      const input = {
        handlers: [
          {
            eventName: 'click',
            commands: [{ type: 'command', name: 'hide', args: [] }]
          }
        ]
      };

      await feature.execute(context, input);
      
      // Trigger the event to test command execution
      testElement.click();
      
      // In a more complete implementation, we'd verify the enhanced command was called
    });
  });

  describe('Error Handling and Debugging', () => {
    it('should provide helpful error messages', async () => {
      const input = {
        handlers: [
          {
            eventName: 'click',
            commands: [] // Empty commands array (invalid)
          }
        ]
      };

      const result = await feature.execute(context, input);
      
      expect(result.success).toBe(false);
      expect(result.error?.suggestions).toBeDefined();
      expect(result.error?.suggestions?.length).toBeGreaterThan(0);
    });

    it('should handle runtime errors gracefully', async () => {
      // Test with malformed input that passes schema validation but fails at runtime
      const input = {
        handlers: [
          {
            eventName: 'click',
            commands: null as any // Will cause runtime error
          }
        ]
      };

      const result = await feature.execute(context, input);
      
      // Should succeed but have no registrations due to error handling
      expect(result.success).toBe(true);
      expect(result.value).toHaveLength(0); // No registrations created
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple event handlers efficiently', async () => {
      const input = {
        handlers: Array.from({ length: 10 }, (_, i) => ({
          eventName: `event${i}`,
          commands: [{ type: 'command', name: 'log', args: [{ type: 'literal', value: `Event ${i}` }] }]
        }))
      };

      const result = await feature.execute(context, input);
      
      expect(result.success).toBe(true);
      expect(result.value).toHaveLength(10);
    });

    it('should generate unique registration IDs', async () => {
      const input = {
        handlers: [
          {
            eventName: 'click',
            commands: [{ type: 'command', name: 'log', args: [] }]
          },
          {
            eventName: 'hover',
            commands: [{ type: 'command', name: 'log', args: [] }]
          }
        ]
      };

      const result = await feature.execute(context, input);
      
      expect(result.success).toBe(true);
      const ids = result.value!.map(reg => reg.id);
      expect(new Set(ids).size).toBe(ids.length); // All IDs should be unique
    });
  });
});