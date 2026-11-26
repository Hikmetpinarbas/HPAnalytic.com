import assert from 'node:assert/strict';

globalThis.document = { readyState: 'loading', addEventListener() {} };
globalThis.window = globalThis;

const {
  TICKER_SCHEMA,
  REFETCH_MS,
  FALLBACK_TEXT,
  VERIFICATION,
  formatTR,
  collectItems,
  auditItems
} = await import('../src/js/ticker-contract.mjs');

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  OK ${name}`);
}

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

console.log('ticker-contract (hpa.live_ticker.v1):');

test('sözleşme sabitleri export edilir (P0: tanımsız referans)', () => {
  assert.equal(TICKER_SCHEMA, 'hpa.live_ticker.v1');
  assert.equal(REFETCH_MS, 5 * 60 * 1000);
  assert.equal(typeof FALLBACK_TEXT, 'string');
  assert.ok(FALLBACK_TEXT.trim().length > 0);
  assert.deepEqual(Object.keys(VERIFICATION), ['dogrulanmis', 'proxy', 'hipotez']);
});

test('formatTR ISO tarihi TR biçimine çevirir', () => {
  assert.equal(formatTR('2026-11-05'), '05.11.2026');
  assert.equal(formatTR('2026-11-05T12:00:00Z'), '05.11.2026');
  assert.equal(formatTR('05.11.2026'), '');
  assert.equal(formatTR(null), '');
});

test('fail-closed: available=false', () => {
  assert.equal(collectItems({ ...base, available: false }, NOW).length, 0);
});
test('fail-closed: yayın yetkisi yok', () => {
  assert.equal(collectItems({ ...base, publication_authorized: false }, NOW).length, 0);
});
test('fail-closed: fetched_at yok', () => {
  assert.equal(collectItems({ ...base, fetched_at: null }, NOW).length, 0);
});
test('fail-closed: TTL dolmuş', () => {
  assert.equal(collectItems({ ...base, fetched_at: '2026-11-05T10:00:00Z' }, NOW).length, 0);
});
test('fail-closed: kısa TTL dolmuş', () => {
  assert.equal(collectItems({ ...base, ttl_minutes: 14 }, NOW).length, 0);
});
test('şema uyuşmazlığı null döner', () => {
  assert.equal(collectItems({ ...base, schema: 'baska.v1' }, NOW), null);
});
test('kaynak zorunlu', () => {
  assert.equal(collectItems({ ...base, items: [{ text: 'eksik', tarih: '2026-11-05', dogrulama: 'dogrulanmis' }] }, NOW).length, 0);
});
test('geçersiz doğrulama değeri elenir', () => {
  assert.equal(collectItems({ ...base, items: [{ ...base.items[0], dogrulama: 'sallama' }] }, NOW).length, 0);
});
test('geçersiz tarih biçimi elenir', () => {
  assert.equal(collectItems({ ...base, items: [{ ...base.items[0], tarih: '05.11.2026' }] }, NOW).length, 0);
});
test('dış href reddedilir', () => {
  assert.equal(collectItems({ ...base, items: [{ ...base.items[0], href: 'https://dis-site.example/x' }] }, NOW).length, 0);
});
test('madde bazlı expiry: süresi dolan elenir', () => {
  assert.equal(collectItems({ ...base, items: [{ ...base.items[0], expires_at: '2026-11-05T11:50:00Z' }] }, NOW).length, 0);
});
test('madde bazlı expiry: süresi geçerli kalır', () => {
  assert.equal(collectItems({ ...base, items: [{ ...base.items[0], expires_at: '2026-11-05T12:30:00Z' }] }, NOW).length, 1);
});

test('uzlaştırma: PR #102 skor maddesi kanonik metne normalize edilir', () => {
  const scoreFeed = {
    ...base,
    items: [
      { home: 'Galatasaray', away: 'Fenerbahçe', score: '3-2', status: 'final', date: '2026-11-05T20:00:00Z', kaynak: 'TFF resmî sonuç', dogrulama: 'dogrulanmis' },
      { home: 'Beşiktaş', away: 'Trabzonspor', status: 'scheduled', date: '2026-11-08T17:00:00Z', kaynak: 'TFF fikstür', dogrulama: 'proxy' }
    ]
  };
  const kept = collectItems(scoreFeed, NOW);
  assert.equal(kept.length, 2);
  assert.equal(kept[0].text, 'Galatasaray 3-2 Fenerbahçe MS');
  assert.equal(kept[1].text, 'Beşiktaş — Trabzonspor');
  assert.equal(kept[0].tarih, '2026-11-05');
});

test('uzlaştırma: skor maddesinde kaynak/doğrulama yoksa fail-closed düşer', () => {
  const scoreFeed = {
    ...base,
    items: [
      { home: 'Galatasaray', away: 'Fenerbahçe', score: '3-2', status: 'final', date: '2026-11-05' }
    ]
  };
  const audit = auditItems(scoreFeed, NOW);
  assert.equal(audit.kept.length, 0);
  assert.equal(audit.dropped.length, 1);
  assert.match(audit.dropped[0].reason, /kaynak/);
});

test('auditItems: gate için ayrıntılı rapor üretir', () => {
  const audit = auditItems({ ...base, items: [{ ...base.items[0], kaynak: '' }, { ...base.items[1] }] }, NOW);
  assert.equal(audit.kept.length, 1);
  assert.equal(audit.dropped.length, 1);
  assert.equal(audit.fresh, true);
  assert.equal(audit.schemaOk, true);
});

console.log(`ticker-contract: ${passed}/${passed} test GEÇTİ`);
