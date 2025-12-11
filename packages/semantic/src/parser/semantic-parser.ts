/**
 * Semantic Parser
 *
 * The main parser that converts natural language hyperscript to semantic nodes.
 * Combines tokenization and pattern matching.
 */

import type {
  SemanticNode,
  CommandSemanticNode,
  EventHandlerSemanticNode,
  SemanticParser as ISemanticParser,
  SemanticValue,
  ActionType,
} from '../types';
import { createCommandNode, createEventHandler } from '../types';
import { tokenize, getSupportedLanguages as getTokenizerLanguages } from '../tokenizers';
import { getPatternsForLanguage } from '../patterns';
import { patternMatcher } from './pattern-matcher';

// =============================================================================
// Semantic Parser Implementation
// =============================================================================

export class SemanticParserImpl implements ISemanticParser {
  /**
   * Parse input in the specified language to a semantic node.
   */
  parse(input: string, language: string): SemanticNode {
    // Tokenize the input
    const tokens = tokenize(input, language);

    // Get patterns for this language
    const patterns = getPatternsForLanguage(language);

    if (patterns.length === 0) {
      throw new Error(`No patterns available for language: ${language}`);
    }

    // Sort patterns by priority (descending)
    const sortedPatterns = [...patterns].sort((a, b) => b.priority - a.priority);

    // Try to match event handler patterns first (they wrap commands)
    const eventPatterns = sortedPatterns.filter(p => p.command === 'on');
    const eventMatch = patternMatcher.matchBest(tokens, eventPatterns);

    if (eventMatch) {
      return this.buildEventHandler(eventMatch, tokens, language);
    }

    // Try command patterns
    const commandPatterns = sortedPatterns.filter(p => p.command !== 'on');
    const commandMatch = patternMatcher.matchBest(tokens, commandPatterns);

    if (commandMatch) {
      return this.buildCommand(commandMatch, language);
    }

    throw new Error(`Could not parse input in ${language}: ${input}`);
  }

  /**
   * Check if input can be parsed in the specified language.
   */
  canParse(input: string, language: string): boolean {
    try {
      this.parse(input, language);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all supported languages.
   */
  supportedLanguages(): string[] {
    return getTokenizerLanguages();
  }

  /**
   * Build a command semantic node from a pattern match.
   */
  private buildCommand(
    match: ReturnType<typeof patternMatcher.matchPattern>,
    language: string
  ): CommandSemanticNode {
    if (!match) {
      throw new Error('No match to build command from');
    }

    const roles: Record<string, SemanticValue> = {};
    for (const [role, value] of match.captured) {
      roles[role] = value;
    }

    return createCommandNode(
      match.pattern.command,
      roles,
      {
        sourceLanguage: language,
        patternId: match.pattern.id,
      }
    );
  }

  /**
   * Build an event handler semantic node from a pattern match.
   */
  private buildEventHandler(
    match: ReturnType<typeof patternMatcher.matchPattern>,
    tokens: ReturnType<typeof tokenize>,
    language: string
  ): EventHandlerSemanticNode {
    if (!match) {
      throw new Error('No match to build event handler from');
    }

    // Extract the event name
    const eventValue = match.captured.get('event');
    if (!eventValue) {
      throw new Error('Event handler pattern matched but no event captured');
    }

    // The remaining tokens after the event pattern are the body
    // For now, we'll try to parse them as a single command
    const body: SemanticNode[] = [];

    if (!tokens.isAtEnd()) {
      // Get command patterns for this language
      const commandPatterns = getPatternsForLanguage(language)
        .filter(p => p.command !== 'on')
        .sort((a, b) => b.priority - a.priority);

      // Try to match remaining tokens as commands
      while (!tokens.isAtEnd()) {
        const commandMatch = patternMatcher.matchBest(tokens, commandPatterns);
        if (commandMatch) {
          body.push(this.buildCommand(commandMatch, language));
        } else {
          // Skip unrecognized token
          tokens.advance();
        }
      }
    }

    return createEventHandler(
      eventValue,
      body,
      undefined,
      {
        sourceLanguage: language,
        patternId: match.pattern.id,
      }
    );
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Singleton parser instance.
 */
export const semanticParser = new SemanticParserImpl();

/**
 * Parse input in the specified language.
 */
export function parse(input: string, language: string): SemanticNode {
  return semanticParser.parse(input, language);
}

/**
 * Check if input can be parsed.
 */
export function canParse(input: string, language: string): boolean {
  return semanticParser.canParse(input, language);
}

/**
 * Parse and return command type if parseable.
 */
export function getCommandType(input: string, language: string): ActionType | null {
  try {
    const node = semanticParser.parse(input, language);
    return node.action;
  } catch {
    return null;
  }
}
