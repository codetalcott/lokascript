// @ts-nocheck - hyperscript _ attribute not typed in @kitajs/html
/**
 * Pattern routes for the patterns browser.
 */

import { Elysia } from 'elysia';
import { BaseLayout } from '../layouts/base';
import { PatternList } from '../partials/pattern-list';
import { CategoryFilter } from '../partials/category-filter';
import { SearchInput } from '../partials/search-input';
import {
  getPatterns,
  getPattern,
  getPatternsByFeature,
  search,
  getCategories,
  getStats,
  type Pattern,
} from '../db';

const PAGE_SIZE = 24;

/**
 * Build category list with counts from stats
 */
async function getCategoryStats() {
  const stats = await getStats();
  const categories = getCategories();
  return categories
    .filter(cat => stats.byCategory[cat] > 0)
    .map(cat => ({ id: cat, count: stats.byCategory[cat] || 0 }))
    .sort((a, b) => b.count - a.count);
}

export const patternsRoutes = new Elysia({ prefix: '/patterns' })
  // Full patterns page
  .get('/', async ({ query }) => {
    const category = query.category as string | undefined;
    const q = query.q as string | undefined;

    let patterns: Pattern[];
    if (q) {
      patterns = await search(q, { limit: PAGE_SIZE });
    } else if (category) {
      patterns = await getPatternsByFeature(category);
    } else {
      patterns = await getPatterns({ limit: PAGE_SIZE });
    }

    const categoryStats = await getCategoryStats();
    const totalPatterns = (await getStats()).totalPatterns;
    const hasMore = patterns.length === PAGE_SIZE;

    return (
      <BaseLayout title="Patterns">
        <h1>Hyperscript Patterns</h1>
        <p class="muted">
          {totalPatterns} patterns covering common UI interactions
        </p>

        <SearchInput />

        <div class="sidebar-layout">
          <CategoryFilter categories={categoryStats} activeCategory={category} />

          <div>
            <PatternList patterns={patterns} page={1} hasMore={hasMore} />
          </div>
        </div>
      </BaseLayout>
    );
  })

  // Pattern list partial (for htmx/hyperfixi requests)
  .get('/list', async ({ query }) => {
    const category = query.category as string | undefined;
    const q = query.q as string | undefined;
    const page = parseInt((query.page as string) || '1', 10);
    const offset = (page - 1) * PAGE_SIZE;

    let patterns: Pattern[];
    if (q) {
      patterns = await search(q, { limit: PAGE_SIZE, offset });
    } else if (category) {
      patterns = (await getPatternsByFeature(category)).slice(offset, offset + PAGE_SIZE);
    } else {
      patterns = await getPatterns({ limit: PAGE_SIZE, offset });
    }

    const hasMore = patterns.length === PAGE_SIZE;

    return <PatternList patterns={patterns} page={page} hasMore={hasMore} />;
  })

  // Single pattern detail page
  .get('/:id', async ({ params, headers }) => {
    const pattern = await getPattern(params.id);

    if (!pattern) {
      return (
        <BaseLayout title="Not Found">
          <h1>Pattern Not Found</h1>
          <p>The pattern "{params.id}" could not be found.</p>
          <p>
            <a href="/patterns">Back to patterns</a>
          </p>
        </BaseLayout>
      );
    }

    // Check if this is a partial request
    const isPartial = headers['hx-request'] === 'true';

    const content = (
      <>
        <nav class="breadcrumb">
          <a href="/patterns">Patterns</a> / {pattern.title}
        </nav>

        <h1>{pattern.title}</h1>

        {pattern.description && <p class="muted">{pattern.description}</p>}

        <div class="meta">
          {pattern.category && <chip>{pattern.category}</chip>}
          {pattern.primaryCommand && <chip class="muted">{pattern.primaryCommand}</chip>}
          <chip class="muted">{pattern.difficulty}</chip>
        </div>

        <h2>Code</h2>
        <pre class="code-block">{pattern.rawCode}</pre>

        <div>
          <button
            data-code={pattern.rawCode}
            _="on click
               call navigator.clipboard.writeText(my @data-code)
               put 'Copied!' into me
               add .ok to me
               wait 2s
               put 'Copy Code' into me
               remove .ok from me"
          >
            Copy Code
          </button>
        </div>

        <h2>Translations</h2>
        <p class="muted">
          <a href={`/translations/${pattern.id}`}>View translations in 13 languages</a>
        </p>
      </>
    );

    if (isPartial) {
      return content;
    }

    return <BaseLayout title={pattern.title}>{content}</BaseLayout>;
  });
