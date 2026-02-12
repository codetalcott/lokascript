/**
 * Generic Value Extractors
 *
 * These extractors work for most programming-language-style DSLs.
 * DSLs can use these as-is or provide custom extractors for domain-specific syntax.
 */

export { OperatorExtractor, DEFAULT_OPERATORS } from './operator';
export { PunctuationExtractor, DEFAULT_PUNCTUATION } from './punctuation';
