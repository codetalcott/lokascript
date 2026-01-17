/**
 * Hyperscript Routes Middleware
 *
 * Exports both framework-agnostic and framework-specific implementations.
 */

// Framework-agnostic core
export {
  createHyperscriptMiddleware,
  setupHyperscriptRoutes,
  type HyperscriptRoutesOptions,
} from './framework-agnostic-routes.js';

// Framework adapters
export {
  createExpressAdapter,
  createKoaAdapter,
  createFastifyAdapter,
  createHonoAdapter,
  getAdapter,
  type FrameworkAdapter,
} from './adapters.js';

// Express convenience wrappers (backwards compatible)
export {
  createExpressHyperscriptMiddleware,
  setupExpressHyperscriptRoutes,
  // Legacy names for backwards compatibility
  createHyperscriptRoutesMiddleware,
  setupHyperscriptRoutes as setupHyperscriptRoutesExpress,
} from './express-routes.js';
