import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;
  if (pathname === '/control' || pathname.startsWith('/control/')) {
    const isProd = import.meta.env?.PROD === true || (globalThis as any).process?.env?.NODE_ENV === 'production';
    if (isProd) {
      // Basic unauthenticated check.
      // In Astro cloudflare adapters, context.locals.runtime.env contains secrets.
      const env = (context.locals as any).runtime?.env ?? {};
      const secret = env.CONTROL_SECRET || import.meta.env?.CONTROL_SECRET || (globalThis as any).process?.env?.CONTROL_SECRET;

      // To support web browser access, check Basic Auth or Cookies
      const authHeader = context.request.headers.get('authorization');

      if (!secret || !authHeader) {
        return new Response('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="HP Control"' }
        });
      }

      // Check Basic Auth
      const [scheme, token] = authHeader.split(' ');
      if (scheme === 'Basic') {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        // Accept either exactly the secret or username:secret depending on how the browser passes it
        const providedSecret = decoded.includes(':') ? decoded.split(':')[1] : decoded;
        if (providedSecret !== secret) {
          return new Response('Forbidden', { status: 403 });
        }
      } else if (scheme === 'Bearer') {
        if (token !== secret) {
          return new Response('Forbidden', { status: 403 });
        }
      } else {
        return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="HP Control"' } });
      }
    }
  }
  return next();
});
