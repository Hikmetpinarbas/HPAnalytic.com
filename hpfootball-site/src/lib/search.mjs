// Accent- and Turkish-case-insensitive search over the editorial archive.
// Runs on the server (SSR /search?q=), so search works without client JS.

const TR_FOLD = { ı: 'i', ş: 's', ğ: 'g', ç: 'c', ö: 'o', ü: 'u', â: 'a', î: 'i', û: 'u' };

export function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ışğçöüâîû]/g, (ch) => TR_FOLD[ch])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(query) {
  return [...new Set(normalizeText(query).split(' ').filter((t) => t.length >= 2))];
}

const FIELD_WEIGHTS = { title: 5, description: 3, meta: 2, body: 1 };

// documents: [{ id, title, description, meta, body }]
// Every token must match somewhere (AND); score ranks by field weight.
export function searchDocuments(documents, query, { limit = 50 } = {}) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const results = [];
  for (const doc of documents) {
    const fields = Object.fromEntries(
      Object.keys(FIELD_WEIGHTS).map((key) => [key, normalizeText(doc[key])]),
    );
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      let tokenScore = 0;
      for (const [key, weight] of Object.entries(FIELD_WEIGHTS)) {
        if (fields[key].includes(token)) tokenScore += weight;
      }
      if (tokenScore === 0) {
        matchedAll = false;
        break;
      }
      score += tokenScore;
    }
    if (matchedAll) results.push({ id: doc.id, score });
  }

  return results
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)))
    .slice(0, limit);
}

// Server-rendered pagination: clamp untrusted page numbers and keep a stable result order.
// Ported from feat/night-search-query-20261012 (e317394, 79e11d9).
/**
 * @template T
 * @param {T[]} results
 * @param {string | number | null} requestedPage
 * @param {number} [pageSize]
 * @returns {{ page: number, totalPages: number, total: number, items: T[] }}
 */
export function paginateResults(results, requestedPage, pageSize = 20) {
  const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 20;
  const totalPages = Math.max(1, Math.ceil(results.length / size));
  const rawPage = Number(requestedPage);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, totalPages) : 1;
  return { page, totalPages, total: results.length, items: results.slice((page - 1) * size, page * size) };
}

// --- Intent discovery -------------------------------------------------------
// Readers arrive with a football question, not a site section. An intent is a
// filter over the same public corpus: it never creates content, and an intent
// with no matching public article is not offered (EMPTY SURFACE = HIDDEN SURFACE).
//
// Signals are structured fields first (section, series, articleKind), then stems
// in title, description and topics. The body is deliberately ignored: words like
// "maç" or "veri" appear in almost every article body and would put every
// article under every intent.

export const MAX_QUERY_LENGTH = 120;

export const DISCOVERY_INTENTS = [
  {
    id: 'mac',
    label: 'MAÇ',
    question: 'Bir maçı anlamak istiyorum',
    detail: 'Skoru değil, skoru üreten oyunu ve rakip yanıtını oku.',
    sections: [],
    series: ['MATCH_ANALYSIS', 'WHAT_TO_WATCH'],
    kinds: ['VIDEO_INTELLIGENCE'],
    stems: ['mac', 'match', 'rakip', 'derbi', 'fikstur'],
  },
  {
    id: 'oyuncu',
    label: 'OYUNCU',
    question: 'Bir oyuncuyu anlamak istiyorum',
    detail: 'Pozisyon etiketinden role, bağlama ve karar riskine geç.',
    sections: ['scouting'],
    series: [],
    kinds: [],
    stems: ['oyuncu', 'player', 'scout', 'transfer', 'rol', 'pozisyon', 'position'],
  },
  {
    id: 'mekanizma',
    label: 'MEKANİZMA',
    question: 'Bir mekanizmayı çözmek istiyorum',
    detail: 'Metriğin arkasındaki süreci ve neden-sonuç sınırını incele.',
    sections: [],
    series: ['MECHANISM_EXPLAINER', 'METRIC_EXPLAINER'],
    kinds: ['EXPLAINER', 'DEEP_ANALYSIS'],
    stems: ['mekanizma', 'mechanism', 'metrik', 'metric', 'surec'],
  },
  {
    id: 'arastirma',
    label: 'ARAŞTIRMA',
    question: 'Bir iddiayı sınamak istiyorum',
    detail: 'Kaynağı, yöntemi, karşı kanıtı ve iddia sınırını birlikte gör.',
    sections: ['method'],
    series: ['EVIDENCE_REVIEW'],
    kinds: ['EVIDENCE_REVIEW', 'FOOTBALL_SCIENCE', 'DATA_STORY'],
    stems: ['arastirma', 'research', 'kanit', 'evidence', 'veri', 'data', 'yontem', 'method', 'kaynak'],
  },
];

const INTENT_IDS = new Set(DISCOVERY_INTENTS.map((intent) => intent.id));

// Whitelist only: anything else (case variants, injection attempts) is no intent.
export function parseIntent(value) {
  const id = String(value ?? '').trim();
  return INTENT_IDS.has(id) ? id : null;
}

// Untrusted ?q= → bounded, single-line text. Control characters (including CR/LF)
// become spaces so the value is safe to echo and to put back into a URL.
export function sanitizeQuery(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .trim();
}

// Folded Turkish case/plural endings. A stem shorter than 5 letters only matches
// with one of these, so "veri" finds "verinin" but not "verir", and "mac" finds
// "maçın" but not "macera". Longer stems match any continuation.
const SHORT_STEM_SUFFIXES = new Set(['', 'i', 'in', 'a', 'e', 'u', 'un', 'yi', 'ya', 'ye', 'yu', 'nin', 'nun', 'da', 'de', 'ta', 'te', 'dan', 'den', 'tan', 'ten', 'ler', 'lar', 'leri', 'lari', 'lerin', 'larin', 'si', 'su', 'sin', 'sun', 'nde', 'nda', 's']);

function stemMatches(word, stem) {
  if (!word.startsWith(stem)) return false;
  return stem.length >= 5 || SHORT_STEM_SUFFIXES.has(word.slice(stem.length));
}

// doc: { section, series, articleKind, title, description, topics }
export function classifyIntents(doc) {
  const words = normalizeText([doc.title, doc.description, ...(doc.topics ?? [])].join(' ')).split(' ').filter(Boolean);
  return DISCOVERY_INTENTS.filter((intent) =>
    intent.sections.includes(doc.section) ||
    intent.series.includes(doc.series) ||
    intent.kinds.includes(doc.articleKind) ||
    intent.stems.some((stem) => words.some((word) => stemMatches(word, stem))),
  ).map((intent) => intent.id);
}

// Intents that have at least one document, in the declared order, with counts.
export function summarizeIntents(documents) {
  return DISCOVERY_INTENTS.map((intent) => ({
    id: intent.id,
    label: intent.label,
    question: intent.question,
    detail: intent.detail,
    count: documents.filter((doc) => (doc.intents ?? []).includes(intent.id)).length,
  })).filter((intent) => intent.count > 0);
}

// The only way the search UI builds links: fixed same-origin path, whitelisted
// intent, sanitized query, positive integer page. Empty parameters are omitted.
/**
 * @param {{ query?: string | null, intent?: string | null, page?: string | number | null }} [options]
 * @returns {string}
 */
export function buildSearchHref({ query = '', intent = null, page = 1 } = {}) {
  const params = new URLSearchParams();
  const q = sanitizeQuery(query);
  const safeIntent = parseIntent(intent);
  const n = Number(page);
  if (q) params.set('q', q);
  if (safeIntent) params.set('intent', safeIntent);
  if (Number.isSafeInteger(n) && n > 1) params.set('page', String(n));
  const search = params.toString();
  return search ? `/search?${search}` : '/search';
}
