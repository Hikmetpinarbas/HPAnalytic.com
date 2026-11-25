# Ham kaynak veri ağacı — Shakhtar Donetsk — Fenerbahçe (deploy EDİLMEZ)

Bu ağaç, `content/kaynak-veri/gs-stuttgart/OKUBENI.md` sözleşmesinin aynısıdır ve henüz
**boştur**: maç verisi onaylı kaynaktan gelmeden buraya hiçbir dosya eklenmez.

- `public/` altında değildir, dist'e kopyalanmaz; site çalışma zamanı bu yolları
  hiçbir koşulda fetch etmez (HP-W1-SITE-001).
- Bu ağaca gelecek ham CSV/XLSX/ZIP yalnızca çevrimdışı üretim pipeline'ının girdisidir;
  kamusal alana yalnızca `hpa.*` şemalı türetilmiş JSON düşer
  (`public/assets/data/shakhtar-fenerbahce/`).
- Şemasız ham JSON `RAW_JSON_FILE`, ham CSV/XLSX/ZIP `RAW_DATA_FILE` ile engellenir.
- Igilere giden görseller `public/assets/images/shakhtar-fenerbahce/` altına konur.
- Yayın yalnızca `content/yayin-defteri.json` defterine HUMAN_APPROVAL basis'iyle
  girdikten sonra mümkündür.
