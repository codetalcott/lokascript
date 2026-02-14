/**
 * Context-Aware Extractor System — Re-exported from @lokascript/framework
 *
 * These types and utilities enable extractors that need access to tokenizer
 * state (keyword maps, morphological normalizers, etc.).
 */

export type { TokenizerContext, ContextAwareExtractor } from '@lokascript/framework';

export { isContextAwareExtractor, createTokenizerContext } from '@lokascript/framework';
