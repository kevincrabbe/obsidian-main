/**
 * Query parser - handles YAML and JSON syntax
 */

import { JTableQuery, QueryError } from "../types";
import { ParseResult } from "./types";

export class QueryParser {
  /**
   * Parse query from string (YAML or JSON)
   */
  static parse(source: string): ParseResult {
    const trimmed = source.trim();

    if (!trimmed) {
      return {
        success: true,
        query: {},
      };
    }

    // Detect format by first non-whitespace character
    const firstChar = trimmed.charAt(0);

    if (firstChar === "{" || firstChar === "[") {
      return this.parseJson(trimmed);
    } else {
      return this.parseYaml(trimmed);
    }
  }

  /**
   * Parse JSON format
   */
  private static parseJson(source: string): ParseResult {
    try {
      const query = JSON.parse(source);
      return {
        success: true,
        query,
      };
    } catch (e) {
      const error = e as Error;
      return {
        success: false,
        error: {
          type: "syntax",
          message: `JSON parse error: ${error.message}`,
          code: "JSON_PARSE_ERROR",
        },
      };
    }
  }

  /**
   * Parse YAML format (simple implementation)
   * Handles basic key: value syntax
   */
  private static parseYaml(source: string): ParseResult {
    try {
      const query: any = {};
      const lines = source.split("\n");
      let currentKey: string | null = null;
      let currentValue: any = null;
      let arrayStack: any[] = [];
      let inArray = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith("#")) {
          continue;
        }

        // Detect indentation level
        const indent = line.match(/^\s*/)?.[0].length || 0;

        // Handle array items (lines starting with -)
        if (trimmed.startsWith("-")) {
          if (!inArray) {
            inArray = true;
            arrayStack = [];
          }
          const value = trimmed.substring(1).trim();
          if (value.includes(":")) {
            // Object in array
            const [objKey, objVal] = value.split(":").map((s) => s.trim());
            arrayStack.push({ [objKey]: this.parseValue(objVal) });
          } else {
            // Primitive in array
            arrayStack.push(this.parseValue(value));
          }
          continue;
        }

        // Handle regular key: value
        if (trimmed.includes(":")) {
          const colonIndex = trimmed.indexOf(":");
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();

          // If we were building an array, save it
          if (inArray && currentKey) {
            query[currentKey] = arrayStack;
            inArray = false;
            arrayStack = [];
          }

          currentKey = key;
          if (value) {
            currentValue = this.parseValue(value);
          } else {
            // Value might be on next line or it's an object
            currentValue = null;
          }
          query[currentKey] = currentValue;
        }
      }

      // Handle remaining array
      if (inArray && currentKey) {
        query[currentKey] = arrayStack;
      }

      return {
        success: true,
        query,
      };
    } catch (e) {
      const error = e as Error;
      return {
        success: false,
        error: {
          type: "syntax",
          message: `YAML parse error: ${error.message}`,
          code: "YAML_PARSE_ERROR",
        },
      };
    }
  }

  /**
   * Parse individual YAML values
   */
  private static parseValue(value: string): any {
    const trimmed = value.trim();

    // Null/undefined
    if (trimmed === "null" || trimmed === "~" || trimmed === "") {
      return null;
    }

    // Boolean
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;

    // Number
    if (!isNaN(Number(trimmed)) && trimmed !== "") {
      return Number(trimmed);
    }

    // Try to parse as JSON (for objects/arrays inline)
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Fall through to string
      }
    }

    // Handle inline array syntax [a, b, c]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const content = trimmed.slice(1, -1).trim();
      if (content) {
        return content.split(",").map((item) => {
          const itemTrimmed = item.trim();
          // Try parsing each item
          if (itemTrimmed === "true") return true;
          if (itemTrimmed === "false") return false;
          if (!isNaN(Number(itemTrimmed))) return Number(itemTrimmed);
          // Remove quotes if present
          if (
            (itemTrimmed.startsWith('"') && itemTrimmed.endsWith('"')) ||
            (itemTrimmed.startsWith("'") && itemTrimmed.endsWith("'"))
          ) {
            return itemTrimmed.slice(1, -1);
          }
          return itemTrimmed;
        });
      }
      return [];
    }

    // String (remove quotes if present)
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }

    // Return as string
    return trimmed;
  }
}
