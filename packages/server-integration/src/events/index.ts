/**
 * Event Sources for Server-Side Hyperscript
 *
 * Exports request event source and related utilities.
 */

export {
  createRequestEventSource,
  expressRequestToServerRequest,
  wrapExpressResponse,
  getDefaultRequestEventSource,
  resetDefaultRequestEventSource,
  type HttpMethod,
  type ServerRequest,
  type ServerResponse,
  type RequestHandler,
} from './request-event-source.js';
