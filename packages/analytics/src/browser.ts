/**
 * HyperFixi Analytics Browser Bundle
 *
 * This bundle provides analytics functionality for browser environments.
 * It exposes the analytics API as `window.HyperFixiAnalytics`.
 *
 * Usage:
 * ```html
 * <script src="hyperfixi-browser.js"></script>
 * <script src="analytics-browser.js"></script>
 * <script>
 *   const analytics = await HyperFixiAnalytics.quickStartAnalytics({});
 *   HyperFixiAnalytics.integrateWithHyperFixi(hyperfixi, analytics);
 * </script>
 * ```
 */

// Re-export main analytics functions
export {
  createAnalyticsSystem,
  quickStartAnalytics,
  integrateWithHyperFixi,
  createTrackedCompile,
  type HyperFixiIntegrationOptions,
  VERSION,
  DEFAULT_ANALYTICS_CONFIG,
} from './index';

// Re-export tracker
export {
  AnalyticsTracker,
  createAnalyticsTracker,
  getTracker,
  initAnalytics,
} from './tracker';

// Re-export collector
export {
  EventCollector,
  createEventCollector,
} from './collector';

// Re-export types
export type {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsConfig,
  AnalyticsMetrics,
  AnalyticsSession,
  AnalyticsCollector,
  AnalyticsStorage,
  AnalyticsQuery,
} from './types';

// Simple in-memory storage for browser use
export function createInMemoryStorage() {
  const events: import('./types').AnalyticsEvent[] = [];

  return {
    async store(event: import('./types').AnalyticsEvent): Promise<void> {
      events.push(event);
    },
    async storeBatch(batch: import('./types').AnalyticsEvent[]): Promise<void> {
      events.push(...batch);
    },
    async query(query: import('./types').AnalyticsQuery): Promise<import('./types').AnalyticsEvent[]> {
      let result = [...events];
      if (query.eventTypes?.length) {
        result = result.filter(e => query.eventTypes!.includes(e.type));
      }
      if (query.startTime) {
        result = result.filter(e => e.timestamp >= query.startTime!);
      }
      if (query.endTime) {
        result = result.filter(e => e.timestamp <= query.endTime!);
      }
      if (query.limit) {
        result = result.slice(query.offset ?? 0, (query.offset ?? 0) + query.limit);
      }
      return result;
    },
    async aggregate(): Promise<Record<string, number>> {
      const counts: Record<string, number> = {};
      for (const event of events) {
        counts[event.type] = (counts[event.type] ?? 0) + 1;
      }
      return counts;
    },
    async delete(query: import('./types').AnalyticsQuery): Promise<number> {
      const initial = events.length;
      // Clear matching events
      if (!query.eventTypes?.length && !query.startTime && !query.endTime) {
        events.length = 0;
      }
      return initial - events.length;
    },
    // Helper to get all events
    getAll(): import('./types').AnalyticsEvent[] {
      return [...events];
    },
    // Helper to clear
    clear(): void {
      events.length = 0;
    },
  };
}
