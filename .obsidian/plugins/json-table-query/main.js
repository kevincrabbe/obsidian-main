var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main.ts
__export(exports, {
  default: () => JsonTableQueryPlugin
});
var import_obsidian = __toModule(require("obsidian"));

// src/query/parser.ts
var QueryParser = class {
  static parse(source) {
    const trimmed = source.trim();
    if (!trimmed) {
      return {
        success: true,
        query: {}
      };
    }
    const firstChar = trimmed.charAt(0);
    if (firstChar === "{" || firstChar === "[") {
      return this.parseJson(trimmed);
    } else {
      return this.parseYaml(trimmed);
    }
  }
  static parseJson(source) {
    try {
      const query = JSON.parse(source);
      return {
        success: true,
        query
      };
    } catch (e) {
      const error = e;
      return {
        success: false,
        error: {
          type: "syntax",
          message: `JSON parse error: ${error.message}`,
          code: "JSON_PARSE_ERROR"
        }
      };
    }
  }
  static parseYaml(source) {
    var _a;
    try {
      const query = {};
      const lines = source.split("\n");
      let currentKey = null;
      let currentValue = null;
      let arrayStack = [];
      let inArray = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          continue;
        }
        const indent = ((_a = line.match(/^\s*/)) == null ? void 0 : _a[0].length) || 0;
        if (trimmed.startsWith("-")) {
          if (!inArray) {
            inArray = true;
            arrayStack = [];
          }
          const value = trimmed.substring(1).trim();
          if (value.includes(":")) {
            const [objKey, objVal] = value.split(":").map((s) => s.trim());
            arrayStack.push({ [objKey]: this.parseValue(objVal) });
          } else {
            arrayStack.push(this.parseValue(value));
          }
          continue;
        }
        if (trimmed.includes(":")) {
          const colonIndex = trimmed.indexOf(":");
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          if (inArray && currentKey) {
            query[currentKey] = arrayStack;
            inArray = false;
            arrayStack = [];
          }
          currentKey = key;
          if (value) {
            currentValue = this.parseValue(value);
          } else {
            currentValue = null;
          }
          query[currentKey] = currentValue;
        }
      }
      if (inArray && currentKey) {
        query[currentKey] = arrayStack;
      }
      return {
        success: true,
        query
      };
    } catch (e) {
      const error = e;
      return {
        success: false,
        error: {
          type: "syntax",
          message: `YAML parse error: ${error.message}`,
          code: "YAML_PARSE_ERROR"
        }
      };
    }
  }
  static parseValue(value) {
    const trimmed = value.trim();
    if (trimmed === "null" || trimmed === "~" || trimmed === "") {
      return null;
    }
    if (trimmed === "true")
      return true;
    if (trimmed === "false")
      return false;
    if (!isNaN(Number(trimmed)) && trimmed !== "") {
      return Number(trimmed);
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
      }
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const content = trimmed.slice(1, -1).trim();
      if (content) {
        return content.split(",").map((item) => {
          const itemTrimmed = item.trim();
          if (itemTrimmed === "true")
            return true;
          if (itemTrimmed === "false")
            return false;
          if (!isNaN(Number(itemTrimmed)))
            return Number(itemTrimmed);
          if (itemTrimmed.startsWith('"') && itemTrimmed.endsWith('"') || itemTrimmed.startsWith("'") && itemTrimmed.endsWith("'")) {
            return itemTrimmed.slice(1, -1);
          }
          return itemTrimmed;
        });
      }
      return [];
    }
    if (trimmed.startsWith('"') && trimmed.endsWith('"') || trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }
};

// src/utils/path-utils.ts
function getByPath(obj, path) {
  if (!path || !obj) {
    return void 0;
  }
  const segments = parsePathSegments(path);
  let current = obj;
  for (const segment of segments) {
    if (current === null || current === void 0) {
      return void 0;
    }
    if (typeof segment === "number") {
      current = current[segment];
    } else {
      current = current[segment];
    }
  }
  return current;
}
function parsePathSegments(path) {
  const segments = [];
  let current = "";
  let i = 0;
  while (i < path.length) {
    const char = path[i];
    if (char === ".") {
      if (current) {
        segments.push(current);
        current = "";
      }
      i++;
    } else if (char === "[") {
      if (current) {
        segments.push(current);
        current = "";
      }
      i++;
      let indexStr = "";
      while (i < path.length && path[i] !== "]") {
        indexStr += path[i];
        i++;
      }
      const index = parseInt(indexStr, 10);
      if (!isNaN(index)) {
        segments.push(index);
      }
      i++;
    } else if (char === "]") {
      i++;
    } else {
      current += char;
      i++;
    }
  }
  if (current) {
    segments.push(current);
  }
  return segments;
}
function getObjectKeys(objects) {
  const keys = new Set();
  for (const obj of objects) {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => keys.add(key));
    }
  }
  return Array.from(keys);
}

// src/query/executor.ts
var QueryExecutor = class {
  static execute(query, data) {
    const errors = [];
    try {
      let results = [...data];
      if (!Array.isArray(results)) {
        results = [results];
      }
      const filterExpr = query.where || query.filter;
      if (filterExpr) {
        results = results.filter((row) => {
          const matches = this.matchesFilter(row, filterExpr);
          return matches;
        });
      }
      let selectedFields = [];
      if (query.fields && query.fields.length > 0) {
        selectedFields = query.fields.map((f) => typeof f === "string" ? f : f.path);
      } else {
        selectedFields = getObjectKeys(results);
      }
      if (query.sort && query.sort.length > 0) {
        results = this.sortResults(results, query.sort);
      }
      if (query.distinct && selectedFields.length > 0) {
        const seen = new Set();
        results = results.filter((row) => {
          const key = selectedFields.map((f) => getByPath(row, f)).join("|");
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
      }
      if (query.offset && query.offset > 0) {
        results = results.slice(query.offset);
      }
      if (query.limit && query.limit > 0) {
        results = results.slice(0, query.limit);
      }
      return {
        success: true,
        data: results,
        errors
      };
    } catch (e) {
      const error = e;
      errors.push({
        type: "execution",
        message: `Query execution error: ${error.message}`,
        code: "EXECUTION_ERROR"
      });
      return {
        success: false,
        data: [],
        errors
      };
    }
  }
  static matchesFilter(row, filter) {
    const { op } = filter;
    switch (op) {
      case "and":
        return (filter.args || []).every((f) => this.matchesFilter(row, f));
      case "or":
        return (filter.args || []).some((f) => this.matchesFilter(row, f));
      case "not":
        return !this.matchesFilter(row, filter.arg);
      case "eq":
        return this.compareValues(getByPath(row, filter.path), filter.value, "eq");
      case "ne":
        return this.compareValues(getByPath(row, filter.path), filter.value, "ne");
      case "gt":
        return this.compareValues(getByPath(row, filter.path), filter.value, "gt");
      case "gte":
        return this.compareValues(getByPath(row, filter.path), filter.value, "gte");
      case "lt":
        return this.compareValues(getByPath(row, filter.path), filter.value, "lt");
      case "lte":
        return this.compareValues(getByPath(row, filter.path), filter.value, "lte");
      case "in":
        return filter.value.includes(getByPath(row, filter.path));
      case "contains": {
        const fieldValue = getByPath(row, filter.path);
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(filter.value);
        }
        if (typeof fieldValue === "string") {
          return fieldValue.includes(filter.value);
        }
        return false;
      }
      case "exists":
        return getByPath(row, filter.path) !== void 0;
      case "regex": {
        const fieldValue = getByPath(row, filter.path);
        if (fieldValue === null || fieldValue === void 0) {
          return false;
        }
        try {
          const regex = new RegExp(filter.value, filter.flags);
          return regex.test(String(fieldValue));
        } catch (e) {
          return false;
        }
      }
      default:
        return false;
    }
  }
  static compareValues(a, b, op) {
    if (a === void 0 || a === null) {
      if (op === "eq")
        return b === void 0 || b === null;
      if (op === "ne")
        return b !== void 0 && b !== null;
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
  static sortResults(results, sorts) {
    return [...results].sort((a, b) => {
      for (const sort of sorts) {
        const aVal = getByPath(a, sort.path);
        const bVal = getByPath(b, sort.path);
        const dir = sort.dir === "desc" ? -1 : 1;
        const aNulls = aVal === null || aVal === void 0;
        const bNulls = bVal === null || bVal === void 0;
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
};

// src/data/extractor.ts
var DataExtractor = class {
  static extract(location) {
    const errors = [];
    try {
      const raw = JSON.parse(location.content);
      const data = this.normalize(raw);
      return {
        success: true,
        data,
        errors
      };
    } catch (e) {
      const error = e;
      errors.push({
        type: "data",
        message: `JSON parse error: ${error.message}`,
        code: "JSON_PARSE_ERROR"
      });
      return {
        success: false,
        data: [],
        errors
      };
    }
  }
  static normalize(raw) {
    if (Array.isArray(raw)) {
      return raw.filter((item) => typeof item === "object" && item !== null);
    }
    if (typeof raw === "object" && raw !== null) {
      const isPlainObject = Object.keys(raw).every((key) => typeof raw[key] !== "object" || raw[key] === null);
      if (isPlainObject) {
        return Object.entries(raw).map(([key, value]) => ({
          key,
          value
        }));
      } else {
        return [raw];
      }
    }
    return [
      {
        value: raw
      }
    ];
  }
};

// src/render/table-renderer.ts
var TableRenderer = class {
  static render(data, query, container) {
    var _a, _b;
    const fields = this.getDisplayFields(data, query);
    const existingWrapper = container.querySelector(".jtq-table-wrapper");
    if (existingWrapper) {
      existingWrapper.remove();
    }
    const existingError = container.querySelector(".jtq-error-panel");
    if (existingError) {
      existingError.remove();
    }
    const wrapper = container.createEl("div", { cls: "jtq-table-wrapper" });
    if ((_a = query.render) == null ? void 0 : _a.title) {
      wrapper.createEl("h3", {
        text: query.render.title,
        cls: "jtq-table-title"
      });
    }
    const table = wrapper.createEl("table", { cls: "jtq-table" });
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr", { cls: "jtq-header-row" });
    fields.forEach((field) => {
      const th = headerRow.createEl("th", {
        cls: "jtq-header-cell"
      });
      const fieldSpec = this.getFieldSpec(field, query);
      th.textContent = fieldSpec.label || field;
    });
    const tbody = table.createEl("tbody");
    if (data.length === 0) {
      const emptyRow = tbody.createEl("tr", { cls: "jtq-empty-row" });
      const emptyCell = emptyRow.createEl("td", {
        text: "No data",
        cls: "jtq-empty-cell",
        attr: { colspan: fields.length }
      });
    } else {
      data.forEach((row, rowIndex) => {
        const tr = tbody.createEl("tr", {
          cls: `jtq-data-row ${rowIndex % 2 === 0 ? "jtq-row-even" : "jtq-row-odd"}`
        });
        fields.forEach((field) => {
          const td = tr.createEl("td", { cls: "jtq-data-cell" });
          const value = getByPath(row, field);
          const fieldSpec = this.getFieldSpec(field, query);
          td.textContent = this.formatValue(value, fieldSpec);
        });
      });
    }
    if (((_b = query.render) == null ? void 0 : _b.footer) === "count") {
      const footer = wrapper.createEl("div", { cls: "jtq-table-footer" });
      footer.textContent = `${data.length} row${data.length !== 1 ? "s" : ""}`;
    }
  }
  static getDisplayFields(data, query) {
    if (query.fields) {
      if (!Array.isArray(query.fields)) {
        query.fields = [];
      }
      if (query.fields.length > 0) {
        return query.fields.map((f) => typeof f === "string" ? f : f.path);
      }
    }
    if (data.length === 0) {
      return [];
    }
    const keys = new Set();
    data.forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((key) => keys.add(key));
      }
    });
    return Array.from(keys);
  }
  static getFieldSpec(field, query) {
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
  static formatValue(value, fieldSpec) {
    if (value === null || value === void 0) {
      return fieldSpec.default || "";
    }
    const format = fieldSpec.format || "auto";
    switch (format) {
      case "json":
        return typeof value === "string" ? value : JSON.stringify(value, null, 2);
      case "date":
        try {
          const date = new Date(value);
          return date.toLocaleDateString();
        } catch (e) {
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
};

// src/render/error-panel.ts
var ErrorPanel = class {
  static render(errors, container) {
    if (!errors || errors.length === 0) {
      return;
    }
    const panel = container.createEl("div", { cls: "jtq-error-panel" });
    panel.createEl("h4", {
      text: "Query Error",
      cls: "jtq-error-title"
    });
    errors.forEach((error, index) => {
      const errorEl = panel.createEl("div", { cls: "jtq-error-item" });
      errorEl.createEl("strong", {
        text: `${error.type}: `
      });
      errorEl.createEl("span", {
        text: error.message
      });
      if (error.code) {
        errorEl.createEl("code", {
          text: error.code,
          cls: "jtq-error-code"
        });
      }
      if (error.context) {
        const contextEl = errorEl.createEl("pre", {
          cls: "jtq-error-context"
        });
        contextEl.createEl("code", {
          text: error.context
        });
      }
      if (index < errors.length - 1) {
        panel.createEl("hr", { cls: "jtq-error-separator" });
      }
    });
  }
  static clear(container) {
    const panel = container.querySelector(".jtq-error-panel");
    if (panel) {
      panel.remove();
    }
  }
  static hasErrors(container) {
    return !!container.querySelector(".jtq-error-panel");
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  enableJsExecution: false,
  jsExecutionWarningShown: false,
  enableDataCache: true,
  dataCacheSizeEntries: 50,
  cacheInvalidationMs: 6e4,
  showTableBorders: true,
  alternateRowColors: true,
  sortableHeaders: false,
  showErrorDetails: true,
  showQueryLogsInDev: false
};
var JsonTableQueryPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.debounceTimer = null;
  }
  onload() {
    return __async(this, null, function* () {
      console.log("Loading JSON Table Query plugin");
      const data = yield this.loadData();
      this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
      this.registerMarkdownCodeBlockProcessor("jtable", (source, el, ctx) => {
        const oldWrapper = el.querySelector(".jtq-table-wrapper");
        const oldError = el.querySelector(".jtq-error-panel");
        if (oldWrapper)
          oldWrapper.remove();
        if (oldError)
          oldError.remove();
        this.executeQueryInContainer(source, el, ctx);
      });
      this.addSettingTab(new JsonTableQuerySettingsTab(this.app, this));
      this.registerEvent(this.app.metadataCache.on("changed", (file) => {
        if (file.extension === "md") {
          requestAnimationFrame(() => {
            this.scheduleRerender();
          });
        }
      }));
      this.registerEvent(this.app.vault.on("modify", (file) => {
        if (file.extension === "md") {
          requestAnimationFrame(() => {
            this.scheduleRerender();
          });
        }
      }));
      console.log("JSON Table Query plugin loaded");
    });
  }
  scheduleRerender() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.rerenderAllTables();
    }, 200);
  }
  rerenderAllTables() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!activeView) {
      return;
    }
    const file = activeView.file;
    if (!file) {
      return;
    }
    this.app.vault.read(file).then((content) => {
      const jtablePattern = /```jtable\n([\s\S]*?)\n```/g;
      const matches = Array.from(content.matchAll(jtablePattern));
      const container = activeView.containerEl;
      const resultContainers = container.querySelectorAll(".cm-preview-code-block.cm-lang-jtable");
      resultContainers.forEach((resultContainer, index) => {
        if (matches[index]) {
          const source = matches[index][1].trim();
          const oldWrapper = resultContainer.querySelector(".jtq-table-wrapper");
          const oldError = resultContainer.querySelector(".jtq-error-panel");
          if (oldWrapper)
            oldWrapper.remove();
          if (oldError)
            oldError.remove();
          this.executeQueryInContainer(source, resultContainer);
        }
      });
    });
  }
  executeQueryInContainer(source, container, ctx) {
    try {
      const errors = [];
      const parseResult = QueryParser.parse(source);
      if (!parseResult.success || !parseResult.query) {
        if (parseResult.error) {
          errors.push(parseResult.error);
        }
        ErrorPanel.render(errors, container);
        return;
      }
      const query = parseResult.query;
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        errors.push({
          type: "data",
          message: "No active file",
          code: "NO_ACTIVE_FILE"
        });
        ErrorPanel.render(errors, container);
        return;
      }
      this.app.vault.read(activeFile).then((content) => {
        const jsonBlockPattern = /```json\n([\s\S]*?)\n```/g;
        const matches = Array.from(content.matchAll(jsonBlockPattern));
        if (matches.length === 0) {
          errors.push({
            type: "data",
            message: "No JSON data block found in this file",
            code: "DATA_NOT_FOUND"
          });
          ErrorPanel.render(errors, container);
          return;
        }
        const match = matches[0];
        if (!match || !match[1]) {
          errors.push({
            type: "data",
            message: "No JSON data block found",
            code: "DATA_NOT_FOUND"
          });
          ErrorPanel.render(errors, container);
          return;
        }
        const dataLocation = {
          lineStart: 0,
          lineEnd: 1,
          content: match[1].trim(),
          blockId: "extracted"
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
            inputRows: extractResult.data.length,
            outputRows: execResult.data.length
          });
        }
      });
    } catch (e) {
      const error = e;
      const errors = [
        {
          type: "execution",
          message: `Unexpected error: ${error.message}`,
          code: "UNEXPECTED_ERROR"
        }
      ];
      ErrorPanel.render(errors, container);
      console.error("JSON Table Query error:", error);
    }
  }
  onunload() {
    console.log("Unloading JSON Table Query plugin");
  }
};
var JsonTableQuerySettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "JSON Table Query Settings" });
    new import_obsidian.Setting(containerEl).setName("Enable JavaScript functions").setDesc("Allow query blocks to use js.filterFn, js.sortFn, and js.mapFn. WARNING: These run with plugin privileges.").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableJsExecution).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableJsExecution = value;
      yield this.plugin.saveData(this.plugin.settings);
    })));
    new import_obsidian.Setting(containerEl).setName("Enable data caching").setDesc("Cache parsed JSON data blocks for better performance").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableDataCache).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableDataCache = value;
      yield this.plugin.saveData(this.plugin.settings);
    })));
    new import_obsidian.Setting(containerEl).setName("Cache size (entries)").setDesc("Maximum number of data blocks to cache").addText((text) => text.setValue(String(this.plugin.settings.dataCacheSizeEntries)).onChange((value) => __async(this, null, function* () {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        this.plugin.settings.dataCacheSizeEntries = num;
        yield this.plugin.saveData(this.plugin.settings);
      }
    })));
    new import_obsidian.Setting(containerEl).setName("Show table borders").setDesc("Display borders around table cells").addToggle((toggle) => toggle.setValue(this.plugin.settings.showTableBorders).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.showTableBorders = value;
      yield this.plugin.saveData(this.plugin.settings);
    })));
    new import_obsidian.Setting(containerEl).setName("Alternate row colors").setDesc("Display rows with alternating background colors").addToggle((toggle) => toggle.setValue(this.plugin.settings.alternateRowColors).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.alternateRowColors = value;
      yield this.plugin.saveData(this.plugin.settings);
    })));
    new import_obsidian.Setting(containerEl).setName("Show error details").setDesc("Display detailed error messages and stack traces").addToggle((toggle) => toggle.setValue(this.plugin.settings.showErrorDetails).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.showErrorDetails = value;
      yield this.plugin.saveData(this.plugin.settings);
    })));
    new import_obsidian.Setting(containerEl).setName("Show query logs (dev mode)").setDesc("Log query execution details to console").addToggle((toggle) => toggle.setValue(this.plugin.settings.showQueryLogsInDev).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.showQueryLogsInDev = value;
      yield this.plugin.saveData(this.plugin.settings);
    })));
    containerEl.createEl("hr");
    containerEl.createEl("h3", { text: "Information" });
    containerEl.createEl("p", {
      text: "For query syntax documentation and examples, see the plugin documentation.",
      cls: "setting-item-description"
    });
  }
};
