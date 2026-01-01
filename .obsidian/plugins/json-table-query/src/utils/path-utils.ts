/**
 * Utilities for accessing nested object properties using dot-path notation
 * Supports: a.b.c, a[0], a.b[1].c
 */

/**
 * Get a value from an object using dot-path notation
 * @param obj - The object to traverse
 * @param path - The path string (e.g., "user.profile.name" or "tags[0]")
 * @returns The value at the path, or undefined if not found
 */
export function getByPath(obj: any, path: string): any {
  if (!path || !obj) {
    return undefined;
  }

  // Split path into segments, handling both dot and bracket notation
  const segments = parsePathSegments(path);

  let current = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof segment === "number") {
      // Array index
      current = current[segment];
    } else {
      // Object key
      current = current[segment];
    }
  }

  return current;
}

/**
 * Set a value in an object using dot-path notation
 * Creates intermediate objects as needed
 */
export function setByPath(obj: any, path: string, value: any): void {
  const segments = parsePathSegments(path);

  if (segments.length === 0) {
    return;
  }

  let current = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];

    if (typeof segment === "number") {
      // Array index
      if (!Array.isArray(current)) {
        current = [];
      }
      if (current[segment] === undefined) {
        current[segment] = {};
      }
      current = current[segment];
    } else {
      // Object key
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }
  }

  const lastSegment = segments[segments.length - 1];
  if (typeof lastSegment === "number") {
    current[lastSegment] = value;
  } else {
    current[lastSegment] = value;
  }
}

/**
 * Check if a path exists in an object
 */
export function hasPath(obj: any, path: string): boolean {
  if (!path || !obj) {
    return false;
  }

  const segments = parsePathSegments(path);
  let current = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return false;
    }
    if (!(segment in current)) {
      return false;
    }
    current = current[segment];
  }

  return true;
}

/**
 * Parse a path string into segments
 * Handles: "a.b.c", "a[0]", "a.b[1].c", etc.
 */
function parsePathSegments(path: string): (string | number)[] {
  const segments: (string | number)[] = [];
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
      // Array index notation
      if (current) {
        segments.push(current);
        current = "";
      }

      i++; // Skip '['
      let indexStr = "";
      while (i < path.length && path[i] !== "]") {
        indexStr += path[i];
        i++;
      }

      // Parse the index
      const index = parseInt(indexStr, 10);
      if (!isNaN(index)) {
        segments.push(index);
      }

      i++; // Skip ']'
    } else if (char === "]") {
      // Ignore stray closing brackets
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

/**
 * Get all unique keys from an array of objects
 */
export function getObjectKeys(objects: any[]): string[] {
  const keys = new Set<string>();

  for (const obj of objects) {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => keys.add(key));
    }
  }

  return Array.from(keys);
}

/**
 * Flatten nested objects for table display
 */
export function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj || {})) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
