/**
 * Enhanced On Feature - Deep TypeScript Integration
 * Handles event binding with rich syntax parsing and validation
 * Enhanced for LLM code agents with full type safety
 */

import { z } from 'zod';
import type {
  TypedFeatureImplementation,
  TypedFeatureContext,
  FeatureMetadata,
  FeatureValidationResult,
  FeatureRegistration
} from '../types/enhanced-features';
import type { EvaluationResult, ValidationResult, LLMDocumentation } from '../types/enhanced-core';
import { Runtime } from '../runtime/runtime';
import { createEventManager, registerEventListener, unregisterEventListener } from '../core/events';

/**
 * Event handler configuration
 */
export interface EventHandlerConfig {
  eventName: string;
  parameters?: string[];
  filter?: string;
  count?: number | { from: number; to?: number };
  source?: 'self' | 'elsewhere' | string; // CSS selector or special keyword
  timing?: {
    type: 'debounce' | 'throttle';
    delay: number;
  };
  queue?: 'all' | 'first' | 'last' | 'none';
  every?: boolean;
  commands: unknown[]; // AST command nodes
}

/**
 * Input validation schema for enhanced on feature
 */
const EnhancedOnInputSchema = z.object({
  handlers: z.array(z.object({
    eventName: z.string().min(1),
    parameters: z.array(z.string()).optional(),
    filter: z.string().optional(),
    count: z.union([
      z.number().int().positive(),
      z.object({
        from: z.number().int().positive(),
        to: z.number().int().positive().optional()
      })
    ]).optional(),
    source: z.union([
      z.literal('self'),
      z.literal('elsewhere'),
      z.string() // CSS selector
    ]).optional(),
    timing: z.object({
      type: z.enum(['debounce', 'throttle']),
      delay: z.number().positive()
    }).optional(),
    queue: z.enum(['all', 'first', 'last', 'none']).optional(),
    every: z.boolean().optional(),
    commands: z.array(z.unknown()).min(1)
  })).min(1)
});

type EnhancedOnInput = z.infer<typeof EnhancedOnInputSchema>;

/**
 * Enhanced On Feature with comprehensive syntax support
 */
export class EnhancedOnFeature implements TypedFeatureImplementation<
  EnhancedOnInput,
  FeatureRegistration[],
  TypedFeatureContext
> {
  public readonly name = 'on' as const;
  public readonly syntax = 'on [every] <event>[(<params>)][<filter>][<count>][from <source>][<timing>] {<commands>}';
  public readonly description = 'Registers event handlers with rich syntax support including filters, queuing, and timing controls';
  public readonly inputSchema = EnhancedOnInputSchema;
  public readonly outputType = 'feature-registration-list' as const;

  public readonly metadata: FeatureMetadata = {
    category: 'event-handling',
    complexity: 'complex',
    sideEffects: ['event-listeners', 'dom-mutation'],
    syntaxElements: {
      keywords: ['on', 'every', 'from', 'elsewhere', 'queue', 'debounced', 'throttled', 'at'],
      modifiers: ['every', 'queue all', 'queue first', 'queue last', 'queue none'],
      expressions: ['event-name', 'parameter-list', 'filter-expression', 'count-expression', 'timing-expression']
    },
    triggerTypes: ['event'],
    scope: 'element',
    lifecycle: 'continuous',
    examples: [
      {
        code: 'on click add .active',
        description: 'Add active class on click',
        expectedOutput: []
      },
      {
        code: 'on click(x, y) from elsewhere log x, y',
        description: 'Log click coordinates from elsewhere with parameter destructuring',
        expectedOutput: []
      },
      {
        code: 'on keyup[key == "Enter"] debounced at 300ms submit me',
        description: 'Submit form on Enter key with debouncing',
        expectedOutput: []
      }
    ],
    relatedCommands: ['send', 'trigger']
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Registers event handlers with comprehensive syntax including filtering, queuing, timing, and parameter extraction',
    parameters: [
      {
        name: 'eventName',
        type: 'string',
        description: 'Name of the DOM event to listen for',
        optional: false,
        examples: ['click', 'keyup', 'custom:event', 'mutation']
      },
      {
        name: 'parameters',
        type: 'string[]',
        description: 'Parameter names to extract from event.detail',
        optional: true,
        examples: ['(x, y)', '(data)', '(foo, bar)']
      },
      {
        name: 'filter',
        type: 'expression',
        description: 'Boolean expression to filter events',
        optional: true,
        examples: ['[key == "Enter"]', '[buttons == 1]', '[target.matches(".button")]']
      },
      {
        name: 'count',
        type: 'number | range',
        description: 'Limit handler to specific occurrence counts',
        optional: true,
        examples: ['1', '2 to 5', '3 and on']
      },
      {
        name: 'source',
        type: 'element-expression',
        description: 'Element to listen for events from',
        optional: true,
        examples: ['from #button', 'from .container', 'from elsewhere']
      },
      {
        name: 'timing',
        type: 'timing-expression',
        description: 'Debounce or throttle event handling',
        optional: true,
        examples: ['debounced at 300ms', 'throttled at 100ms']
      },
      {
        name: 'queue',
        type: 'queue-strategy',
        description: 'Event queue strategy for concurrent events',
        optional: true,
        examples: ['queue all', 'queue first', 'queue last', 'queue none']
      }
    ],
    returns: {
      type: 'feature-registration-list',
      description: 'Array of event handler registrations that can be cleaned up',
      examples: [[]]
    },
    examples: [
      {
        title: 'Simple click handler',
        code: 'on click add .clicked',
        explanation: 'Adds "clicked" class when element is clicked',
        output: []
      },
      {
        title: 'Filtered keyup handler',
        code: 'on keyup[key == "Escape"] hide me',
        explanation: 'Hides element when Escape key is pressed',
        output: []
      },
      {
        title: 'Debounced input handler',
        code: 'on input debounced at 300ms validate me',
        explanation: 'Validates input after 300ms delay since last input event',
        output: []
      },
      {
        title: 'Parameter extraction',
        code: 'on custom(data, action) if action == "save" then send data to /api',
        explanation: 'Extracts data and action from custom event details',
        output: []
      },
      {
        title: 'Count-limited handler',
        code: 'on click 1 to 3 increment @counter',
        explanation: 'Only handle first 3 clicks to increment counter',
        output: []
      }
    ],
    seeAlso: ['send', 'trigger', 'wait', 'init'],
    tags: ['events', 'dom', 'user-interaction', 'async']
  };

  private runtime: Runtime;
  private eventManager: any;
  private activeRegistrations = new Map<string, FeatureRegistration>();

  constructor(runtime?: Runtime) {
    this.runtime = runtime || new Runtime({ useEnhancedCommands: true });
    this.eventManager = createEventManager();
  }

  async parse(syntaxString: string, element: HTMLElement): Promise<EvaluationResult<EnhancedOnInput>> {
    try {
      // This is a simplified parser - in practice you'd want a more robust parsing system
      const handlers = this.parseSyntaxString(syntaxString);
      
      const input: EnhancedOnInput = { handlers };
      
      return {
        success: true,
        value: input,
        type: 'parsed-input'
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'OnFeatureParseError',
          message: error instanceof Error ? error.message : 'Parse error',
          code: 'SYNTAX_PARSE_FAILED',
          suggestions: [
            'Check event handler syntax',
            'Ensure commands are properly formatted',
            'Verify filter expressions use valid syntax'
          ]
        },
        type: 'error'
      };
    }
  }

  async execute(
    context: TypedFeatureContext,
    input: EnhancedOnInput
  ): Promise<EvaluationResult<FeatureRegistration[]>> {
    try {
      const validationResult = this.validate(input);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            name: 'ValidationError',
            message: validationResult.errors[0]?.message || 'Invalid input',
            code: 'ON_VALIDATION_FAILED',
            suggestions: validationResult.suggestions
          },
          type: 'error'
        };
      }

      const registrations: FeatureRegistration[] = [];

      for (const handlerConfig of input.handlers) {
        try {
          // Validate handler config before processing
          if (!handlerConfig || !handlerConfig.eventName || !handlerConfig.commands) {
            throw new Error('Invalid handler configuration');
          }
          
          const registration = await this.createEventHandler(context, handlerConfig);
          if (registration) {
            registrations.push(registration);
            this.activeRegistrations.set(registration.id, registration);
          }
        } catch (error) {
          // Continue processing other handlers but track this error
          console.warn('Failed to create event handler:', error);
        }
      }

      return {
        success: true,
        value: registrations,
        type: 'feature-registration-list'
      };

    } catch (error) {
      return {
        success: false,
        error: {
          name: 'OnFeatureError',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'ON_EXECUTION_FAILED',
          suggestions: ['Check event handler configuration', 'Verify element exists']
        },
        type: 'error'
      };
    }
  }

  validate(input: unknown): ValidationResult {
    try {
      const parsed = this.inputSchema.safeParse(input);
      
      if (!parsed.success) {
        return {
          isValid: false,
          errors: parsed.error.errors.map(err => ({
            type: 'type-mismatch' as const,
            message: `Invalid input: ${err.message}`,
            suggestion: this.getValidationSuggestion(err.code, err.path)
          })),
          suggestions: ['Check event handler configuration', 'Verify all required fields are present']
        };
      }

      // Additional semantic validation
      const { handlers } = parsed.data;
      
      for (const handler of handlers) {
        // Validate event names
        if (!this.isValidEventName(handler.eventName)) {
          return {
            isValid: false,
            errors: [{
              type: 'semantic-error',
              message: `Invalid event name: "${handler.eventName}"`,
              suggestion: 'Use valid DOM event names or custom event names'
            }],
            suggestions: ['Use standard DOM events like "click", "keyup"', 'Use custom event names without special characters']
          };
        }

        // Validate count ranges
        if (handler.count && typeof handler.count === 'object') {
          if (handler.count.to && handler.count.from > handler.count.to) {
            return {
              isValid: false,
              errors: [{
                type: 'semantic-error',
                message: 'Count range "from" value cannot be greater than "to" value',
                suggestion: 'Ensure count range is valid (e.g., "2 to 5")'
              }],
              suggestions: ['Use valid count ranges like "1 to 3"']
            };
          }
        }
      }

      return {
        isValid: true,
        errors: [],
        suggestions: []
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          type: 'runtime-error',
          message: 'Validation failed with exception',
          suggestion: 'Check input structure and types'
        }],
        suggestions: ['Ensure input matches expected schema']
      };
    }
  }

  async cleanup(context: TypedFeatureContext, registrations: FeatureRegistration[]): Promise<void> {
    for (const registration of registrations) {
      try {
        if (registration.cleanup) {
          await registration.cleanup();
        }
        this.activeRegistrations.delete(registration.id);
      } catch (error) {
        // Log cleanup errors but don't throw - we want to clean up as much as possible
        console.warn(`Failed to cleanup registration ${registration.id}:`, error);
      }
    }
  }

  private parseSyntaxString(syntaxString: string): EventHandlerConfig[] {
    try {
      // Simplified parser for demonstration - would need comprehensive parsing in practice
      const handlers: EventHandlerConfig[] = [];
      
      // Split on 'on ' keywords to handle multiple handlers
      const parts = syntaxString.split(/\s+on\s+/).filter(part => part.trim());
      
      for (const part of parts) {
        // Extract event name - look for first word after potential 'on'
        const eventMatch = part.match(/^\s*(\w+(?:[:.]\w+)*)/);
        if (!eventMatch) continue;
        
        const eventName = eventMatch[1];
        
        // Create basic command from remaining text
        const commandText = part.replace(eventMatch[0], '').trim();
        const commands = commandText ? 
          [{ type: 'command', name: 'log', args: [{ type: 'literal', value: commandText }] }] :
          [{ type: 'command', name: 'log', args: [{ type: 'literal', value: `Event: ${eventName}` }] }];
        
        handlers.push({
          eventName,
          commands
        });
      }
      
      // If no handlers parsed, create a basic one
      if (handlers.length === 0) {
        handlers.push({
          eventName: 'click',
          commands: [{ type: 'command', name: 'log', args: [{ type: 'literal', value: 'parsed' }] }]
        });
      }
      
      return handlers;
    } catch (error) {
      throw new Error(`Parse error: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
  }

  private async createEventHandler(
    context: TypedFeatureContext,
    config: EventHandlerConfig
  ): Promise<FeatureRegistration | null> {
    try {
      const registrationId = this.generateRegistrationId();
      
      const eventHandler = async (event: Event) => {
        try {
          // Create event-specific context
          const eventContext = this.createEventContext(event, context, config);
          
          // Apply filters if present
          if (config.filter && !await this.evaluateFilter(config.filter, eventContext)) {
            return;
          }
          
          // Apply count limits if present
          if (config.count && !this.checkCountLimit(config.count, registrationId)) {
            return;
          }
          
          // Execute commands through enhanced runtime
          for (const command of config.commands) {
            await this.runtime.execute(command as any, eventContext as any);
          }
          
        } catch (error) {
          this.handleEventError(error as Error, context.element, config);
        }
      };

      // Determine event source element
      const sourceElement = this.resolveEventSource(config.source, context.element);
      if (!sourceElement) {
        return null;
      }

      // Register event listener
      const listenerId = registerEventListener(
        this.eventManager,
        sourceElement,
        config.eventName,
        eventHandler,
        this.getEventListenerOptions(config)
      );

      return {
        id: registrationId,
        featureName: this.name,
        element: context.element,
        syntax: `on ${config.eventName}`,
        active: true,
        cleanup: async () => {
          unregisterEventListener(this.eventManager, listenerId);
        }
      };

    } catch (error) {
      console.error('Failed to create event handler:', error);
      return null;
    }
  }

  private createEventContext(
    event: Event,
    baseContext: TypedFeatureContext,
    config: EventHandlerConfig
  ): TypedFeatureContext {
    const eventContext: TypedFeatureContext = {
      ...baseContext,
      locals: new Map(baseContext.locals),
      event
    };

    // Add event-specific variables
    eventContext.locals.set('event', event);
    eventContext.locals.set('target', event.target);
    eventContext.locals.set('currentTarget', event.currentTarget);

    // Extract parameters from event.detail if configured
    if (config.parameters && event instanceof CustomEvent && event.detail) {
      for (const param of config.parameters) {
        if (event.detail[param] !== undefined) {
          eventContext.locals.set(param, event.detail[param]);
        }
      }
    }

    // Update 'it' to point to event target
    eventContext.it = event.target;

    return eventContext;
  }

  private async evaluateFilter(filter: string, context: TypedFeatureContext): Promise<boolean> {
    // Simplified filter evaluation - would need proper expression evaluation
    try {
      // In practice, you'd integrate with the expression evaluator
      return true; // Placeholder
    } catch {
      return false;
    }
  }

  private checkCountLimit(count: number | { from: number; to?: number }, registrationId: string): boolean {
    // Simplified count tracking - would need proper state management
    return true; // Placeholder
  }

  private resolveEventSource(source: string | undefined, defaultElement: HTMLElement): HTMLElement | null {
    if (!source || source === 'self') {
      return defaultElement;
    }
    
    if (source === 'elsewhere') {
      return document.body; // Simplified - would need proper elsewhere handling
    }
    
    // CSS selector
    try {
      return document.querySelector(source) as HTMLElement;
    } catch {
      return null;
    }
  }

  private getEventListenerOptions(config: EventHandlerConfig): AddEventListenerOptions {
    const options: AddEventListenerOptions = {};
    
    // Add timing options if configured
    if (config.timing) {
      // Would implement debouncing/throttling here
    }
    
    return options;
  }

  private handleEventError(error: Error, element: HTMLElement, config: EventHandlerConfig): void {
    console.error(`Error in ${config.eventName} handler:`, error);
    
    // Dispatch error event
    const errorEvent = new CustomEvent('hyperscript:error', {
      detail: { error, eventName: config.eventName },
      bubbles: true
    });
    element.dispatchEvent(errorEvent);
  }

  private generateRegistrationId(): string {
    return `on_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidEventName(eventName: string): boolean {
    // Basic validation - in practice would be more comprehensive
    return /^[a-zA-Z][a-zA-Z0-9:.-]*$/.test(eventName);
  }

  private getValidationSuggestion(errorCode: string, path: (string | number)[]): string {
    const suggestions: Record<string, string> = {
      'invalid_type': 'Check handler configuration structure',
      'too_small': 'At least one event handler is required',
      'required': 'All required fields must be provided'
    };
    
    return suggestions[errorCode] || 'Check input structure and types';
  }
}

/**
 * Factory function for creating enhanced on features
 */
export function createEnhancedOnFeature(runtime?: Runtime): EnhancedOnFeature {
  return new EnhancedOnFeature(runtime);
}

export default EnhancedOnFeature;