import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname === '/control' || context.url.pathname.startsWith('/control/')) {
    const runtime = (context.locals as any).runtime;
    const requiredToken = runtime?.env?.HPA_EDITORIAL_TOKEN;
    const providedToken = context.cookies.get('HPA_EDITORIAL_TOKEN')?.value;

    if (!requiredToken || requiredToken !== providedToken) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        }
      });
    }
  }

  const response = await next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
});
