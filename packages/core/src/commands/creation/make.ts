/**
 * Make Command Implementation
 * The make command can be used to create class instances or DOM elements.
 * In the first form: make a URL from "/path/", "https://origin.example.com"
 * is equal to the JavaScript new URL("/path/", "https://origin.example.com").
 * In the second form: make an <a.navlink/>
 * will create an <a> element and add the class "navlink" to it. Currently, only classes and IDs are supported.
 * Generated from LSP data with TDD implementation
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class MakeCommand implements CommandImplementation {
  name = 'make';
  syntax = 'make (a|an) <expression> [from <arg-list>] [called <identifier>]\nmake (a|an) <query-ref>                    [called <identifier>]';
  description = 'The make command can be used to create class instances or DOM elements.\nIn the first form:\nis equal to the JavaScript new URL("/path/", "https://origin.example.com").\nIn the second form:\nwill create an <a> element and add the class "navlink" to it. Currently, onlyclasses and IDs are supported.';
  isBlocking = false;
  hasBody = false;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length < 2) {
      throw new Error('Make command requires article ("a" or "an") and class/element expression');
    }

    const [article, expression, ...rest] = args;
    
    // Parse remaining arguments for "from" and "called" keywords
    let constructorArgs: any[] = [];
    let variableName: string | undefined;
    
    let i = 0;
    while (i < rest.length) {
      if (rest[i] === 'from') {
        // Collect all arguments until we hit "called" or end
        i++;
        while (i < rest.length && rest[i] !== 'called') {
          constructorArgs.push(rest[i]);
          i++;
        }
      } else if (rest[i] === 'called') {
        i++;
        if (i < rest.length) {
          variableName = rest[i];
          i++;
        }
      } else {
        i++;
      }
    }

    let result: any;

    // Check if this is a DOM element expression (starts with < and ends with />)
    if (typeof expression === 'string' && expression.startsWith('<') && expression.endsWith('/>')) {
      result = this.createDOMElement(expression, context);
    } else {
      // This is a JavaScript class instantiation
      result = this.createClassInstance(expression, constructorArgs, context);
    }

    // Set the result in context.it
    context.it = result;

    // Store in variable if "called" was specified
    if (variableName) {
      this.setVariableValue(variableName, result, context);
    }

    return result;
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'Make command requires "a" or "an" article';
    }

    if (args.length === 1) {
      return 'Make command requires class name or DOM element expression';
    }

    const [article] = args;
    if (article !== 'a' && article !== 'an') {
      return 'Make command requires "a" or "an" article';
    }

    // Check for proper keyword usage
    let fromIndex = -1;
    let calledIndex = -1;
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === 'from') {
        fromIndex = i;
      } else if (args[i] === 'called') {
        calledIndex = i;
      }
    }

    // If "from" is used, make sure it has arguments
    if (fromIndex !== -1 && (calledIndex === -1 ? fromIndex === args.length - 1 : fromIndex === calledIndex - 1)) {
      return 'Make command requires arguments after "from"';
    }

    // If "called" is used, make sure it has a variable name
    if (calledIndex !== -1 && calledIndex === args.length - 1) {
      return 'Make command requires variable name after "called"';
    }

    // Check for invalid keywords
    for (let i = 2; i < args.length; i++) {
      if (typeof args[i] === 'string' && args[i] !== 'from' && args[i] !== 'called' && i > 2) {
        // If we have more than 2 args and encounter a string that's not a keyword at position > 2
        // and it's not following a "from" or "called", it might be invalid syntax
        const prevArg = args[i - 1];
        if (prevArg !== 'from' && prevArg !== 'called' && typeof prevArg === 'string' && 
            prevArg !== args[1] && !this.isValidArgument(prevArg)) {
          return 'Invalid make syntax. Expected "from" or "called" keyword';
        }
      }
    }

    return null;
  }

  private isValidArgument(arg: any): boolean {
    // Consider arguments valid if they're not keywords and could be constructor arguments
    return arg !== 'from' && arg !== 'called';
  }

  private createDOMElement(elementExpression: string, context: ExecutionContext): HTMLElement {
    // Parse element expression like <div.class1.class2#id/>
    const match = elementExpression.match(/^<([^\.#/>]+)([^/>]*)\/?>$/);
    if (!match) {
      throw new Error('Invalid DOM element syntax');
    }

    const [, tagName, modifiers] = match;
    
    // Create the element
    let element: HTMLElement;
    if (typeof document !== 'undefined') {
      element = document.createElement(tagName);
    } else {
      // In test environment, create a mock element
      element = {
        tagName: tagName.toUpperCase(),
        classList: {
          add: (className: string) => {
            if (!element.className) element.className = '';
            element.className += (element.className ? ' ' : '') + className;
          },
          contains: (className: string) => {
            return element.className && element.className.split(' ').includes(className);
          }
        },
        className: '',
        id: ''
      } as any as HTMLElement;
    }

    // Parse modifiers for classes and ID
    if (modifiers) {
      const classMatches = modifiers.match(/\.([^\.#]+)/g);
      if (classMatches) {
        classMatches.forEach(match => {
          const className = match.substring(1); // Remove the dot
          element.classList.add(className);
        });
      }

      const idMatch = modifiers.match(/#([^\.#]+)/);
      if (idMatch) {
        element.id = idMatch[1];
      }
    }

    return element;
  }

  private createClassInstance(className: string, constructorArgs: any[], context: ExecutionContext): any {
    try {
      // Resolve the constructor function
      const Constructor = this.resolveConstructor(className);
      
      if (typeof Constructor !== 'function') {
        throw new Error(`${className} is not a constructor function`);
      }

      // Create new instance with arguments
      return new Constructor(...constructorArgs);
    } catch (error) {
      throw new Error(`Failed to create instance of ${className}: ${error.message}`);
    }
  }

  private resolveConstructor(className: string): any {
    // Handle nested constructors like Intl.ListFormat
    const parts = className.split('.');
    let constructor: any = global;

    for (const part of parts) {
      if (constructor && typeof constructor === 'object' && part in constructor) {
        constructor = constructor[part];
      } else {
        throw new Error(`Constructor ${className} not found`);
      }
    }

    return constructor;
  }

  private setVariableValue(name: string, value: any, context: ExecutionContext): void {
    // If variable exists in local scope, update it
    if (context.locals && context.locals.has(name)) {
      context.locals.set(name, value);
      return;
    }

    // If variable exists in global scope, update it  
    if (context.globals && context.globals.has(name)) {
      context.globals.set(name, value);
      return;
    }

    // Create new local variable
    if (!context.locals) {
      context.locals = new Map();
    }
    context.locals.set(name, value);
  }
}

export default MakeCommand;