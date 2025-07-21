/**
 * Repeat Command Implementation
 * The repeat command provides iteration in the hyperscript language.
 * Generated from LSP data with TDD implementation
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class RepeatCommand implements CommandImplementation {
  name = 'repeat';
  syntax = 'repeat for <identifier> in <expression> [index <identifier>] { <command> } end';
  description = 'The repeat command provides iteration in the hyperscript language.';
  isBlocking = true; // Control flow commands are blocking

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length < 2) {
      throw new Error('Repeat command requires at least 2 arguments');
    }

    const [firstArg, ...rest] = args;
    let result: any = null;

    // Handle different repeat syntaxes
    if (firstArg === 'for') {
      // repeat for item in collection [index i] commands
      result = await this.handleForLoop(context, rest);
    } else if (firstArg === 'in') {
      // repeat in collection [index i] commands  
      result = await this.handleImplicitForLoop(context, rest);
    } else if (firstArg === 'while') {
      // repeat while condition [index i] commands
      result = await this.handleWhileLoop(context, rest);
    } else if (firstArg === 'until') {
      // repeat until condition [index i] commands
      result = await this.handleUntilLoop(context, rest);
    } else if (firstArg === 'forever') {
      // repeat forever commands
      result = await this.handleForeverLoop(context, rest);
    } else if (typeof firstArg === 'number') {
      // repeat N times [index i] commands
      result = await this.handleTimesLoop(context, firstArg, rest);
    } else {
      throw new Error(`Invalid repeat syntax: ${firstArg}`);
    }

    return result;
  }

  validate(args: any[]): string | null {
    if (args.length < 2) {
      return 'Repeat command requires at least 2 arguments';
    }

    const [firstArg, secondArg, thirdArg] = args;

    // Validate for loop syntax
    if (firstArg === 'for') {
      if (args.length < 4) {
        return 'For loop requires: for <variable> in <collection> <commands>';
      }
      if (thirdArg !== 'in') {
        return 'For loop requires "in" keyword';
      }
      return null;
    }

    // Validate implicit for loop syntax
    if (firstArg === 'in') {
      if (args.length < 3) {
        return 'Implicit for loop requires: in <collection> <commands>';
      }
      return null;
    }

    // Validate while/until loop syntax
    if (firstArg === 'while' || firstArg === 'until') {
      if (args.length < 3) {
        return `${firstArg} loop requires: ${firstArg} <condition> <commands>`;
      }
      return null;
    }

    // Validate times loop syntax
    if (typeof firstArg === 'number') {
      if (secondArg !== 'times') {
        return 'Numeric repeat requires "times" keyword';
      }
      if (args.length < 3) {
        return 'Times loop requires: <number> times <commands>';
      }
      return null;
    }

    // Validate forever loop syntax
    if (firstArg === 'forever') {
      if (args.length < 2) {
        return 'Forever loop requires: forever <commands>';
      }
      return null;
    }

    return 'Invalid repeat syntax';
  }

  private async handleForLoop(context: ExecutionContext, args: any[]): Promise<any> {
    // repeat for variable in collection [index indexVar] commands
    if (args.length < 3) {
      throw new Error('For loop requires variable, "in", collection, and commands');
    }

    const [variable, inKeyword, collection, ...rest] = args;
    
    if (inKeyword !== 'in') {
      throw new Error('For loop requires "in" keyword');
    }

    // Check for index syntax
    let indexVar: string | null = null;
    let commands: any;
    
    if (rest.length >= 3 && rest[0] === 'index') {
      indexVar = rest[1];
      commands = rest.slice(2);
    } else {
      commands = rest;
    }

    return await this.iterateCollection(context, collection, variable, indexVar, commands);
  }

  private async handleImplicitForLoop(context: ExecutionContext, args: any[]): Promise<any> {
    // repeat in collection [index indexVar] commands
    if (args.length < 2) {
      throw new Error('Implicit for loop requires collection and commands');
    }

    const [collection, ...rest] = args;
    
    // Check for index syntax
    let indexVar: string | null = null;
    let commands: any;
    
    if (rest.length >= 3 && rest[0] === 'index') {
      indexVar = rest[1];
      commands = rest.slice(2);
    } else {
      commands = rest;
    }

    return await this.iterateCollection(context, collection, null, indexVar, commands);
  }

  private async handleWhileLoop(context: ExecutionContext, args: any[]): Promise<any> {
    // repeat while condition [index indexVar] commands
    if (args.length < 2) {
      throw new Error('While loop requires condition and commands');
    }

    const [condition, ...rest] = args;
    
    // Check for index syntax
    let indexVar: string | null = null;
    let commands: any;
    
    if (rest.length >= 3 && rest[0] === 'index') {
      indexVar = rest[1];
      commands = rest.slice(2);
    } else {
      commands = rest;
    }

    // If commands is a single array, unwrap it
    if (Array.isArray(commands) && commands.length === 1 && Array.isArray(commands[0])) {
      commands = commands[0];
    }

    let result: any = null;
    let index = 0;

    while (this.evaluateCondition(condition)) {
      // Set index if specified
      if (indexVar) {
        this.setLocalVariable(context, indexVar, index);
      }

      result = await this.executeCommands(context, commands);
      
      // Check for control flow flags
      if (context.flags?.breaking || context.flags?.returning) {
        break;
      }
      
      if (context.flags?.continuing) {
        context.flags.continuing = false;
        index++;
        continue;
      }

      index++;
    }

    return result;
  }

  private async handleUntilLoop(context: ExecutionContext, args: any[]): Promise<any> {
    // repeat until condition [index indexVar] commands
    if (args.length < 2) {
      throw new Error('Until loop requires condition and commands');
    }

    const [condition, ...rest] = args;
    
    // Check for index syntax  
    let indexVar: string | null = null;
    let commands: any;
    
    if (rest.length >= 3 && rest[0] === 'index') {
      indexVar = rest[1];
      commands = rest.slice(2);
    } else {
      commands = rest;
    }

    // If commands is a single array, unwrap it
    if (Array.isArray(commands) && commands.length === 1 && Array.isArray(commands[0])) {
      commands = commands[0];
    }

    let result: any = null;
    let index = 0;

    // Handle special case for "until event" syntax
    if (condition === 'event' && rest.length >= 2) {
      const [eventCheck, ...eventCommands] = rest;
      while (!this.evaluateCondition(eventCheck)) {
        result = await this.executeCommands(context, eventCommands);
        if (context.flags?.breaking || context.flags?.returning) {
          break;
        }
        if (context.flags?.continuing) {
          context.flags.continuing = false;
          continue;
        }
      }
      return result;
    }

    // For until loops, execute commands at least once, then check condition
    do {
      // Set index if specified
      if (indexVar) {
        this.setLocalVariable(context, indexVar, index);
      }

      result = await this.executeCommands(context, commands);
      
      // Check for control flow flags
      if (context.flags?.breaking || context.flags?.returning) {
        break;
      }
      
      if (context.flags?.continuing) {
        context.flags.continuing = false;
        index++;
        continue;
      }

      index++;
    } while (!this.evaluateCondition(condition));

    return result;
  }

  private async handleTimesLoop(context: ExecutionContext, times: number, args: any[]): Promise<any> {
    // repeat N times [index indexVar] commands
    if (args.length < 2) {
      throw new Error('Times loop requires "times" keyword and commands');
    }

    const [timesKeyword, ...rest] = args;
    
    if (timesKeyword !== 'times') {
      throw new Error('Times loop requires "times" keyword');
    }

    // Handle negative or zero times
    if (times <= 0) {
      return null;
    }

    // Check for index syntax
    let indexVar: string | null = null;
    let commands: any;
    
    if (rest.length >= 3 && rest[0] === 'index') {
      indexVar = rest[1];
      commands = rest.slice(2);
    } else {
      commands = rest;
    }

    // If commands is a single array, unwrap it
    if (Array.isArray(commands) && commands.length === 1 && Array.isArray(commands[0])) {
      commands = commands[0];
    }

    let result: any = null;

    for (let i = 0; i < times; i++) {
      // Set index if specified
      if (indexVar) {
        this.setLocalVariable(context, indexVar, i);
      }

      result = await this.executeCommands(context, commands);
      
      // Check for control flow flags
      if (context.flags?.breaking || context.flags?.returning) {
        break;
      }
      
      if (context.flags?.continuing) {
        context.flags.continuing = false;
        continue;
      }
    }

    return result;
  }

  private async handleForeverLoop(context: ExecutionContext, args: any[]): Promise<any> {
    // repeat forever commands
    const commands = args;
    let result: any = null;

    while (true) {
      result = await this.executeCommands(context, commands);
      
      // Forever loops rely on break flag to exit
      if (context.flags?.breaking || context.flags?.returning) {
        break;
      }
      
      if (context.flags?.continuing) {
        context.flags.continuing = false;
        continue;
      }
    }

    return result;
  }

  private async iterateCollection(
    context: ExecutionContext,
    collection: any,
    variable: string | null,
    indexVar: string | null,
    commands: any
  ): Promise<any> {
    if (collection == null) {
      throw new Error('Cannot iterate over null or undefined collection');
    }

    // Convert collection to iterable array
    let items: any[];
    if (Array.isArray(collection)) {
      items = collection;
    } else if (collection instanceof NodeList) {
      items = Array.from(collection);
    } else if (collection instanceof HTMLCollection) {
      items = Array.from(collection);
    } else if (typeof collection === 'string') {
      items = collection.split('');
    } else if (typeof collection[Symbol.iterator] === 'function') {
      items = Array.from(collection);
    } else {
      throw new Error(`Collection is not iterable: ${typeof collection}`);
    }

    let result: any = null;

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      
      // Set iterator variable (or 'it' for implicit)
      if (variable) {
        this.setLocalVariable(context, variable, item);
      } else {
        // Implicit iteration uses 'it' context variable
        context.it = item;
      }
      
      // Set index if specified
      if (indexVar) {
        this.setLocalVariable(context, indexVar, index);
      }

      result = await this.executeCommands(context, commands);
      
      // Check for control flow flags
      if (context.flags?.breaking || context.flags?.returning) {
        break;
      }
      
      if (context.flags?.continuing) {
        context.flags.continuing = false;
        continue;
      }
    }

    return result;
  }

  private evaluateCondition(condition: any): boolean {
    if (typeof condition === 'function') {
      return Boolean(condition());
    }
    
    if (typeof condition === 'boolean') {
      return condition;
    }
    
    if (condition == null) {
      return false;
    }
    
    if (typeof condition === 'number') {
      return condition !== 0 && !isNaN(condition);
    }
    
    if (typeof condition === 'string') {
      return condition.length > 0;
    }
    
    if (Array.isArray(condition)) {
      return condition.length > 0;
    }
    
    return Boolean(condition);
  }

  private async executeCommands(context: ExecutionContext, commands: any): Promise<any> {
    let result: any = null;

    // Handle array of commands
    if (Array.isArray(commands)) {
      for (const command of commands) {
        if (typeof command === 'function') {
          result = await command(context);
        } else if (command && typeof command.execute === 'function') {
          result = await command.execute(context);
        } else if (command != null) {
          result = command;
        }
        
        // Check for control flow flags after each command
        if (context.flags?.breaking || context.flags?.continuing || context.flags?.returning) {
          break;
        }
      }
    }
    // Handle single command function 
    else if (typeof commands === 'function') {
      result = await commands(context);
    }
    // Handle single command object
    else if (commands && typeof commands.execute === 'function') {
      result = await commands.execute(context);
    }
    // Handle single non-function value (treat as literal result)
    else if (commands != null) {
      result = commands;
    }

    return result;
  }

  private setLocalVariable(context: ExecutionContext, name: string, value: any): void {
    if (!context.locals) {
      context.locals = new Map();
    }
    context.locals.set(name, value);
  }
}

export default RepeatCommand;