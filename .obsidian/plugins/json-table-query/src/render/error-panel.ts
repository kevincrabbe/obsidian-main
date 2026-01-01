/**
 * Error panel renderer
 */

import { QueryError } from "../types";

export class ErrorPanel {
  /**
   * Render an error panel
   */
  static render(errors: QueryError[], container: HTMLElement): void {
    if (!errors || errors.length === 0) {
      return;
    }

    const panel = container.createEl("div", { cls: "jtq-error-panel" });

    // Title
    panel.createEl("h4", {
      text: "Query Error",
      cls: "jtq-error-title",
    });

    // Error details
    errors.forEach((error, index) => {
      const errorEl = panel.createEl("div", { cls: "jtq-error-item" });

      // Error type and message
      errorEl.createEl("strong", {
        text: `${error.type}: `,
      });
      errorEl.createEl("span", {
        text: error.message,
      });

      // Error code (if available)
      if (error.code) {
        errorEl.createEl("code", {
          text: error.code,
          cls: "jtq-error-code",
        });
      }

      // Context (if available)
      if (error.context) {
        const contextEl = errorEl.createEl("pre", {
          cls: "jtq-error-context",
        });
        contextEl.createEl("code", {
          text: error.context,
        });
      }

      // Add separator between errors
      if (index < errors.length - 1) {
        panel.createEl("hr", { cls: "jtq-error-separator" });
      }
    });
  }

  /**
   * Clear error panel
   */
  static clear(container: HTMLElement): void {
    const panel = container.querySelector(".jtq-error-panel");
    if (panel) {
      panel.remove();
    }
  }

  /**
   * Check if container has errors
   */
  static hasErrors(container: HTMLElement): boolean {
    return !!container.querySelector(".jtq-error-panel");
  }
}
