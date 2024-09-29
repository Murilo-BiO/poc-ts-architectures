export function only<T, K extends keyof T>(from: T, keys: K | K[]): Pick<T, K> {
  // Normalize `keys` to always be an array
  const keysArray = Array.isArray(keys) ? keys : [keys];
    
  // Create a new object containing only the specified keys
  const result = {} as Pick<T, K>;

  for (const key of keysArray) {
    if (key in (from as object)) {
      result[key] = from[key];
    }
  }

  return result;
}
