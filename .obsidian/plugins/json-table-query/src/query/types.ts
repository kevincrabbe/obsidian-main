/**
 * Query-specific type definitions and utilities
 */

import { JTableQuery, FilterExpr, SortSpec, FieldSpec, QueryError } from "../types";

export type { JTableQuery, FilterExpr, SortSpec, FieldSpec };

export interface ParseResult {
  success: boolean;
  query?: JTableQuery;
  error?: QueryError;
}

export interface ExecutionResult {
  success: boolean;
  data?: any[];
  errors: QueryError[];
}

/**
 * Validate that a parsed query has the correct structure
 */
export function validateQuery(query: any): query is JTableQuery {
  if (!query || typeof query !== "object") {
    return false;
  }
  // Minimal validation - just check it's an object
  return true;
}
