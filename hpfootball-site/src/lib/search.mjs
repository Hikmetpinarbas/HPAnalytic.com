// Accent- and Turkish-case-insensitive search over the editorial archive.
// Runs on the server (SSR /search?q=), so search works without client JS.

const TR_FOLD = { ı: 'i', ş: 's', ğ: 'g', ç: 'c', ö: 'o', ü: 'u', â: 'a', î: 'i', û: 'u' };

export function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ışğçöüâîû]/g, (ch) => TR_FOLD[ch])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
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
