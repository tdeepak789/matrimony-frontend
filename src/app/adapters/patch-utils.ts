/**
 * Build a partial patch object containing only keys from `formValue`
 * that are actually different from `original`.
 *
 * This avoids sending nulls and avoids TypeScript `null | undefined` surprises.
 */
export function buildPatch<T extends object>(original: T, formValue: Partial<T>): Partial<T> {
  const patch: Partial<T> = {};
  Object.keys(formValue).forEach(k => {
    const key = k as keyof T;
    const newVal = (formValue as any)[key];
    const origVal = original[key];

    // treat empty strings as change if original was different
    const changed = (() => {
      // For numbers: if newVal is null/undefined -> don't include patch
      if (typeof origVal === 'number') {
        // allow 0 as valid, so check for strict inequality
        return newVal !== undefined && newVal !== null && Number(newVal) !== origVal;
      }
      // For strings/dates: if newVal is null/undefined -> don't include patch
      if (typeof origVal === 'string') {
        return newVal !== undefined && newVal !== null && String(newVal) !== origVal;
      }
      // Fallback: strict inequality (works for booleans, etc.)
      return newVal !== undefined && newVal !== null && newVal !== origVal;
    })();

    if (changed) {
      (patch as any)[key] = newVal;
    }
  });

  return patch;
}
