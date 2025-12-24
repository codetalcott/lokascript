// @ts-nocheck - hyperscript _ attribute not typed in @kitajs/html
/**
 * Pattern list partial - the grid of pattern cards.
 */

import type { Pattern } from '../db';
import { PatternCard } from './pattern-card';

interface PatternListProps {
  patterns: Pattern[];
  page?: number;
  hasMore?: boolean;
}

export function PatternList({ patterns, page = 1, hasMore = false }: PatternListProps) {
  if (patterns.length === 0) {
    return (
      <div id="pattern-list" class="center muted">
        <p>No patterns found.</p>
      </div>
    );
  }

  return (
    <div id="pattern-list" class="pattern-grid">
      {patterns.map(pattern => (
        <PatternCard pattern={pattern} />
      ))}

      {hasMore && (
        <div
          id="load-more-trigger"
          class="center muted"
          _={`on intersection(threshold: 0.5) once
              fetch '/patterns/list?page=${page + 1}' as html
              put it after me
              remove me
            end`}
        >
          Loading more...
        </div>
      )}
    </div>
  );
}
