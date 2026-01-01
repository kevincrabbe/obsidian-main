/**
 * Global type definitions for the JSON Table Query plugin
 */

// ============================================================================
// Query Types
// ============================================================================

export interface FilterExpr {
  op: "and" | "or" | "not" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains" | "exists" | "regex";
  path?: string;
  value?: any;
  args?: FilterExpr[];
  arg?: FilterExpr;
  flags?: string;
}

export interface SortSpec {
  path: string;
  dir?: "asc" | "desc";
  nulls?: "last" | "first";
}

export interface FieldSpec {
  path: string;
  label?: string;
  format?: "auto" | "json" | "date" | "number" | "md";
  default?: string;
}

export interface JTableQuery {
  data?: {
    ref?: string;
    mode?: "auto" | "entries" | "singleRow" | "primitive";
    selector?: string;
  };
  fields?: Array<string | FieldSpec>;
  where?: FilterExpr;
  filter?: FilterExpr;
  sort?: SortSpec[];
  limit?: number;
  offset?: number;
  distinct?: boolean;
  rowId?: string;
  render?: {
    showQueryBlock?: boolean;
    showDataBlock?: boolean;
    collapseData?: boolean;
    title?: string;
    footer?: "count" | "none";
  };
  js?: {
    filterFn?: string;
    sortFn?: string;
    mapFn?: string;
  };
}

// ============================================================================
// Plugin Settings
// ============================================================================

export interface PluginSettings {
  // JavaScript execution
  enableJsExecution: boolean;
  jsExecutionWarningShown: boolean;

  // Caching
  enableDataCache: boolean;
  dataCacheSizeEntries: number;
  cacheInvalidationMs: number;

  // UI
  showTableBorders: boolean;
  alternateRowColors: boolean;
  sortableHeaders: boolean;

  // Error handling
  showErrorDetails: boolean;
  showQueryLogsInDev: boolean;

  // Default query limits
  defaultLimit?: number;
  defaultFields?: string[];
}

// ============================================================================
// Data Types
// ============================================================================

export interface DataLocation {
  lineStart: number;
  lineEnd: number;
  content: string;
  blockId?: string;
  markerId?: string;
}

export interface NormalizedRow {
  [key: string]: any;
}

// ============================================================================
// Error Types
// ============================================================================

export interface QueryError {
  type: "syntax" | "validation" | "execution" | "data" | "render";
  message: string;
  code?: string;
  line?: number;
  context?: string;
}

// ============================================================================
// Processing Context
// ============================================================================

export interface ProcessingContext {
  filePath: string;
  lineNumber: number;
  query: JTableQuery;
  data: NormalizedRow[];
  errors: QueryError[];
}
