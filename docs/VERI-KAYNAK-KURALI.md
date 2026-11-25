# HPAnalytic — Veri Kaynak Kuralı

## Kesin Kural

| Veri Tipi | Kaynak | Örnek |
|---|---|---|
| **Metrikler** (pas, şut, gol, isabetli pas) | **XLSX** | 444/398 pas, 14/8 şut, 4/0 gol |
| **Oyun akışı** (koordinat, event, fazlar, pres) | **CSV + XML** | 2802 event, x/y, action |
| **Fitness** (mesafe, sprint, hız) | **Ayrı XLSX** | 31.10.2026 Player Fitness |

## Uygulama

- Metindeki her rakam XLSX'ten doğrulanır. CSV sayısı farklıysa metne girmez.
- Faz yüzdeleri, koordinat bazlı analiz, pres verileri CSV event'lerinden.
- Fitness metne ayrı eklenir; başka metrikle karıştırılmaz.

## Kamusal Dağıtım Kuralı (HP-W1-SITE-001)

Deploy kapısı `scripts/release-security-gate.mjs` + `scripts/release/review_audit.mjs`
fail-closed çalışır; RELEASE_READY makbuzu olmadan deploy.yml yayın yapmaz.

| Katman | Yer | Kural |
|---|---|---|
| Ham kaynak (CSV/XLSX/ZIP) | `content/kaynak-veri/<mac>/` | Deploy edilmez; repo içinde üretim pipeline girdisi. `*.csv` gitignored, yalnızca gerekçeli kayıtlar takip edilir. |
| Türetilmiş makine verisi | `public/assets/data/<mac>/*.json` | Ya `hpa.*` şeması ya review_audit izin listesinde gerekçe; dışındaki ham JSON `RAW_JSON_FILE` ile engellenir. |
| Sayfa/markdown paketleri | `assets/data/` altında YASAK | Paketlenmiş .html/.md sızıntısı `DATA_DIR_FILE` ile engellenir. |
| Source map | dist'te YASAK | .map dosyası ve `sourceMappingURL` referansı engellenir. |
