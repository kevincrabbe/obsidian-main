/**
 * JSON data extractor and normalizer
 */

import { DataLocation, QueryError, NormalizedRow } from "../types";

export interface ExtractionResult {
  success: boolean;
  data: NormalizedRow[];
  errors: QueryError[];
}

export class DataExtractor {
  /**
   * Extract and normalize JSON data
   */
  static extract(location: DataLocation): ExtractionResult {
    const errors: QueryError[] = [];

    try {
      // Parse JSON
      const raw = JSON.parse(location.content);

      // Normalize to array of objects
      const data = this.normalize(raw);

      return {
        success: true,
        data,
        errors,
      };
    } catch (e) {
      const error = e as Error;
      errors.push({
        type: "data",
        message: `JSON parse error: ${error.message}`,
        code: "JSON_PARSE_ERROR",
      });

      return {
        success: false,
        data: [],
        errors,
      };
    }
  }

  /**
   * Normalize raw JSON to array of objects
   */
  private static normalize(raw: any): NormalizedRow[] {
    // Array of objects - most common case
    if (Array.isArray(raw)) {
      return raw.filter((item) => typeof item === "object" && item !== null);
    }

    // Single object - convert to array with one row
    if (typeof raw === "object" && raw !== null) {
      // If it looks like a key-value object, convert to entries format
      const isPlainObject = Object.keys(raw).every(
        (key) => typeof raw[key] !== "object" || raw[key] === null
      );

      if (isPlainObject) {
        // Convert to key-value rows
        return Object.entries(raw).map(([key, value]) => ({
          key,
          value,
        }));
      } else {
        // Return as single row
        return [raw];
      }
    }

    // Primitives - wrap in object
    return [
      {
        value: raw,
      },
    ];
  }
}
