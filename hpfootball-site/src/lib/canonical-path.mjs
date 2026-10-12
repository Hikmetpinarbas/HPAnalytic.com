// Canonical public paths. Prerendered pages are emitted as `<route>/index.html`
// (Astro default build.format "directory"), so their canonical URL ends in "/"
// and the asset server answers the slash-less form with a 307. Server-rendered
// public routes are served exactly as requested and keep no trailing slash.
export const SERVER_RENDERED_PUBLIC_ROUTES = Object.freeze(['/search']);

export function canonicalPath(pathname) {
  const path = '/' + String(pathname || '').replace(/^\/+|\/+$/g, '');
  if (path === '/' || SERVER_RENDERED_PUBLIC_ROUTES.includes(path)) return path;
  return path + '/';
}
