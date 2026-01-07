/**
 * Ukrainian Language Module
 *
 * Self-registering module that sets up Ukrainian language support.
 * Import this module to enable Ukrainian in the semantic parser.
 *
 * @example
 * ```typescript
 * // Enable Ukrainian
 * import '@hyperfixi/semantic/languages/uk';
 *
 * // Or import everything
 * import '@hyperfixi/semantic/languages/_all';
 * ```
 */

import { registerLanguage } from '../registry';
import { ukrainianTokenizer } from '../tokenizers/ukrainian';
import { ukrainianProfile } from '../generators/profiles/ukrainian';

// Re-export for direct access
export { ukrainianTokenizer } from '../tokenizers/ukrainian';
export { ukrainianProfile } from '../generators/profiles/ukrainian';

// Self-register on import
registerLanguage('uk', ukrainianTokenizer, ukrainianProfile);
