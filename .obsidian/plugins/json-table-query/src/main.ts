/**
 * JSON Table Query - Obsidian Plugin
 * Main entry point
 */

import {
  Plugin,
  PluginSettingTab,
  App,
  Setting,
  MarkdownPostProcessorContext,
  MarkdownView,
} from "obsidian";
import { PluginSettings, JTableQuery, QueryError } from "./types";
import { QueryParser } from "./query/parser";
import { QueryExecutor } from "./query/executor";
import { DataFinder } from "./data/finder";
import { DataExtractor } from "./data/extractor";
import { TableRenderer } from "./render/table-renderer";
import { ErrorPanel } from "./render/error-panel";

// Default settings
const DEFAULT_SETTINGS: PluginSettings = {
  enableJsExecution: false,
  jsExecutionWarningShown: false,
  enableDataCache: true,
  dataCacheSizeEntries: 50,
  cacheInvalidationMs: 60000,
  showTableBorders: true,
  alternateRowColors: true,
  sortableHeaders: false,
  showErrorDetails: true,
  showQueryLogsInDev: false,
};

export default class JsonTableQueryPlugin extends Plugin {
  settings: PluginSettings;
  private debounceTimer: NodeJS.Timeout | null = null;

  async onload() {
    console.log("Loading JSON Table Query plugin");

    // Load settings
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

    // Register the 'jtable' code block processor with high priority to run early
    this.registerMarkdownCodeBlockProcessor(
      "jtable",
      (source, el, ctx) => {
        // Clear old results first
        const oldWrapper = el.querySelector(".jtq-table-wrapper");
        const oldError = el.querySelector(".jtq-error-panel");
        if (oldWrapper) oldWrapper.remove();
        if (oldError) oldError.remove();

        this.executeQueryInContainer(source, el, ctx);
      }
    );

    // Add settings tab
    this.addSettingTab(new JsonTableQuerySettingsTab(this.app, this));

    // Listen for metadata cache changes - this fires when content is rendered
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file.extension === "md") {
          // Schedule a re-render on next frame to let Obsidian finish rendering
          requestAnimationFrame(() => {
            this.scheduleRerender();
          });
        }
      })
    );

    // Also listen for file modifications (for when file is saved but cache hasn't updated)
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file.extension === "md") {
          requestAnimationFrame(() => {
            this.scheduleRerender();
          });
        }
      })
    );

    console.log("JSON Table Query plugin loaded");
  }

  /**
   * Schedule a debounced re-render of all tables on active file
   */
  private scheduleRerender(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.rerenderAllTables();
    }, 200); // 200ms debounce
  }

  /**
   * Re-render all tables in the currently active file
   * Forces Obsidian to reprocess all code blocks
   */
  private rerenderAllTables(): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      return;
    }

    const file = activeView.file;
    if (!file) {
      return;
    }

    // Read the current file content
    this.app.vault.read(file).then((content) => {
      // Find all jtable code blocks
      const jtablePattern = /```jtable\n([\s\S]*?)\n```/g;
      const matches = Array.from(content.matchAll(jtablePattern));

      // Find all rendered jtable result containers
      const container = activeView.containerEl;
      const resultContainers = container.querySelectorAll(
        ".cm-preview-code-block.cm-lang-jtable"
      );

      // For each rendered jtable, update its results
      resultContainers.forEach((resultContainer, index) => {
        if (matches[index]) {
          const source = matches[index][1].trim();
          // Clear old results
          const oldWrapper = resultContainer.querySelector(".jtq-table-wrapper");
          const oldError = resultContainer.querySelector(".jtq-error-panel");
          if (oldWrapper) oldWrapper.remove();
          if (oldError) oldError.remove();

          // Re-execute the query
          this.executeQueryInContainer(
            source,
            resultContainer as HTMLElement
          );
        }
      });
    });
  }

  /**
   * Execute a query and render results in a container
   * This is called from both initial processing and live updates
   */
  private executeQueryInContainer(
    source: string,
    container: HTMLElement,
    ctx?: MarkdownPostProcessorContext
  ): void {
    try {
      const errors: QueryError[] = [];

      // Parse the query
      const parseResult = QueryParser.parse(source);
      if (!parseResult.success || !parseResult.query) {
        if (parseResult.error) {
          errors.push(parseResult.error);
        }
        ErrorPanel.render(errors, container);
        return;
      }

      const query = parseResult.query as JTableQuery;

      // Always use file content approach - it's reliable and works in both initial and live update modes
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        errors.push({
          type: "data",
          message: "No active file",
          code: "NO_ACTIVE_FILE",
        });
        ErrorPanel.render(errors, container);
        return;
      }

      this.app.vault.read(activeFile).then((content) => {
        // Find the source query in the file to determine its position
        // This helps us match queries to their corresponding JSON blocks
        const jtableBlockPattern = /```jtable\n([\s\S]*?)\n```/g;
        const jtableMatches = Array.from(content.matchAll(jtableBlockPattern));

        // Find which jtable query we are (by matching source)
        let queryIndex = -1;
        const normalizedSource = source.trim();
        for (let i = 0; i < jtableMatches.length; i++) {
          if (jtableMatches[i][1].trim() === normalizedSource) {
            queryIndex = i;
            break;
          }
        }

        // Find all JSON blocks with their positions
        const jsonBlockPattern = /```json\n([\s\S]*?)\n```/g;
        const jsonMatches = Array.from(content.matchAll(jsonBlockPattern));

        if (jsonMatches.length === 0) {
          errors.push({
            type: "data",
            message: "No JSON data block found in this file",
            code: "DATA_NOT_FOUND",
          });
          ErrorPanel.render(errors, container);
          return;
        }

        // Use the JSON block at the same index as the query
        // This ensures each query uses its corresponding JSON block
        const matchIndex = queryIndex >= 0 && queryIndex < jsonMatches.length ? queryIndex : 0;
        const match = jsonMatches[matchIndex];

        if (!match || !match[1]) {
          errors.push({
            type: "data",
            message: "No JSON data block found",
            code: "DATA_NOT_FOUND",
          });
          ErrorPanel.render(errors, container);
          return;
        }

        const dataLocation = {
          lineStart: 0,
          lineEnd: 1,
          content: match[1].trim(),
          blockId: "extracted",
        };

        const extractResult = DataExtractor.extract(dataLocation);
        if (!extractResult.success) {
          ErrorPanel.render(extractResult.errors, container);
          return;
        }

        const execResult = QueryExecutor.execute(query, extractResult.data);
        if (!execResult.success) {
          ErrorPanel.render(execResult.errors, container);
          return;
        }

        TableRenderer.render(execResult.data, query, container);

        if (this.settings.showQueryLogsInDev) {
          console.log("JSON Table Query executed", {
            query,
            queryIndex,
            matchIndex,
            inputRows: extractResult.data.length,
            outputRows: execResult.data.length,
          });
        }
      });
    } catch (e) {
      const error = e as Error;
      const errors: QueryError[] = [
        {
          type: "execution",
          message: `Unexpected error: ${error.message}`,
          code: "UNEXPECTED_ERROR",
        },
      ];
      ErrorPanel.render(errors, container);
      console.error("JSON Table Query error:", error);
    }
  }

  onunload() {
    console.log("Unloading JSON Table Query plugin");
  }
}

/**
 * Settings tab UI
 */
class JsonTableQuerySettingsTab extends PluginSettingTab {
  plugin: JsonTableQueryPlugin;

  constructor(app: App, plugin: JsonTableQueryPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "JSON Table Query Settings" });

    // JavaScript Execution Setting
    new Setting(containerEl)
      .setName("Enable JavaScript functions")
      .setDesc(
        "Allow query blocks to use js.filterFn, js.sortFn, and js.mapFn. WARNING: These run with plugin privileges."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableJsExecution)
          .onChange(async (value) => {
            this.plugin.settings.enableJsExecution = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    // Data Cache Setting
    new Setting(containerEl)
      .setName("Enable data caching")
      .setDesc("Cache parsed JSON data blocks for better performance")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableDataCache)
          .onChange(async (value) => {
            this.plugin.settings.enableDataCache = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    // Cache Size Setting
    new Setting(containerEl)
      .setName("Cache size (entries)")
      .setDesc("Maximum number of data blocks to cache")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.dataCacheSizeEntries))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.dataCacheSizeEntries = num;
              await this.plugin.saveData(this.plugin.settings);
            }
          })
      );

    // Table Borders Setting
    new Setting(containerEl)
      .setName("Show table borders")
      .setDesc("Display borders around table cells")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showTableBorders)
          .onChange(async (value) => {
            this.plugin.settings.showTableBorders = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    // Alternate Row Colors Setting
    new Setting(containerEl)
      .setName("Alternate row colors")
      .setDesc("Display rows with alternating background colors")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.alternateRowColors)
          .onChange(async (value) => {
            this.plugin.settings.alternateRowColors = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    // Error Details Setting
    new Setting(containerEl)
      .setName("Show error details")
      .setDesc("Display detailed error messages and stack traces")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showErrorDetails)
          .onChange(async (value) => {
            this.plugin.settings.showErrorDetails = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    // Debug Logs Setting
    new Setting(containerEl)
      .setName("Show query logs (dev mode)")
      .setDesc("Log query execution details to console")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showQueryLogsInDev)
          .onChange(async (value) => {
            this.plugin.settings.showQueryLogsInDev = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    // Info section
    containerEl.createEl("hr");
    containerEl.createEl("h3", { text: "Information" });
    containerEl.createEl("p", {
      text: "For query syntax documentation and examples, see the plugin documentation.",
      cls: "setting-item-description",
    });
  }
}
