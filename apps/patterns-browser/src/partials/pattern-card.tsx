/**
 * Pattern card component - displays a single pattern in the grid.
 */

import type { Pattern } from '../db';
import { HyperscriptCode } from '../components/code-block';

interface PatternCardProps {
  pattern: Pattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  return (
    <article
      class="pattern-card box"
      _={`on click
          fetch '/patterns/${pattern.id}' as html
          morph #main with it using view transition
          push url '/patterns/${pattern.id}'
        end`}
    >
      <h3>{pattern.title}</h3>
      <div class="code">
        <HyperscriptCode code={pattern.rawCode} />
      </div>
      <div class="meta">
        {pattern.category && <chip>{pattern.category}</chip>}
        {pattern.primaryCommand && <chip class="muted">{pattern.primaryCommand}</chip>}
        <chip class="muted">{pattern.difficulty}</chip>
      </div>
    </article>
  );
}
