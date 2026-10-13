/** Local-only saved reading. No account, analytics or remote storage. */
export const READING_LIST_KEY = 'hpanalytic:reading-list:v1';
export function parseReadingList(raw) {
  if (!raw) return [];
  try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? [...new Set(parsed.filter(x => typeof x === 'string' && /^\/articles\/[a-z0-9-]+$/.test(x)))].slice(0, 200) : []; }
  catch { return []; }
}
export function toggleReadingList(items, path) {
  if (!/^\/articles\/[a-z0-9-]+$/.test(path)) return items;
  return items.includes(path) ? items.filter(x => x !== path) : [...items, path].slice(-200);
}
