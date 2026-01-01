/**
 * Table renderer - generates HTML tables
 */

import { JTableQuery, FieldSpec, NormalizedRow } from "../types";
import { getByPath } from "../utils/path-utils";

export class TableRenderer {
  /**
   * Render a table from query results
   */
  static render(
    data: NormalizedRow[],
    query: JTableQuery,
    container: HTMLElement
  ): void {
    // Determine which fields to display
    const fields = this.getDisplayFields(data, query);

    // Clear any existing table or error panel - this is crucial for live updates!
    const existingWrapper = container.querySelector(".jtq-table-wrapper");
    if (existingWrapper) {
      existingWrapper.remove();
    }
    const existingError = container.querySelector(".jtq-error-panel");
    if (existingError) {
      existingError.remove();
    }

    // Create table wrapper
    const wrapper = container.createEl("div", { cls: "jtq-table-wrapper" });

    // Add title if provided
    if (query.render?.title) {
      wrapper.createEl("h3", {
        text: query.render.title,
        cls: "jtq-table-title",
      });
    }

    // Create table
    const table = wrapper.createEl("table", { cls: "jtq-table" });

    // Create header
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr", { cls: "jtq-header-row" });

    fields.forEach((field) => {
      const th = headerRow.createEl("th", {
        cls: "jtq-header-cell",
      });

      const fieldSpec = this.getFieldSpec(field, query);
      th.textContent = fieldSpec.label || field;
    });

    // Create body
    const tbody = table.createEl("tbody");

    if (data.length === 0) {
      const emptyRow = tbody.createEl("tr", { cls: "jtq-empty-row" });
      const emptyCell = emptyRow.createEl("td", {
        text: "No data",
        cls: "jtq-empty-cell",
        attr: { colspan: fields.length },
      });
    } else {
      data.forEach((row, rowIndex) => {
        const tr = tbody.createEl("tr", {
          cls: `jtq-data-row ${rowIndex % 2 === 0 ? "jtq-row-even" : "jtq-row-odd"}`,
        });

        fields.forEach((field) => {
          const td = tr.createEl("td", { cls: "jtq-data-cell" });
          const value = getByPath(row, field);
          const fieldSpec = this.getFieldSpec(field, query);
          td.textContent = this.formatValue(value, fieldSpec);
        });
      });
    }

    // Add footer if requested
    if (query.render?.footer === "count") {
      const footer = wrapper.createEl("div", { cls: "jtq-table-footer" });
      footer.textContent = `${data.length} row${data.length !== 1 ? "s" : ""}`;
    }
  }

  /**
   * Get fields to display
   */
  private static getDisplayFields(
    data: NormalizedRow[],
    query: JTableQuery
  ): string[] {
    if (query.fields) {
      // Ensure fields is an array
      if (!Array.isArray(query.fields)) {
        query.fields = [];
      }
      if (query.fields.length > 0) {
        return query.fields.map((f) => (typeof f === "string" ? f : f.path));
      }
    }

    // Infer from data
    if (data.length === 0) {
      return [];
    }

    const keys = new Set<string>();
    data.forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((key) => keys.add(key));
      }
    });

    return Array.from(keys);
  }

  /**
   * Get field spec for a field name
   */
  private static getFieldSpec(
    field: string,
    query: JTableQuery
  ): FieldSpec {
    if (!query.fields) {
      return { path: field };
    }

    for (const fieldDef of query.fields) {
      if (typeof fieldDef === "object") {
        if (fieldDef.path === field) {
          return fieldDef;
        }
      }
    }

    return { path: field };
  }

  /**
   * Format a value for display
   */
  private static formatValue(value: any, fieldSpec: FieldSpec): string {
    if (value === null || value === undefined) {
      return fieldSpec.default || "";
    }

    const format = fieldSpec.format || "auto";

    switch (format) {
      case "json":
        return typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2);

      case "date":
        try {
          const date = new Date(value);
          return date.toLocaleDateString();
        } catch {
          return String(value);
        }

      case "number":
        if (typeof value === "number") {
          return value.toLocaleString();
        }
        return String(value);

      case "auto":
      default:
        if (typeof value === "string") {
          return value;
        }
        if (typeof value === "number" || typeof value === "boolean") {
          return String(value);
        }
        if (Array.isArray(value)) {
          return `[${value.length} items]`;
        }
        if (typeof value === "object") {
          return "[object]";
        }
        return String(value);
    }
  }
}
