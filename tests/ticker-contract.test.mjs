import assert from 'node:assert/strict';

globalThis.document = { readyState: 'loading', addEventListener() {} };
globalThis.window = globalThis;

const { collectItems } = await import('../src/js/ticker-contract.mjs');

const NOW = Date.parse('2026-11-05T12:00:00Z');
const base = {
  schema: 'hpa.live_ticker.v1',
  available: true,
  publication_authorized: true,
  fetched_at: '2026-11-05T11:45:00Z',
  ttl_minutes: 30,
  items: [
    { text: 'Lille 2-4 Galatasaray', kaynak: 'HPAnalytic maç raporu', tarih: '2026-11-05', dogrulama: 'dogrulanmis', href: '/yazi/mac-lille-galatasaray-2026-10-21.html' },
    { text: 'xG paradoksu', kaynak: 'Analiz', tarih: '2026-11-05', dogrulama: 'proxy' }
  ]
};

const live = collectItems(base, NOW);
assert.equal(live.length, 2);

assert.equal(collectItems({ ...base, available: false }, NOW).length, 0, 'fail-closed: available=false');
assert.equal(collectItems({ ...base, publication_authorized: false }, NOW).length, 0, 'fail-closed: yetki yok');
assert.equal(collectItems({ ...base, fetched_at: null }, NOW).length, 0, 'fail-closed: fetched_at yok');
assert.equal(collectItems({ ...base, fetched_at: '2026-11-05T10:00:00Z' }, NOW).length, 0, 'fail-closed: TTL dolmuş');
assert.equal(collectItems({ ...base, ttl_minutes: 14 }, NOW).length, 0, 'fail-closed: kısa TTL dolmuş');
assert.equal(collectItems({ ...base, schema: 'baska.v1' }, NOW), null, 'şema uyuşmazlığı');
assert.equal(collectItems({ ...base, items: [{ text: 'eksik', tarih: '2026-11-05', dogrulama: 'dogrulanmis' }] }, NOW).length, 0, 'kaynak zorunlu');
assert.equal(collectItems({ ...base, items: [{ ...base.items[0], dogrulama: 'sallama' }] }, NOW).length, 0, 'geçersiz doğrulama');
assert.equal(collectItems({ ...base, items: [{ ...base.items[0], tarih: '05.11.2026' }] }, NOW).length, 0, 'geçersiz tarih biçimi');
assert.equal(collectItems({ ...base, items: [{ ...base.items[0], href: 'https://dis-site.example/x' }] }, NOW).length, 0, 'dış href reddedilir');
assert.equal(collectItems({ ...base, items: [{ ...base.items[0], expires_at: '2026-11-05T11:50:00Z' }] }, NOW).length, 0, 'madde bazlı expiry');
assert.equal(collectItems({ ...base, items: [{ ...base.items[0], expires_at: '2026-11-05T12:30:00Z' }] }, NOW).length, 1, 'madde bazlı expiry geçerli');

console.log('ticker-contract: 13/13 test GEÇTİ');
