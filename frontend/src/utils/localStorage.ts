/**
 * Smartly reads value from localStorage
 */
export function localStorageGet(name: string, defaultValue: unknown = ""): unknown {
  if (typeof window === "undefined") return defaultValue;
  const valueFromStore = localStorage.getItem(name);
  if (valueFromStore === null) return defaultValue;

  try {
    const jsonParsed = JSON.parse(valueFromStore);
    if (["boolean", "number", "bigint", "string", "object"].includes(typeof jsonParsed)) {
      return jsonParsed;
    }
  } catch {
    // fall through
  }
  return valueFromStore;
}

/**
 * Smartly writes value into localStorage
 */
export function localStorageSet(name: string, value: unknown) {
  if (typeof window === "undefined" || typeof value === "undefined") return;
  const valueAsString = typeof value === "object" ? JSON.stringify(value) : String(value);
  localStorage.setItem(name, valueAsString);
}

/**
 * Deletes value by name from localStorage
 */
export function localStorageDelete(name: string) {
  if (typeof window === "undefined") return;
  if (name) {
    localStorage.removeItem(name);
  } else {
    localStorage.clear();
  }
}
