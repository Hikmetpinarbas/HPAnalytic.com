import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isPublic } from '../lib/public-content.mjs';
import { isPublicEditorialItem } from '../lib/site-editorial-status.mjs';

export const prerender = true;

const STATIC_ROUTES = ['/', '/analysis', '/research', '/scouting', '/culture', '/visual-lab', '/archive', '/search', '/about'];

const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[char] ?? char));

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://hpanalytic.com');
  const articles = (await getCollection('articles', isPublic)).filter((entry) => isPublicEditorialItem(entry.data));
  const urls = [
    ...STATIC_ROUTES.map((pathname) => new URL(pathname, base).href),
    ...articles.map((entry) => new URL('/articles/' + entry.id, base).href),
  ];
  const body = urls.map((url) => `<url><loc>${esc(url)}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
