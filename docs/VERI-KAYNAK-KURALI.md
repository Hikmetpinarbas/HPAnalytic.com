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
