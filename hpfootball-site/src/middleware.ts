import { defineMiddleware } from 'astro:middleware';
export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname === '/control' || context.url.pathname.startsWith('/control/')) {
    return new Response('Not Found', { status: 404, headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
  }
  return next();
});
