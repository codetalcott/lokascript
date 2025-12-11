/**
 * Explicit Mode Renderer
 *
 * Renders semantic nodes to explicit [command role:value] syntax.
 * Also renders to natural language syntax for any supported language.
 */

import type {
  SemanticNode,
  EventHandlerSemanticNode,
  SemanticValue,
  SemanticRenderer as ISemanticRenderer,
  LanguagePattern,
} from '../types';
import { getPatternsForLanguageAndCommand } from '../patterns';
import { getSupportedLanguages as getTokenizerLanguages } from '../tokenizers';

// =============================================================================
// Semantic Renderer Implementation
// =============================================================================

export class SemanticRendererImpl implements ISemanticRenderer {
  /**
   * Render a semantic node in the specified language.
   */
  render(node: SemanticNode, language: string): string {
    const patterns = getPatternsForLanguageAndCommand(language, node.action);

    if (patterns.length === 0) {
      // Fall back to explicit syntax if no patterns
      return this.renderExplicit(node);
    }

    // Find the best pattern for rendering (prefer patterns that match our roles)
    const bestPattern = this.findBestPattern(node, patterns);

    if (!bestPattern) {
      return this.renderExplicit(node);
    }

    return this.renderWithPattern(node, bestPattern);
  }

  /**
   * Render a semantic node in explicit mode.
   */
  renderExplicit(node: SemanticNode): string {
    const parts: string[] = [node.action];

    // Add roles
    for (const [role, value] of node.roles) {
      parts.push(`${role}:${this.valueToString(value)}`);
    }

    // Handle event handler body
    if (node.kind === 'event-handler') {
      const eventNode = node as EventHandlerSemanticNode;
      if (eventNode.body && eventNode.body.length > 0) {
        const bodyParts = eventNode.body.map(n => this.renderExplicit(n));
        parts.push(`body:${bodyParts.join(' ')}`);
      }
    }

    return `[${parts.join(' ')}]`;
  }

  /**
   * Get all supported languages.
   */
  supportedLanguages(): string[] {
    return getTokenizerLanguages();
  }

  /**
   * Find the best pattern for rendering a semantic node.
   */
  private findBestPattern(
    node: SemanticNode,
    patterns: LanguagePattern[]
  ): LanguagePattern | null {
    // Score patterns by how well they match our roles
    const scored = patterns.map(pattern => {
      let score = pattern.priority;

      // Bonus for patterns that use roles we have
      for (const token of pattern.template.tokens) {
        if (token.type === 'role' && node.roles.has(token.role)) {
          score += 10;
        }
      }

      return { pattern, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.length > 0 ? scored[0].pattern : null;
  }

  /**
   * Render a semantic node using a specific pattern.
   */
  private renderWithPattern(node: SemanticNode, pattern: LanguagePattern): string {
    const parts: string[] = [];

    for (const token of pattern.template.tokens) {
      const rendered = this.renderPatternToken(token, node);
      if (rendered !== null) {
        parts.push(rendered);
      }
    }

    // Handle event handler body (render separately after pattern)
    if (node.kind === 'event-handler') {
      const eventNode = node as EventHandlerSemanticNode;
      if (eventNode.body && eventNode.body.length > 0) {
        const bodyParts = eventNode.body.map(n =>
          this.render(n, pattern.language)
        );
        parts.push(bodyParts.join(' '));
      }
    }

    return parts.join(' ');
  }

  /**
   * Render a single pattern token.
   */
  private renderPatternToken(
    token: any,
    node: SemanticNode
  ): string | null {
    switch (token.type) {
      case 'literal':
        return token.value;

      case 'role': {
        const value = node.roles.get(token.role);
        if (!value) {
          if (token.optional) return null;
          // Use default if available
          return null;
        }
        return this.valueToNaturalString(value);
      }

      case 'group': {
        // Check if we have all required roles in the group
        const hasRequired = token.tokens
          .filter((t: any) => t.type === 'role' && !t.optional)
          .every((t: any) => node.roles.has(t.role));

        if (!hasRequired && token.optional) {
          return null;
        }

        const groupParts: string[] = [];
        for (const subToken of token.tokens) {
          const rendered = this.renderPatternToken(subToken, node);
          if (rendered !== null) {
            groupParts.push(rendered);
          }
        }

        return groupParts.length > 0 ? groupParts.join(' ') : null;
      }

      default:
        return null;
    }
  }

  /**
   * Convert a semantic value to a string for explicit syntax.
   */
  private valueToString(value: SemanticValue): string {
    switch (value.type) {
      case 'literal':
        if (typeof value.value === 'string') {
          // Check if it needs quoting
          if (value.dataType === 'string' || /\s/.test(value.value)) {
            return `"${value.value}"`;
          }
          return value.value;
        }
        return String(value.value);

      case 'selector':
        return value.value;

      case 'reference':
        return value.value;

      case 'property-path':
        return `${this.valueToString(value.object)}'s ${value.property}`;

      case 'expression':
        return value.raw;
    }
  }

  /**
   * Convert a semantic value to natural language string.
   */
  private valueToNaturalString(value: SemanticValue): string {
    switch (value.type) {
      case 'literal':
        if (typeof value.value === 'string' && value.dataType === 'string') {
          return `"${value.value}"`;
        }
        return String(value.value);

      case 'selector':
        return value.value;

      case 'reference':
        return value.value;

      case 'property-path':
        return `${this.valueToNaturalString(value.object)}'s ${value.property}`;

      case 'expression':
        return value.raw;
    }
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Singleton renderer instance.
 */
export const semanticRenderer = new SemanticRendererImpl();

/**
 * Render a semantic node in the specified language.
 */
export function render(node: SemanticNode, language: string): string {
  return semanticRenderer.render(node, language);
}

/**
 * Render a semantic node in explicit mode.
 */
export function renderExplicit(node: SemanticNode): string {
  return semanticRenderer.renderExplicit(node);
}
