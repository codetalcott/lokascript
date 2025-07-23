/**
 * Render Command Implementation
 * Processes HTML template elements with data interpolation, hyperscript directives, and web components
 * Compatible with official _hyperscript template.js extension + modern web component integration
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class RenderCommand implements CommandImplementation {
  name = 'render';
  syntax = 'render <template> [with <data>]';
  description = 'Renders a template element with optional data context and hyperscript directives';
  isBlocking = false;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length < 1) {
      throw new Error('Render command requires a template argument');
    }

    // Parse arguments: render template [with data]
    const templateRef = args[0];
    let data = {};
    
    // Check for "with" keyword and data
    if (args.length >= 3 && args[1] === 'with') {
      data = args[2];
    }

    // Resolve template element
    const templateElement = this.resolveTemplate(templateRef, context);
    if (!templateElement) {
      throw new Error(`Template not found: ${templateRef}`);
    }

    // Process template with data context
    const result = await this.processTemplate(templateElement, data, context);
    
    // Store result in context for hyperscript access
    context.result = result;
    
    return result;
  }

  private resolveTemplate(templateRef: any, context: ExecutionContext): HTMLTemplateElement | null {
    // Handle direct template element
    if (templateRef instanceof HTMLTemplateElement) {
      return templateRef;
    }

    // Handle CSS selector strings
    if (typeof templateRef === 'string') {
      if (templateRef.startsWith('#') || templateRef.startsWith('.') || 
          templateRef.includes('[') || templateRef.includes('>')) {
        const element = document.querySelector(templateRef);
        return element instanceof HTMLTemplateElement ? element : null;
      }
    }

    // Handle context references
    if (templateRef === 'me' && context.me instanceof HTMLTemplateElement) {
      return context.me;
    }
    if (templateRef === 'it' && context.it instanceof HTMLTemplateElement) {
      return context.it;
    }
    if (templateRef === 'you' && context.you instanceof HTMLTemplateElement) {
      return context.you;
    }

    return null;
  }

  private async processTemplate(
    templateElement: HTMLTemplateElement, 
    data: any, 
    context: ExecutionContext
  ): Promise<DocumentFragment> {
    // Clone template content
    const fragment = templateElement.content.cloneNode(true) as DocumentFragment;
    
    // Create enhanced context with template data
    const templateContext = this.createTemplateContext(data, context);
    
    // Process all text nodes for interpolation
    await this.processTextNodes(fragment, templateContext);
    
    // Process hyperscript directives (@ lines)
    await this.processDirectives(fragment, templateContext);
    
    return fragment;
  }

  private createTemplateContext(data: any, baseContext: ExecutionContext): ExecutionContext {
    return {
      ...baseContext,
      // Merge data into locals for variable access
      locals: new Map([
        ...(baseContext.locals || new Map()),
        ...Object.entries(data || {})
      ]),
      // Make data available as template context
      templateData: data,
      // Enhanced result handling
      result: baseContext.result
    };
  }

  private async processTextNodes(node: Node, context: ExecutionContext): Promise<void> {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const processedText = await this.interpolateText(text, context);
      node.textContent = processedText;
    } else {
      // Recursively process child nodes
      const children = Array.from(node.childNodes);
      for (const child of children) {
        await this.processTextNodes(child, context);
      }
    }
  }

  private async interpolateText(text: string, context: ExecutionContext): Promise<string> {
    // Process ${expression} interpolations
    const interpolationRegex = /\$\{([^}]+)\}/g;
    let result = text;
    let match;

    while ((match = interpolationRegex.exec(text)) !== null) {
      const expression = match[1];
      try {
        // Use our expression evaluator to process the interpolation
        const value = await this.evaluateExpression(expression, context);
        const escapedValue = this.escapeHtml(String(value));
        result = result.replace(match[0], escapedValue);
      } catch (error) {
        console.warn(`Template interpolation error for "${expression}":`, error);
        result = result.replace(match[0], `[Error: ${expression}]`);
      }
    }

    // Reset regex for next use
    interpolationRegex.lastIndex = 0;
    return result;
  }

  private async processDirectives(fragment: DocumentFragment, context: ExecutionContext): Promise<void> {
    // Find and process @ directive comments or special nodes
    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    const directiveNodes: Node[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.COMMENT_NODE || 
          (node.nodeType === Node.TEXT_NODE && node.textContent?.trim().startsWith('@'))) {
        directiveNodes.push(node);
      }
    }

    // Process directives
    for (const directiveNode of directiveNodes) {
      await this.processDirective(directiveNode, context);
    }
  }

  private async processDirective(node: Node, context: ExecutionContext): Promise<void> {
    const content = node.textContent?.trim() || '';
    
    if (!content.startsWith('@')) return;

    const directive = content.substring(1).trim();
    
    try {
      // Handle common directives
      if (directive.startsWith('if ')) {
        await this.processIfDirective(node, directive.substring(3), context);
      } else if (directive.startsWith('repeat ')) {
        await this.processRepeatDirective(node, directive.substring(7), context);
      } else if (directive === 'else') {
        await this.processElseDirective(node, context);
      } else if (directive === 'end') {
        await this.processEndDirective(node, context);
      } else {
        // Treat as hyperscript expression
        await this.evaluateExpression(directive, context);
      }
    } catch (error) {
      console.warn(`Template directive error for "@${directive}":`, error);
    }
  }

  private async processIfDirective(node: Node, condition: string, context: ExecutionContext): Promise<void> {
    const conditionResult = await this.evaluateExpression(condition, context);
    
    if (!conditionResult) {
      // Remove content until @else or @end
      this.removeConditionalContent(node, ['else', 'end']);
    }
    
    // Remove the directive node itself
    node.remove();
  }

  private async processRepeatDirective(node: Node, expression: string, context: ExecutionContext): Promise<void> {
    // Parse: repeat item in array
    const match = expression.match(/(\w+)\s+in\s+(.+)/);
    if (!match) {
      throw new Error(`Invalid repeat syntax: ${expression}`);
    }

    const [, itemVar, arrayExpr] = match;
    const array = await this.evaluateExpression(arrayExpr, context);

    if (!Array.isArray(array)) {
      throw new Error(`Repeat expression must evaluate to array: ${arrayExpr}`);
    }

    // Clone content for each array item
    const parent = node.parentNode;
    if (!parent) return;

    const contentNodes = this.getDirectiveContent(node, ['end']);
    
    for (let i = 0; i < array.length; i++) {
      const itemContext = {
        ...context,
        locals: new Map([
          ...(context.locals || new Map()),
          [itemVar, array[i]],
          ['@index', i],
          ['@first', i === 0],
          ['@last', i === array.length - 1]
        ])
      };

      for (const contentNode of contentNodes) {
        const clonedNode = contentNode.cloneNode(true);
        await this.processTextNodes(clonedNode, itemContext);
        parent.insertBefore(clonedNode, node);
      }
    }

    // Remove original content and directive
    this.removeConditionalContent(node, ['end'], true);
    node.remove();
  }

  private async processElseDirective(node: Node, context: ExecutionContext): Promise<void> {
    // Implementation depends on if/else logic
    node.remove();
  }

  private async processEndDirective(node: Node, context: ExecutionContext): Promise<void> {
    // End directive - remove the node
    node.remove();
  }

  private removeConditionalContent(startNode: Node, endDirectives: string[], includeEnd = false): void {
    const parent = startNode.parentNode;
    if (!parent) return;

    let currentNode = startNode.nextSibling;
    const nodesToRemove: Node[] = [];

    while (currentNode) {
      const nextNode = currentNode.nextSibling;
      
      if (currentNode.nodeType === Node.COMMENT_NODE || 
          (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent?.trim().startsWith('@'))) {
        const content = currentNode.textContent?.trim() || '';
        const directive = content.substring(1).trim();
        
        if (endDirectives.includes(directive)) {
          if (includeEnd) {
            nodesToRemove.push(currentNode);
          }
          break;
        }
      }
      
      nodesToRemove.push(currentNode);
      currentNode = nextNode;
    }

    for (const node of nodesToRemove) {
      node.remove();
    }
  }

  private getDirectiveContent(startNode: Node, endDirectives: string[]): Node[] {
    const contentNodes: Node[] = [];
    let currentNode = startNode.nextSibling;

    while (currentNode) {
      if (currentNode.nodeType === Node.COMMENT_NODE || 
          (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent?.trim().startsWith('@'))) {
        const content = currentNode.textContent?.trim() || '';
        const directive = content.substring(1).trim();
        
        if (endDirectives.includes(directive)) {
          break;
        }
      }
      
      contentNodes.push(currentNode);
      currentNode = currentNode.nextSibling;
    }

    return contentNodes;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private async evaluateExpression(expression: string, context: ExecutionContext): Promise<any> {
    // This would use our existing expression evaluator
    // For now, a placeholder that would integrate with our expression system
    try {
      // Import and use our expression evaluator
      const { evalExpression } = await import('../../core/expression-evaluator');
      return await evalExpression(expression, context);
    } catch (error) {
      throw new Error(`Expression evaluation failed: ${expression} - ${error}`);
    }
  }

  validate(args: any[]): string | null {
    if (args.length < 1) {
      return 'Render command requires a template argument';
    }
    
    if (args.length >= 2 && args[1] !== 'with') {
      return 'Invalid render syntax. Use: render template [with data]';
    }
    
    if (args.length === 2) {
      return 'Render "with" keyword requires data argument';
    }
    
    return null;
  }
}

export default RenderCommand;