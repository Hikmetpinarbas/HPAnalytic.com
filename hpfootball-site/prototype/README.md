# HPAnalytic — izole etkileşim prototipi

Üretimden bağımsız dört ekran. Her sayfanın üstünde demonstrasyon bildirimi vardır. Production deployment içermez; yayımlanmış makaleleri değiştirmez. Yeni palette eski tasarıma zorunlu değil.

```sh
cd hpfootball-site
node prototype/build.mjs
node --test prototype/tests/state.test.mjs
node prototype/server.mjs
```

Aç: http://127.0.0.1:8099/ (Node20+). Ana sayfa, article.html, archive.html, analysis.html. Mobil menü her ekranda. Kütüphane `src/`, QA `tests/`; npm kurulumu prototype build/server/state tests için gerekmez. JS arama/filtre/oynatma için gerekir; HTML içerik ve temel linkler JS olmadan erişilir.

## İncelenecek akış

1. Masaüstünde Analiz'e hover → tıklayıp sabitle → Escape. Mobilde menü → alt kategori.
2. Kartta Önizleme, Seçki → arşivde Yalnızca seçkim.
3. Yatay rafı sürükle/kaydır; odaklı rafta Home/End.
4. Ara veya Ctrl/⌘K → Oyuncu7 ya da takım/konu. ↑↓ ve Escape.
5. Arşivde takım + tür → URL'yi yeniden aç; grid/list değiştir; temizle.
6. Yazıda bölüm seç, okuma ilerlemesi ve kaynak/metodoloji panellerini incele.
7. Analizde hücreye odaklan ve ok tuşları; tablo/görünüm/eşik; SVG/CSV; zoom/pan/reset; geniş görünüm.
8. Olay görünümünde sekans, zaman, hız, oyuncu vurgusu; reduced motion'da adımlama.

Tarayıcı regresyonu `tests/browser.mjs`; CI, repository'deki kilitli tools/editorial-qa paketini geçici QA ortamına kurar. Test raporları üretildiğinde `qa/` altında. Kaynak, araştırma ve sistem belgeleri: `../docs/interaction-redesign-20261029/`.
