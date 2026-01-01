/**
 * Query execution engine - filters, sorts, and limits data
 */

import { JTableQuery, FilterExpr, QueryError } from "../types";
import { getByPath, getObjectKeys } from "../utils/path-utils";

export class QueryExecutor {
  /**
   * Execute a query against data
   */
  static execute(
    query: JTableQuery,
    data: any[]
  ): { success: boolean; data: any[]; errors: QueryError[] } {
    const errors: QueryError[] = [];

    try {
      let results = [...data];

      // 1. Normalize data (ensure array of objects)
      if (!Array.isArray(results)) {
        results = [results];
      }

      // 2. Apply filter/where
      const filterExpr = query.where || query.filter;
      if (filterExpr) {
        results = results.filter((row) => {
          const matches = this.matchesFilter(row, filterExpr);
          return matches;
        });
      }

      // 3. Select fields (or infer from data)
      let selectedFields: string[] = [];
      if (query.fields && query.fields.length > 0) {
        selectedFields = query.fields.map((f) =>
          typeof f === "string" ? f : f.path
        );
      } else {
        // Infer fields from all objects
        selectedFields = getObjectKeys(results);
      }

      // 4. Apply sorting
      if (query.sort && query.sort.length > 0) {
        results = this.sortResults(results, query.sort);
      }

      // 5. Apply distinct (simple implementation)
      if (query.distinct && selectedFields.length > 0) {
        const seen = new Set<string>();
        results = results.filter((row) => {
          const key = selectedFields.map((f) => getByPath(row, f)).join("|");
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
      }

      // 6. Apply offset and limit
      if (query.offset && query.offset > 0) {
        results = results.slice(query.offset);
      }
      if (query.limit && query.limit > 0) {
        results = results.slice(0, query.limit);
      }

      return {
        success: true,
        data: results,
        errors,
      };
    } catch (e) {
      const error = e as Error;
      errors.push({
        type: "execution",
        message: `Query execution error: ${error.message}`,
        code: "EXECUTION_ERROR",
      });

      return {
        success: false,
        data: [],
        errors,
      };
    }
  }

  /**
   * Check if a row matches filter criteria
   */
  private static matchesFilter(row: any, filter: FilterExpr): boolean {
    const { op } = filter;

    switch (op) {
      case "and":
        return (filter.args || []).every((f) => this.matchesFilter(row, f));

      case "or":
        return (filter.args || []).some((f) => this.matchesFilter(row, f));

      case "not":
        return !this.matchesFilter(row, filter.arg!);

      case "eq":
        return this.compareValues(getByPath(row, filter.path!), filter.value, "eq");

      case "ne":
        return this.compareValues(getByPath(row, filter.path!), filter.value, "ne");

      case "gt":
        return this.compareValues(getByPath(row, filter.path!), filter.value, "gt");

      case "gte":
        return this.compareValues(getByPath(row, filter.path!), filter.value, "gte");

      case "lt":
        return this.compareValues(getByPath(row, filter.path!), filter.value, "lt");

      case "lte":
        return this.compareValues(getByPath(row, filter.path!), filter.value, "lte");

      case "in":
        return (filter.value as any[]).includes(getByPath(row, filter.path!));

      case "contains":
        {
          const fieldValue = getByPath(row, filter.path!);
          if (Array.isArray(fieldValue)) {
            return fieldValue.includes(filter.value);
          }
          if (typeof fieldValue === "string") {
            return fieldValue.includes(filter.value);
          }
          return false;
        }

      case "exists":
        return getByPath(row, filter.path!) !== undefined;

      case "regex":
        {
          const fieldValue = getByPath(row, filter.path!);
          if (fieldValue === null || fieldValue === undefined) {
            return false;
          }
          try {
            const regex = new RegExp(filter.value, filter.flags);
            return regex.test(String(fieldValue));
          } catch {
            return false;
          }
        }

      default:
        return false;
    }
  }

  /**
   * Compare two values based on operator
   */
  private static compareValues(
    a: any,
    b: any,
    op: "eq" | "ne" | "gt" | "gte" | "lt" | "lte"
  ): boolean {
    // Handle undefined/null
    if (a === undefined || a === null) {
      if (op === "eq") return b === undefined || b === null;
      if (op === "ne") return b !== undefined && b !== null;
      return false;
    }

    switch (op) {
      case "eq":
        return a === b;
      case "ne":
        return a !== b;
      case "gt":
        return a > b;
      case "gte":
        return a >= b;
      case "lt":
        return a < b;
      case "lte":
        return a <= b;
      default:
        return false;
    }
  }

  /**
   * Sort results by multiple fields
   */
  private static sortResults(
    results: any[],
    sorts: Array<{ path: string; dir?: "asc" | "desc"; nulls?: "last" | "first" }>
  ): any[] {
    return [...results].sort((a, b) => {
      for (const sort of sorts) {
        const aVal = getByPath(a, sort.path);
        const bVal = getByPath(b, sort.path);
        const dir = sort.dir === "desc" ? -1 : 1;

        // Handle nulls
        const aNulls = aVal === null || aVal === undefined;
        const bNulls = bVal === null || bVal === undefined;

        if (aNulls && bNulls) {
          continue;
        }

        const nullsLast = sort.nulls !== "first";
        if (aNulls) {
          return nullsLast ? 1 : -1;
        }
        if (bNulls) {
          return nullsLast ? -1 : 1;
        }

        // Compare values
        if (aVal < bVal) {
          return -1 * dir;
        }
        if (aVal > bVal) {
          return 1 * dir;
        }
      }

      return 0;
    });
  }
}
