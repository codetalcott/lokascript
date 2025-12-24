/**
 * Category filter sidebar component.
 */

interface CategoryFilterProps {
  categories: Array<{ id: string; count: number }>;
  activeCategory?: string;
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  return (
    <nav class="sidebar">
      <h3>Categories</h3>
      <ul>
        <li>
          <a
            href="/patterns"
            class={!activeCategory ? 'active' : ''}
            _={`on click
                halt the event
                fetch '/patterns/list' as html
                morph #pattern-list with it using view transition
                push url '/patterns'
                remove .active from <a/> in closest <nav/>
                add .active to me
              end`}
          >
            All patterns
          </a>
        </li>
        {categories.map(cat => (
          <li>
            <a
              href={`/patterns?category=${cat.id}`}
              class={activeCategory === cat.id ? 'active' : ''}
              _={`on click
                  halt the event
                  fetch '/patterns/list?category=${cat.id}' as html
                  morph #pattern-list with it using view transition
                  push url '/patterns?category=${cat.id}'
                  remove .active from <a/> in closest <nav/>
                  add .active to me
                end`}
            >
              {cat.id}
              <chip class="muted">{cat.count}</chip>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
