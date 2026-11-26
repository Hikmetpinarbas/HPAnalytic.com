// hpa.live_ticker.v1 — tek sözleşme kaynağı.
// İstemci (live-marquee.js), build gate (verify-build.mjs) ve testler
// yalnızca bu modül üzerinden ticker doğrular; kural çift bakımı yoktur.
// Sözleşme belgesi: docs/TICKER-VERI-SOZLESME.md

export const TICKER_SCHEMA = 'hpa.live_ticker.v1';

// İstemci yenileme aralığı — sözleşme belgesiyle birebir aynı.
export const REFETCH_MS = 5 * 60 * 1000;

// Fail-closed nötr şerit: içerik iddiası taşımaz, yetenek bildirir.
export const FALLBACK_TEXT =
  'HPAnalytic bülteni — doğrulanmış canlı veri yok · sayı uydurulmaz, yalnızca kaynaklı analiz yayınlanır';

export const VERIFICATION = {
  dogrulanmis: { label: 'Doğrulanmış', cls: 'is-ok' },
  proxy: { label: 'Proxy', cls: 'is-proxy' },
  hipotez: { label: 'Hipotez', cls: 'is-hip' }
};

export function formatTR(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

function isValidISODate(iso) {
  return typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(Date.parse(iso));
}

function isValidTimestamp(iso) {
  return typeof iso === 'string' && !Number.isNaN(Date.parse(iso));
}

// PR #102 skor maddeleri (home/away/score/status/date) ile PR #103 editoryal
// maddeleri (text/kaynak/tarih/dogrulama) tek kanonik biçime normalize edilir.
// Her iki biçimde de kaynak ve doğrulama zorunludur; eksikse madde düşer.
function normalizeItem(raw) {
  const isScoreShape = typeof raw?.home === 'string' && typeof raw?.away === 'string';
  if (!isScoreShape) return raw;
  const date = typeof raw.date === 'string' ? raw.date.slice(0, 10) : raw.tarih;
  const score = typeof raw.score === 'string' ? raw.score.trim() : '';
  const tag = raw.status === 'live' ? 'LİVE' : raw.status === 'final' ? 'MS' : '';
  const head = score
    ? `${raw.home} ${score} ${raw.away}`
    : `${raw.home} — ${raw.away}${tag ? ` · ${tag} öncesi` : ''}`;
  return {
    ...raw,
    text: [head, tag].filter(Boolean).join(' '),
    tarih: date
  };
}

// Denetim: kept + dropped listesi döner. Gate ve testler bunu kullanır.
export function auditItems(json, now) {
  const result = {
    schemaOk: !!json && json.schema === TICKER_SCHEMA,
    available: !!json && json.available === true,
    authorized: !!json && json.publication_authorized === true,
    fresh: false,
    kept: [],
    dropped: []
  };
  if (!result.schemaOk) return result;
  if (!result.available || !result.authorized) return result;
  if (!isValidTimestamp(json.fetched_at)) {
    result.dropped.push({ index: -1, reason: 'fetched_at geçersiz' });
    return result;
  }
  const fetched = Date.parse(json.fetched_at);
  const ttl = Number(json.ttl_minutes);
  const globalExpiry = Number.isFinite(ttl) && ttl > 0
    ? fetched + ttl * 60000
    : fetched + 30 * 60000;
  result.fresh = globalExpiry > now;
  if (!result.fresh) {
    result.dropped.push({ index: -1, reason: 'TTL dolmuş' });
    return result;
  }
  const items = Array.isArray(json.items) ? json.items : [];
  items.forEach((raw, index) => {
    const item = normalizeItem(raw);
    if (!item || typeof item !== 'object') {
      result.dropped.push({ index, reason: 'madde nesne değil' });
      return;
    }
    if (typeof item.text !== 'string' || !item.text.trim()) {
      result.dropped.push({ index, reason: 'text zorunlu' });
      return;
    }
    if (typeof item.kaynak !== 'string' || !item.kaynak.trim()) {
      result.dropped.push({ index, reason: 'kaynak zorunlu' });
      return;
    }
    if (!isValidISODate(item.tarih)) {
      result.dropped.push({ index, reason: 'tarih YYYY-MM-DD olmalı' });
      return;
    }
    if (!VERIFICATION[item.dogrulama]) {
      result.dropped.push({ index, reason: 'geçersiz doğrulama değeri' });
      return;
    }
    const expires = item.expires_at ? Date.parse(item.expires_at) : globalExpiry;
    if (Number.isNaN(expires) || expires <= now) {
      result.dropped.push({ index, reason: 'süresi dolmuş' });
      return;
    }
    if (item.href != null && (typeof item.href !== 'string' || !/^\/(?!\/)/.test(item.href))) {
      result.dropped.push({ index, reason: 'dış veya geçersiz href reddedilir' });
      return;
    }
    result.kept.push(item);
  });
  return result;
}

export function collectItems(json, now) {
  const audit = auditItems(json, now);
  if (!audit.schemaOk) return null;
  return audit.kept;
}
