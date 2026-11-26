# Canlı Ticker Veri Sözleşmesi — `hpa.live_ticker.v1`

Ana sayfadaki canlı bülten şeridi (`src/js/live-marquee.js`) yalnızca bu sözleşmeye uyan
veriyle çalışır. Uydurma içerik yoktur; veri yoksa şerit nötr yetenek metnine döner
(fail-closed).

## Dosya

`public/assets/data/live-ticker.json` — yayına `dist/assets/data/live-ticker.json` olarak
çıkar. Yayın sırasında `/_headers` bu dosyaya kısa ömürlü önbellek uygular
(`max-age=60, stale-while-revalidate=300`), böylece TTL anlamlıdır.

## Şema

```json
{
  "schema": "hpa.live_ticker.v1",
  "available": true,
  "reason": null,
  "fetched_at": "2026-11-05T12:00:00Z",
  "publication_authorized": true,
  "ttl_minutes": 30,
  "items": [
    {
      "text": "Lille 2-4 Galatasaray: 3 farklı gol yolu",
      "kaynak": "HPAnalytic maç raporu",
      "tarih": "2026-11-05",
      "dogrulama": "dogrulanmis",
      "href": "/yazi/mac-lille-galatasaray-2026-10-21.html",
      "expires_at": "2026-11-05T12:30:00Z"
    }
  ]
}
```

## Alan kuralları

| Alan | Zorunlu | Kural |
|---|---|---|
| `schema` | evet | `hpa.live_ticker.v1` |
| `available` | evet | `true` değilse ticker içerik göstermez |
| `publication_authorized` | evet | editoryal onay yoksa ticker içerik göstermez |
| `fetched_at` | evet (available=true iken) | ISO zaman; TTL hesabı bunun üzerinden yapılır |
| `ttl_minutes` | hayır | yoksa istemci 30 dakika varsayar |
| `items[].text` | evet | boş olamaz |
| `items[].kaynak` | evet | kaynağı söylemeyen bülten maddesi yayınlanmaz |
| `items[].tarih` | evet | `YYYY-MM-DD` |
| `items[].dogrulama` | evet | `dogrulanmis` \| `proxy` \| `hipotez` |
| `items[].href` | hayır | yalnızca `/` ile başlayan yerel yol; `//` başlangıçlı dış URL reddedilir |
| `items[].expires_at` | hayır | yoksa `fetched_at + ttl_minutes` kullanılır |

## Tek sözleşme kaynağı

Sözleşmenin tek kod kaynağı `src/js/ticker-contract.mjs` modülüdür. İstemci
(`live-marquee.js`), build gate (`verify-build.mjs`) ve testler aynı modülü
kullanır; kural çift bakımı yapılmaz. Modül şunları export eder:

| Export | Anlamı |
|---|---|
| `TICKER_SCHEMA` | `hpa.live_ticker.v1` |
| `REFETCH_MS` | istemci yenileme aralığı (5 dk) |
| `FALLBACK_TEXT` | fail-closed nötr şerit metni (içerik iddiası taşımaz) |
| `VERIFICATION` | doğrulama rozetleri: `dogrulanmis` / `proxy` / `hipotez` |
| `formatTR(iso)` | `2026-11-05` → `05.11.2026` |
| `collectItems(json, now)` | sözleşmeye uyan maddeler; şema uyuşmazlığında `null` |
| `auditItems(json, now)` | gate/test için ayrıntılı rapor (`kept` + `dropped`) |

## PR #102 ile uzlaştırma

#102'nin skor biçimi (`home`, `away`, `score`, `status`, `date`) kabul edilir ve
kanonik editoryal biçime normalize edilir: metin `Ev 3-2 Deplasman (MS/LİVE)`
olarak üretilir, `date` → `tarih` olarak alınır. **Her iki biçimde de `kaynak`
ve `dogrulama` zorunludur**; bu alanları taşımayan skor maddesi yayınlanmaz
(fail-closed). Harici metadata alanları (`olusturan` gibi) istemci tarafından
yoksayılır; yayınlanan JSON'a ajan/model etiketi yazmak yasaktır
(`verify-build.mjs` 3. adım bunu build'i fail ederek durdurur).

## Fail-closed davranışı (istemci)

- Fetch hatası, bozuk JSON, şema uyuşmazlığı → içerik yok, nötr şerit.
- `available` veya `publication_authorized` `true` değilse → içerik yok.
- `fetched_at` yoksa/geçersizse veya `fetched_at + ttl_minutes` dolmuşsa → içerik yok.
- Zorunlu alanı eksik, doğrulama değeri geçersiz, süresi dolmuş veya geçersiz `href`
  içeren maddeler tek tek elenir; hiç madde kalmazsa nötr şerit.
- İstemci her 5 dakikada bir yeniden çeker; ekran dışındayken animasyon durur.

## Erişilebilirlik ve hareket

- Şerit klonu (sonsuz kaydırma kopyası) `aria-hidden="true"` + `inert` olur ve
  içindeki bağlantılar `tabindex="-1"` alır; klavye odağı klonlara düşemez.
- `prefers-reduced-motion: reduce` durumunda animasyon CSS ile kapatılır,
  JS klonu hiç render etmez (tek grup, sarılmayan değil satan metin).

## Besleme adaptörü

`scripts/ticker-feed.mjs` gerçek kaynaklardan sözleşme uyumlu feed üretir:

- Yayın defteri: `content/yazilar/*.md` — yalnızca geçerli tarih + slug + title
  taşıyan yayındaki makaleler (`kaynak` = yayın tipi, `dogrulama` = `dogrulanmis`).
- `HPA_TICKER_SOURCE_URL` ortam değişkeni verilirse sözleşmeye uyan harici feed
  denetlenerek katılır; uymayan maddeler raporlanır ve yayınlanmaz.
- `--publish` olmadan veya geçerli madde kalmazsa çıktı her zaman fail-closed
  seed'dir. Uydurma skor/içerik üretme yolu yoktur.

```bash
node scripts/ticker-feed.mjs            # fail-closed seed
node scripts/ticker-feed.mjs --publish  # gerçek kaynaklarla yayın feed'i
```

## Doğrulama gate'i

`scripts/verify-build.mjs` 6. adım ticker denetimini `src/js/ticker-contract.mjs`
üzerinden yapar (aynı kural, tek kaynak): `available=true` yayınlanan ticker'da
sözleşmeye aykırı tek madde bile build'i fail eder. Ayrıca 7. adım favicon varlığını
doğrular.
