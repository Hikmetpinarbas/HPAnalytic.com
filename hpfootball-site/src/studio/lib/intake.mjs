// Intake adapters: free-text idea, URL, file, Content Foundry queue.
//
// READ → EXTRACT happens here, deterministically. ASSESS → FIND ANGLES is the
// engine's job (engine.mjs). Every adapter reports what it could not do as a
// warning instead of guessing.

import { readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const MAX_TEXT = 60_000;
const MAX_BYTES = 8 * 1024 * 1024;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function meta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? decodeEntities(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? '').trim() : '';
}

export function extractFromHtml(html) {
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
  // Page chrome (site header/nav/footer) is dropped by preferring <main> or
  // <article>; a <header> INSIDE the content is kept (it often holds the title
  // and standfirst).
  const main = html.match(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2] ?? html;
  const text = decodeEntities(
    main
      .replace(/<(script|style|noscript|svg|nav|footer|form|aside|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/(p|h[1-6]|li|blockquote|tr|div|section)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
  return {
    title: meta(html, 'og:title') || title,
    description: meta(html, 'description') || meta(html, 'og:description'),
    site: meta(html, 'og:site_name'),
    published: meta(html, 'article:published_time'),
    text,
  };
}

function cap(text, warnings) {
  if (text.length <= MAX_TEXT) return text;
  warnings.push(`TEXT_TRUNCATED_AT_${MAX_TEXT}_CHARS`);
  return text.slice(0, MAX_TEXT);
}

export function parseUrl(value) {
  try {
    const url = new URL(String(value ?? '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

// Returns { title, description, site, text, pdf (Buffer|null), warnings }.
export async function readUrl(rawUrl, { fetchImpl = fetch, timeoutMs = 20_000 } = {}) {
  const url = parseUrl(rawUrl);
  const warnings = [];
  if (!url) return { title: '', description: '', site: '', text: '', pdf: null, warnings: ['URL_INVALID'] };
  let response;
  try {
    response = await fetchImpl(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'HPAnalytic-EditorialStudio/1 (+https://hpanalytic.com)', accept: 'text/html,application/pdf;q=0.9,*/*;q=0.5' },
    });
  } catch (error) {
    return { title: '', description: '', site: url.hostname, text: '', pdf: null, warnings: [`FETCH_FAILED:${error?.name ?? 'Error'}`] };
  }
  if (!response.ok) return { title: '', description: '', site: url.hostname, text: '', pdf: null, warnings: [`HTTP_${response.status}`] };
  const type = response.headers.get('content-type') ?? '';
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_BYTES) warnings.push('BODY_OVER_8MB_TRUNCATED');
  const body = buffer.subarray(0, MAX_BYTES);
  if (type.includes('application/pdf') || body.subarray(0, 5).toString() === '%PDF-') {
    warnings.push('PDF_TEXT_NEEDS_ENGINE');
    return { title: path.basename(url.pathname), description: '', site: url.hostname, text: '', pdf: body, warnings };
  }
  if (!type.includes('html') && !type.includes('text')) {
    warnings.push(`UNSUPPORTED_CONTENT_TYPE:${type || 'unknown'}`);
    return { title: '', description: '', site: url.hostname, text: '', pdf: null, warnings };
  }
  const extracted = type.includes('html') ? extractFromHtml(body.toString('utf8')) : { title: '', description: '', site: '', text: body.toString('utf8') };
  if (extracted.text.length < 400) warnings.push('LITTLE_TEXT_EXTRACTED_PAGE_MAY_NEED_JS_OR_LOGIN');
  return { ...extracted, site: extracted.site || url.hostname, text: cap(extracted.text, warnings), pdf: null, warnings };
}

// Uploaded file → { text, pdf, warnings }. DOCX is reported, not half-parsed.
export function readUploadedFile(name, buffer) {
  const warnings = [];
  const ext = path.extname(String(name ?? '')).toLowerCase();
  if (['.txt', '.md', '.markdown', '.csv', '.json'].includes(ext)) {
    return { text: cap(buffer.toString('utf8'), warnings), pdf: null, warnings };
  }
  if (ext === '.pdf' || buffer.subarray(0, 5).toString() === '%PDF-') {
    return { text: '', pdf: buffer, warnings: ['PDF_TEXT_NEEDS_ENGINE'] };
  }
  if (ext === '.docx') return { text: '', pdf: null, warnings: ['DOCX_NOT_SUPPORTED_YET_EXPORT_AS_PDF_OR_MD'] };
  return { text: '', pdf: null, warnings: [`UNSUPPORTED_FILE_TYPE:${ext || 'none'}`] };
}

// ---------------------------------------------------------------------------
// Content Foundry bridge (READ-ONLY).
//
// The Foundry queue on the phone stays the source of truth for seeds, its own
// preflight/routing/scoring (foundry_support/*.py) and its promotion gate. The
// Studio only reads it, never writes to it, and never re-scores it.

export function foundryQueueDir(env = process.env) {
  return path.resolve(env.HP_FOUNDRY_QUEUE_DIR || path.join(os.homedir(), 'HIKMET_FOOTBALL_SYSTEM', '70_RESEARCH', 'CONTENT_FOUNDRY_QUEUE'));
}

const FOUNDRY_FIELDS = ['id', 'type', 'seed', 'source_lead', 'provenance', 'claim_ceiling'];
export const isCompleteFoundryItem = (item) => FOUNDRY_FIELDS.every((key) => typeof item?.[key] === 'string' && item[key].trim());

export async function readFoundryQueue(dir = foundryQueueDir()) {
  let names;
  try {
    names = (await readdir(dir)).filter((n) => /^QUEUE_.*\.json$/.test(n)).sort();
  } catch (error) {
    return { available: false, items: [], warnings: [`FOUNDRY_QUEUE_${error?.code ?? 'UNREADABLE'}`] };
  }
  const seen = new Map();
  const warnings = [];
  for (const name of names) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(path.join(dir, name), 'utf8'));
    } catch {
      warnings.push(`FOUNDRY_FILE_INVALID:${name}`);
      continue;
    }
    const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
    for (const item of items) {
      if (!isCompleteFoundryItem(item)) continue;
      if (!seen.has(item.id)) seen.set(item.id, { ...item, file: name });
    }
  }
  return { available: true, items: [...seen.values()], warnings };
}

// Article seeds and research topics are Studio candidates; source leads are
// shown as leads, not as topics.
export function foundryCandidates(items, importedIds = new Set()) {
  return items.filter((item) => (item.type === 'article_seed' || item.type === 'research_topic') && !importedIds.has(item.id));
}
