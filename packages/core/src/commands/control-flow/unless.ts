/**
 * Unless Command Implementation
 * Conditionally executes commands only if the condition is false (inverse of if)
 * Syntax: unless <condition> <command1> [<command2> ...]
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class UnlessCommand implements CommandImplementation {
  name = 'unless';
  syntax = 'unless <condition> <command> [<command> ...]';
  description = 'Execute commands only if the condition is false (inverse of if statement)';
  isBlocking = false;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length < 2) {
      throw new Error('Unless command requires at least 2 arguments: condition and command(s)');
    }

    const [condition, ...commands] = args;

    // Validate that all remaining arguments are command objects
    for (const command of commands) {
      if (!this.isValidCommand(command)) {
        throw new Error('All arguments after condition must be command objects with name and execute method');
      }
    }

    // Evaluate condition - if true, skip execution
    if (condition) {
      return undefined;
    }

    // Condition is false, execute commands in sequence
    return this.executeCommands(context, commands);
  }

  validate(args: any[]): string | null {
    if (args.length < 2) {
      return 'Unless command requires at least 2 arguments: condition and command(s)';
    }

    // Skip condition validation (first argument) as it can be any value
    const commands = args.slice(1);

    // Validate that all remaining arguments are command objects
    for (const command of commands) {
      if (!this.isValidCommand(command)) {
        return 'All arguments after condition must be command objects with name and execute method';
      }
    }

    return null;
  }

  private isValidCommand(command: any): boolean {
    return (
      command &&
      typeof command === 'object' &&
      typeof command.name === 'string' &&
      typeof command.execute === 'function'
    );
  }

  private async executeCommands(context: ExecutionContext, commands: any[]): Promise<any> {
    let lastResult: any;

    for (const command of commands) {
      try {
        lastResult = await command.execute(context);
      } catch (error) {
        // Re-throw the error to be handled by the caller
        throw error;
      }
    }

    return lastResult;
  }

  /**
   * Static utility method to create unless wrapper for any command
   */
  static async executeConditionally(
    context: ExecutionContext, 
    condition: any, 
    command: any
  ): Promise<any> {
    const unlessCmd = new UnlessCommand();
    return unlessCmd.execute(context, condition, command);
  }

  /**
   * Check if a condition would cause unless to skip execution
   */
  static wouldSkip(condition: any): boolean {
    return Boolean(condition);
  }

  /**
   * Check if a condition would cause unless to execute commands
   */
  static wouldExecute(condition: any): boolean {
    return !Boolean(condition);
  }
}