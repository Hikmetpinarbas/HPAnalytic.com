import { defineMiddleware } from 'astro:middleware';

// Baseline security headers for every public response.
// CSP is intentionally permissive on inline styles/scripts only as far as the current
// Astro output requires; tighten it in a later pass after a browser QA check.
const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

export const onRequest = defineMiddleware(async (context, next) => {
  // Internal editorial control surface must never be publicly reachable.
  // It depends on local-only files that do not exist in the deployed Worker.
  // Denied before next() so no control page code runs for public requests.
  if (context.url.pathname === '/control' || context.url.pathname.startsWith('/control/')) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        ...SECURITY_HEADERS,
      },
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
