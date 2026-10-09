import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isPublic } from '../lib/public-content.mjs';
import { isPublicEditorialItem } from '../lib/site-editorial-status.mjs';
import { buildVisibleNavigation, buildUtilityNavigation } from '../lib/site-surfaces.mjs';
import { canonicalPath } from '../lib/canonical-path.mjs';

export const prerender = true;


const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[char] ?? char));

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://hpanalytic.com');
  const articles = (await getCollection('articles', isPublic)).filter((entry) => isPublicEditorialItem(entry.data));
  const research = (await getCollection('research', isPublic)).filter((entry) => isPublicEditorialItem(entry.data));
  const visuals = (await getCollection('visuals', isPublic)).filter((entry) => isPublicEditorialItem(entry.data));
  const articleSections: Record<string, number> = {};
  for (const article of articles) articleSections[article.data.section] = (articleSections[article.data.section] || 0) + 1;
  // Same gating as the navigation: a surface without content is not advertised (EMPTY SURFACE = HIDDEN SURFACE).
  const surfaces = [
    '/',
    ...buildVisibleNavigation({ articleSections, researchCount: research.length, visualCount: visuals.length }).map((item) => item.href),
    ...buildUtilityNavigation({ articleCount: articles.length }).map((item) => item.href),
  ];
  const urls = [
    ...surfaces.map((pathname) => new URL(canonicalPath(pathname), base).href),
    ...articles.map((entry) => new URL(canonicalPath('/articles/' + entry.id), base).href),
  ];
  const body = urls.map((url) => `<url><loc>${esc(url)}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
