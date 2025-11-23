/**
 * Test Bundle: Baseline (V1 Legacy Runtime)
 *
 * This bundle uses the V1 legacy Runtime with all commands for comparison.
 * Expected size: ~366 KB (V1 baseline for comparison)
 *
 * Note: After Phase 7, this imports from runtime-v1-legacy.ts to preserve
 * the V1 baseline for bundle size comparisons.
 */

import { Runtime } from '../runtime/runtime-v1-legacy';

// Create original runtime (imports all commands)
export const runtime = new Runtime();

// Export for browser global
if (typeof window !== 'undefined') {
  (window as any).HyperFixiBaseline = {
    runtime,
    version: '1.0.0-baseline',
    commands: 'all',
  };
}

export default runtime;
