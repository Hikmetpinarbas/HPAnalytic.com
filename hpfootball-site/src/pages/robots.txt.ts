import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://hpanalytic.com');
  const sitemap = new URL('/sitemap-index.xml', base).href;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /control/\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
