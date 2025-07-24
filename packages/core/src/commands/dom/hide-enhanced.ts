/**
 * Enhanced Hide Command - Deep TypeScript Integration Example
 * Demonstrates LLM-friendly typing with runtime validation
 */

import { z } from 'zod';
import { 
  TypedCommandImplementation,
  TypedExecutionContext,
  HyperScriptValue,
  EvaluationResult,
  ValidationResult,
  CommandMetadata,
  HyperScriptValueSchema,
  TypeChecker,
  LLMDocumentation
} from '../../types/enhanced-core';

// ============================================================================
// Enhanced Type-Safe Hide Command
// ============================================================================

/**
 * Input validation schema for LLM understanding
 */
const HideCommandInputSchema = z.tuple([
  z.union([
    z.instanceof(HTMLElement),
    z.array(z.instanceof(HTMLElement)), 
    z.string(), // CSS selector
    z.null(),   // Use implicit target (me)
    z.undefined()
  ]).optional()
]);

type HideCommandInput = z.infer<typeof HideCommandInputSchema>;

/**
 * Enhanced Hide Command with full type safety for LLM agents
 */
export class EnhancedHideCommand implements TypedCommandImplementation<
  HideCommandInput,
  HTMLElement[],  // Returns list of hidden elements
  TypedExecutionContext
> {
  // ============================================================================
  // LLM-Friendly Metadata
  // ============================================================================
  
  readonly name = 'hide' as const;
  readonly syntax = 'hide [<target-expression>]';
  readonly description = 'Hides one or more elements by setting display: none or adding CSS classes';
  readonly inputSchema = HideCommandInputSchema;
  readonly outputType = 'element-list' as const;

  readonly metadata: CommandMetadata = {
    category: 'dom-manipulation',
    complexity: 'simple',
    sideEffects: ['dom-mutation'],
    examples: [
      {
        code: 'hide me',
        description: 'Hide the current element',
        expectedOutput: []  // Returns array of hidden elements
      },
      {
        code: 'hide <.modal/>',
        description: 'Hide all elements with modal class',
        expectedOutput: []
      }
    ],
    relatedCommands: ['show', 'toggle']
  };

  readonly documentation: LLMDocumentation = {
    summary: 'Hides HTML elements from view using CSS display property or classes',
    parameters: [
      {
        name: 'target',
        type: 'element',
        description: 'Element(s) to hide. If omitted, hides the current element (me)',
        optional: true,
        examples: ['me', '<#modal/>', '<.button/>']
      }
    ],
    returns: {
      type: 'element-list',
      description: 'Array of elements that were hidden',
      examples: [[]]  // Array of HTMLElements
    },
    examples: [
      {
        title: 'Hide current element',
        code: 'on click hide me',
        explanation: 'When clicked, the button hides itself',
        output: []
      },
      {
        title: 'Hide modal dialog',
        code: 'on escape hide <#modal/>',
        explanation: 'Press escape to hide modal with id "modal"',
        output: []
      }
    ],
    seeAlso: ['show', 'toggle', 'add-class'],
    tags: ['dom', 'visibility', 'css']
  };

  // ============================================================================
  // Type-Safe Execution with Runtime Validation
  // ============================================================================

  async execute(
    context: TypedExecutionContext,
    target?: HideCommandInput[0]
  ): Promise<EvaluationResult<HTMLElement[]>> {
    try {
      // Runtime input validation for safety
      const validationResult = this.validate([target]);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            name: 'ValidationError',
            message: validationResult.errors[0]?.message || 'Invalid input',
            code: 'HIDE_VALIDATION_FAILED',
            suggestions: validationResult.suggestions
          },
          type: 'error'
        };
      }

      // Resolve target elements with type safety
      const elements = await this.resolveTargets(context, target);
      
      // Type-safe element hiding
      const hiddenElements: HTMLElement[] = [];
      
      for (const element of elements) {
        const hideResult = await this.hideElement(element);
        if (hideResult.success) {
          hiddenElements.push(element);
        }
      }

      return {
        success: true,
        value: hiddenElements,
        type: 'element-list'
      };

    } catch (error) {
      return {
        success: false,
        error: {
          name: 'HideCommandError',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'HIDE_EXECUTION_FAILED',
          suggestions: ['Check if element exists', 'Verify element is not null']
        },
        type: 'error'
      };
    }
  }

  // ============================================================================
  // Enhanced Validation for LLM Static Analysis
  // ============================================================================

  validate(args: unknown[]): ValidationResult {
    try {
      // Schema validation
      const parsed = HideCommandInputSchema.safeParse(args);
      
      if (!parsed.success) {
        return {
          isValid: false,
          errors: parsed.error.errors.map(err => ({
            type: 'type-mismatch' as const,
            message: `Invalid argument: ${err.message}`,
            suggestion: this.getValidationSuggestion(err.code, err.path)
          })),
          suggestions: ['Use HTMLElement, CSS selector string, or omit for implicit target']
        };
      }

      // Additional semantic validation
      const [target] = parsed.data;
      
      if (typeof target === 'string' && !this.isValidCSSSelector(target)) {
        return {
          isValid: false,
          errors: [{
            type: 'invalid-syntax',
            message: `Invalid CSS selector: "${target}"`,
            suggestion: 'Use valid CSS selector syntax like "#id", ".class", or "element"'
          }],
          suggestions: ['Check CSS selector syntax', 'Use document.querySelector() test']
        };
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
          suggestion: 'Check input types and values'
        }],
        suggestions: ['Ensure arguments match expected types']
      };
    }
  }

  // ============================================================================
  // Type-Safe Helper Methods
  // ============================================================================

  private async resolveTargets(
    context: TypedExecutionContext,
    target?: HideCommandInput[0]
  ): Promise<HTMLElement[]> {
    // Default to context.me if no target specified
    if (target === undefined || target === null) {
      return context.me ? [context.me] : [];
    }

    // Handle HTMLElement directly
    if (target instanceof HTMLElement) {
      return [target];
    }

    // Handle HTMLElement array
    if (Array.isArray(target)) {
      return target.filter((el): el is HTMLElement => el instanceof HTMLElement);
    }

    // Handle CSS selector string
    if (typeof target === 'string') {
      try {
        const elements = document.querySelectorAll(target);
        return Array.from(elements) as HTMLElement[];
      } catch (error) {
        throw new Error(`Invalid CSS selector: "${target}"`);
      }
    }

    return [];
  }

  private async hideElement(element: HTMLElement): Promise<EvaluationResult<HTMLElement>> {
    try {
      // Store original display value for show command
      if (!element.dataset.originalDisplay) {
        const computedStyle = window.getComputedStyle(element);
        element.dataset.originalDisplay = computedStyle.display === 'none' 
          ? 'block' 
          : computedStyle.display;
      }

      // Hide the element
      element.style.display = 'none';

      // Dispatch custom event for other systems
      element.dispatchEvent(new CustomEvent('hyperscript:hidden', {
        detail: { command: 'hide', timestamp: Date.now() }
      }));

      return {
        success: true,
        value: element,
        type: 'element'
      };

    } catch (error) {
      return {
        success: false,
        error: {
          name: 'HideElementError',
          message: error instanceof Error ? error.message : 'Failed to hide element',
          code: 'ELEMENT_HIDE_FAILED',
          suggestions: ['Check if element is still in DOM', 'Verify element is not null']
        },
        type: 'error'
      };
    }
  }

  // ============================================================================
  // LLM Helper Methods
  // ============================================================================

  private getValidationSuggestion(errorCode: string, path: (string | number)[]): string {
    const suggestions: Record<string, string> = {
      'invalid_type': 'Use HTMLElement, string (CSS selector), or omit argument',
      'invalid_union': 'Target must be an element, CSS selector, or null',
      'too_big': 'Too many arguments - hide command takes 0-1 arguments'
    };
    
    return suggestions[errorCode] || 'Check argument types and syntax';
  }

  private isValidCSSSelector(selector: string): boolean {
    try {
      document.querySelector(selector);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// Plugin Export for Tree-Shaking
// ============================================================================

/**
 * Plugin factory for modular imports
 * @llm-bundle-size 2KB
 * @llm-description Type-safe hide command with validation
 */
export function createHideCommand(): EnhancedHideCommand {
  return new EnhancedHideCommand();
}

// Default export for convenience
export default EnhancedHideCommand;