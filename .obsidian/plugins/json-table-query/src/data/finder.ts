/**
 * JSON block finder - locates dataset blocks in notes
 */

import { MarkdownPostProcessorContext } from "obsidian";
import { DataLocation } from "../types";

export class DataFinder {
  /**
   * Find the next JSON block after current position
   * Uses the markdown post processor context to search through the document
   */
  static findNextJsonBlock(
    ctx: MarkdownPostProcessorContext
  ): DataLocation | null {
    try {
      const el = ctx.containerEl;

      console.log("[DataFinder] Starting search from container element", {
        tagName: el.tagName,
        className: el.className,
      });

      // Strategy 1: Look for JSON block in next sibling
      let nextCodeBlock = el.nextElementSibling as HTMLElement | null;
      if (nextCodeBlock && this.isJsonCodeBlock(nextCodeBlock)) {
        console.log("[DataFinder] Found JSON block as direct next sibling");
        const preEl = nextCodeBlock.querySelector("pre");
        const codeEl = preEl?.querySelector("code");
        if (codeEl) {
          const content = codeEl.textContent || "";
          console.log("[DataFinder] Successfully extracted JSON content");
          return {
            lineStart: 0,
            lineEnd: 1,
            content,
            blockId: this.generateBlockId(),
          };
        }
      }

      // Strategy 2: Search through all code blocks in the entire markdown view
      // Find the root markdown container
      let rootContainer = el;
      while (rootContainer.parentElement) {
        const parent = rootContainer.parentElement;
        // Stop at the markdown view container
        if (parent.classList.contains("markdown-source-view") ||
            parent.classList.contains("cm-s-obsidian")) {
          rootContainer = parent;
          break;
        }
        rootContainer = parent;
      }

      console.log("[DataFinder] Searching from root container", {
        tagName: rootContainer.tagName,
        className: rootContainer.className,
      });

      // Get the position of our element in the root container
      const allElements = Array.from(rootContainer.querySelectorAll("*"));
      const ourIndex = allElements.indexOf(el);
      console.log("[DataFinder] Container element is at index", ourIndex, "of", allElements.length, "total elements");

      // Look through all elements after our container
      for (let i = ourIndex + 1; i < allElements.length; i++) {
        const candidate = allElements[i] as HTMLElement;

        // Log every code block we encounter
        if (candidate.tagName === "PRE" || candidate.tagName === "DIV" && candidate.querySelector("pre")) {
          console.log("[DataFinder] Found code block at index", i, {
            tagName: candidate.tagName,
            className: candidate.className,
            dataLanguage: candidate.getAttribute("data-language"),
          });
        }

        if (this.isJsonCodeBlock(candidate)) {
          console.log("[DataFinder] Matched JSON block at element index", i);
          const preEl = candidate.querySelector("pre");
          const codeEl = preEl?.querySelector("code");
          if (codeEl) {
            const content = codeEl.textContent || "";
            console.log("[DataFinder] Successfully extracted JSON content from matched block");
            return {
              lineStart: 0,
              lineEnd: 1,
              content,
              blockId: this.generateBlockId(),
            };
          }
        }
      }

      console.log("[DataFinder] No JSON block found using any strategy");
      return null;
    } catch (e) {
      console.error("[DataFinder] Exception in findNextJsonBlock:", e);
      return null;
    }
  }

  /**
   * Find a JSON block by marker ID
   * Looks for HTML comments like <!-- jtable:data id=X -->
   */
  static findJsonBlockById(
    id: string,
    ctx: MarkdownPostProcessorContext
  ): DataLocation | null {
    try {
      const el = ctx.containerEl;
      let sibling = el.nextElementSibling as HTMLElement | null;

      while (sibling) {
        // Check if this element or previous comment matches the marker
        if (this.hasMarkerComment(sibling, id)) {
          // Look for the next JSON block after this marker
          let nextEl = sibling.nextElementSibling as HTMLElement | null;
          while (nextEl) {
            if (this.isJsonCodeBlock(nextEl)) {
              const preEl = nextEl.querySelector("pre");
              const codeEl = preEl?.querySelector("code");
              if (codeEl) {
                const content = codeEl.textContent || "";
                return {
                  lineStart: 0,
                  lineEnd: 1,
                  content,
                  blockId: id,
                  markerId: id,
                };
              }
            }
            nextEl = nextEl.nextElementSibling as HTMLElement | null;
          }
        }
        sibling = sibling.nextElementSibling as HTMLElement | null;
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Check if an element is a JSON code block
   */
  private static isJsonCodeBlock(el: HTMLElement): boolean {
    const debugInfo = {
      tagName: el.tagName,
      className: el.className,
    };

    // Try all possible detection strategies

    // Strategy 1: Check for data-language="json" attribute
    if (el.getAttribute("data-language") === "json") {
      console.log("[DataFinder] Strategy 1 matched: data-language attribute");
      return true;
    }

    // Strategy 2: Check parent for data-language
    if (el.parentElement?.getAttribute("data-language") === "json") {
      console.log("[DataFinder] Strategy 2 matched: parent data-language attribute");
      return true;
    }

    // Strategy 3: Check for language-json in code element class
    const codeEl = el.querySelector("code");
    if (codeEl) {
      if (codeEl.className.includes("language-json")) {
        console.log("[DataFinder] Strategy 3a matched: code.language-json class");
        return true;
      }
      // Check if code element's parent has the attribute
      if (codeEl.parentElement?.getAttribute("data-language") === "json") {
        console.log("[DataFinder] Strategy 3b matched: code parent data-language");
        return true;
      }
    }

    // Strategy 4: If element is PRE, check its code children
    if (el.tagName === "PRE") {
      const preCodeEl = el.querySelector("code");
      if (preCodeEl && preCodeEl.className.includes("language-json")) {
        console.log("[DataFinder] Strategy 4a matched: PRE > code.language-json");
        return true;
      }
      if (el.getAttribute("data-language") === "json") {
        console.log("[DataFinder] Strategy 4b matched: PRE with data-language");
        return true;
      }
    }

    // Strategy 5: Check if element is a code block container
    if (el.classList.contains("code-block")) {
      const lang = el.getAttribute("data-language");
      if (lang === "json") {
        console.log("[DataFinder] Strategy 5 matched: code-block container");
        return true;
      }
    }

    // Strategy 6: Check for markdown code fence content with json
    // Look for pre elements containing json-like content
    if (el.tagName === "PRE" || el.classList.contains("cm-s-obsidian")) {
      const text = el.textContent || "";
      // Try to detect if this looks like JSON
      if ((text.includes("{") && text.includes("}")) ||
          (text.includes("[") && text.includes("]"))) {
        // This might be JSON, check the code element too
        const code = el.querySelector("code");
        if (code?.className.includes("language-json")) {
          console.log("[DataFinder] Strategy 6 matched: JSON-like content in PRE");
          return true;
        }
      }
    }

    // Strategy 7: Last resort - check all descendants for code.language-json
    if (el.querySelector("code.language-json")) {
      console.log("[DataFinder] Strategy 7 matched: querySelector code.language-json");
      return true;
    }

    console.log("[DataFinder] No detection strategy matched for element:", debugInfo);
    return false;
  }

  /**
   * Check if element has a marker comment with the given ID
   */
  private static hasMarkerComment(el: HTMLElement, id: string): boolean {
    // Look for HTML comments in previous elements
    const text = el.textContent || "";
    const markerPattern = new RegExp(`jtable:data\\s+id\\s*=\\s*${id}`);
    return markerPattern.test(text);
  }

  /**
   * Generate a unique block ID
   */
  private static generateBlockId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
