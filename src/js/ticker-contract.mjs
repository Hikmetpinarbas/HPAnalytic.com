const DEFAULT_TTL_MINUTES = 30;

const VERIFICATION = {
  dogrulanmis: { label: 'Doğrulanmış', cls: 'is-ok' },
  proxy: { label: 'Proxy', cls: 'is-proxy' },
  hipotez: { label: 'Hipotez', cls: 'is-hip' }
};

const VALID_VERIFICATION = new Set(Object.keys(VERIFICATION));

function isValidISODate(iso) {
  return typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(Date.parse(iso));
}

function isValidTimestamp(iso) {
  return typeof iso === 'string' && !Number.isNaN(Date.parse(iso));
}

export function collectItems(json, now) {
  if (!json || json.schema !== 'hpa.live_ticker.v1') return null;
  if (json.available !== true || json.publication_authorized !== true) return [];
  if (!isValidTimestamp(json.fetched_at)) return [];
  const fetched = Date.parse(json.fetched_at);
  const ttl = Number(json.ttl_minutes);
  const globalExpiry = Number.isFinite(ttl) && ttl > 0
    ? fetched + ttl * 60000
    : fetched + DEFAULT_TTL_MINUTES * 60000;
  if (globalExpiry <= now) return [];
  const items = Array.isArray(json.items) ? json.items : [];
  return items.filter(item => {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.text !== 'string' || !item.text.trim()) return false;
    if (typeof item.kaynak !== 'string' || !item.kaynak.trim()) return false;
    if (!isValidISODate(item.tarih)) return false;
    if (!VALID_VERIFICATION.has(item.dogrulama)) return false;
    const expires = item.expires_at ? Date.parse(item.expires_at) : globalExpiry;
    if (Number.isNaN(expires) || expires <= now) return false;
    if (item.href != null && (typeof item.href !== 'string' || !/^\/(?!\/)/.test(item.href))) return false;
    return true;
  });
}
