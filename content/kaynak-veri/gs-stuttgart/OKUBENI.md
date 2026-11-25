# Ham kaynak veri ağacı (deploy EDİLMEZ)

Bu ağaç `public/` altında **değildir** ve dist'e kopyalanmaz; site çalışma zamanı bu
yolları hiçbir koşulda fetch etmez (HP-W1-SITE-001).

## Sözleşme (HP-W1-SITE-001 — Copilot yayın denetimi engel çözümü)

- `gs-stuttgart/players.csv` ve `gs-stuttgart/teams.csv` ham SportsBase event CSV'leridir.
  2026-11-25'e kadar `public/assets/data/gs-stuttgart/` altında depolanıyordu; PR #100
  gate'i her `dist/*.csv`yi `SENSITIVE_FILE`/`RAW_DATA_FILE` ile blokladığı için canlı
  deploy kapısının tek kalıcı engeli buydu.
- Kamusal alan artık yalnızca **türetilmiş** veri taşır: `hpa.*` şemalı JSON'lar ve
  `scripts/release/review_audit.mjs`'te gerekçesiyle kayıtlı izin listesi genişletilebilir
  `JSON_IZIN_ONEKLERI`/`JSON_IZINLI` sabitleri.
- Ham CSV'ler yalnızca çevrimdışı üretim pipeline'ı girdisidir
  (`scripts/build_pass_network.py`, `scripts/build_gk_data.py`, `scripts/build_player_zones.py`,
  `scripts/process_match_data.py`, `scripts/trace_event.py` varsayılanları bu ağaca bakar;
  `scripts/build_viz_bundle.py` ham CSV kopyalarını da `content/kaynak-veri/<mac>/` altına yazar,
  `public/` düşürsürmez).
- Görselleştirmeler (pas ağı, kaleci dağılımı, fazlar) bu ham veriden üretilen
  `public/assets/data/gs-stuttgart/*.json` üzerinden yayınlanır; makale görselleri etkilenmez
  (19 makale + viz bağları doğrulandı, canlı baseline değişmez).
