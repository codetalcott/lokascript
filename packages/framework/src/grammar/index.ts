/**
 * Grammar transformation utilities for multilingual DSLs
 *
 * Core utilities for handling word order transformation (SVO/SOV/VSO),
 * grammatical marker insertion, and role-based reordering.
 */

export * from './types';

// Re-export key transformation functions
export { reorderRoles, insertMarkers, joinTokens } from './types';
