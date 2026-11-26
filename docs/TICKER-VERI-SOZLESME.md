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

## Fail-closed davranışı (istemci)

- Fetch hatası, bozuk JSON, şema uyuşmazlığı → içerik yok, nötr şerit.
- `available` veya `publication_authorized` `true` değilse → içerik yok.
- `fetched_at` yoksa/geçersizse veya `fetched_at + ttl_minutes` dolmuşsa → içerik yok.
- Zorunlu alanı eksik, doğrulama değeri geçersiz, süresi dolmuş veya geçersiz `href`
  içeren maddeler tek tek elenir; hiç madde kalmazsa nötr şerit.
- İstemci her 5 dakikada bir yeniden çeker; ekran dışındayken animasyon durur.

## Doğrulama gate'i

`scripts/verify-build.mjs` 6. adım: `available=true` yayınlanan ticker'da her madde
için `text`, `kaynak`, `tarih` (YYYY-MM-DD) ve geçerli `dogrulama` zorunludur; aksi
hâlde build başarısız olur. Bu kural uydurma/eksik bülten verisinin yayına girmesini
engeller.
