import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isPublic } from '../lib/public-content.mjs';
import { isPublicEditorialItem } from '../lib/site-editorial-status.mjs';
import { canonicalPath } from '../lib/canonical-path.mjs';

export const prerender = true;

// '/research' and '/scouting' are always-visible method pages in navigation and on the homepage.
const STATIC_ROUTES = ['/', '/archive', '/about', '/research', '/scouting', '/mac/galatasaray-fenerbahce-2026-10-26-mac-sonu', '/portraits/vosse-de-boode'];

const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[char] ?? char));

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://www.hpanalytic.com');
  const articles = (await getCollection('articles', isPublic)).filter((entry) => isPublicEditorialItem(entry.data));
  const visuals = (await getCollection('visuals', isPublic)).filter((entry) => isPublicEditorialItem(entry.data));
  const activeSections = new Set(articles.map((entry) => entry.data.section));
  const visibleRoutes = [
    ...(activeSections.has('analysis') ? ['/analysis'] : []),
    ...(activeSections.has('culture') ? ['/culture'] : []),
    ...(visuals.length ? ['/visual-lab'] : []),
  ];
  const urls = [
    ...[...STATIC_ROUTES, ...visibleRoutes].map((pathname) => new URL(canonicalPath(pathname), base).href),
    ...articles.map((entry) => new URL(canonicalPath('/articles/' + entry.id), base).href),
  ];
  const body = urls.map((url) => `<url><loc>${esc(url)}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
