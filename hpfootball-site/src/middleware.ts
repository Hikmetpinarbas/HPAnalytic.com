import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, locals, cookies } = context;
  const env = (locals as any).runtime?.env ?? {};

  if (url.pathname === '/control' || url.pathname.startsWith('/control/')) {
    const token = cookies.get('HPA_EDITORIAL_TOKEN')?.value;
    const expectedToken = env.HPA_EDITORIAL_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  return next();
};
