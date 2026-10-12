import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith('/control')) {
    const isProd = import.meta.env?.PROD || process.env.NODE_ENV === 'production';
    if (isProd) {
      // Basic unauthenticated check.
      // In Astro cloudflare adapters, context.locals.runtime.env contains secrets.
      // We will check for a generic authorization or a specific internal secret.
      const authHeader = context.request.headers.get('authorization');
      const env = (context.locals as any).runtime?.env ?? {};
      const secret = env.CONTROL_SECRET || process.env.CONTROL_SECRET;

      // Fix fail-open logic: If secret is missing or header doesn't match, block.
      if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }
  }
  return next();
});
