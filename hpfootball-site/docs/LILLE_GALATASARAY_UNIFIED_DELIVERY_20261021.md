# HPAnalytic | Lille–Galatasaray — Tek teslimat kaydı
Tarih: 21.10.2026
Kanonik görev: GitHub #63
Tek entegrasyon dalı: `editorial/lille-galatasaray-evidence-20261021`
Hedef: Kaynağı denetlenebilir, futbol açısından açıklayıcı, görsel olarak güçlü, erişilebilir ve güvenli biçimde yayımlanabilecek **tek** maç önü analizi.

## Kapsam ve sahiplik
- Bu kayıt, önceki yerel `feat/gs-lille-premier-safe-v1` çalışmalarını ve devralınan editoryal/grafik QA çalışmalarını aynı teslimatta toplar. Eski dal bağımsız yayın adayı değildir.
- GitHub'daki bu dal **tek yazma/entegrasyon dalıdır**. Diğer ajanlar çakışan dosyalara yazmaz; tamamladıkları somut patch, kaynak ve test çıktısı bu dala gözden geçirilerek alınır.
- Başka takım/proje, zamanlayıcı, otomatik yayın ve onaysız production değişikliği yoktur.
- Kaynak SportsBase RAW salt okunurdur; gerekçesiz rakam, eksik pas alıcısından çizilen yönlü ok, kesinlik iddiası ya da kamuya açık yapay zekâ ürün kimliği yoktur.

## Mevcut ve kanıtlanmış ürün çalışmaları
1. `c822f5869c5e5dd2053ddb631b8a5a9cbb306c2a`: Yeni “Baskının miktarı değil, kazanımın yeri” mekânsal panelinin sınırlarını ve 14/26, 11/19, 1/8 göstergelerini kapsayan 3 regresyon testi (devralınan dal).
2. Google Drive QA belgesi: İki maçın ham CSV/XML kaynağının eşleştirildiği ve son üçte bir olay farkı zaman grafiğinin yeniden üretildiği raporlanmış; pas ağı linked sayımı için HOLD.
3. `90281054971a0b5bf61804fdb74ffd8efed999a3`: 10/12/12 şut sıralaması düzeltildi; doğrulanmamış 156/266 bağlantı sayıları kamusal açıklamadan çıkarıldı.
4. `10deac369ed20d03705e1b612c862b3f205681c3` ve `7d47b809bb52e5f8ef599b955d6581beba921226`: Yeni panelin fiziksel metre iddiaları şematik birim olarak düzeltildi.
5. `91e03681ee35b34c38085eb8676d58467941db4c`: Arsenal karşısındaki resmi Lille kendi yarı kayıp toplamı **27**, haritada işlenen alt küme **26** olarak ayrıldı; çıkarımlar kanıta bağlandı.
6. `hpfootball-site/tests/lille-evidence-editorial-guard.test.mjs`: Bu editoryal sınırların korunması için yeni testler GitHub'da; test koşumu henüz yok.

## Eski yerel daldan birleştirilecek işe yarar kod (henüz GitHub'a aktarılmış sayılmaz)
- 90 dk/1. devre/2. devre filtreli **interaktif saha olay paneli**, `feat/gs-lille-premier-safe-v1` yerel dalındaki Astro dosyasında.
- PPDA çubuklarının yön düzeltmesi ve medyan çizgisi.
- `src/lib/match-spatial-temporal.mjs`, ilişkili sözleşme testleri ve `docs/HP_MATCH_MULTILAYER_DATA_CONTRACT_V1.md`.
- `scripts/worker-rollback-plan.mjs` ve regresyon testleri.
- Yerel test çıktısı geçmişte 367 toplam / 351 başarılı / 0 başarısız / 16 atlanan; **yeni kanonik dalın testi değildir**.
- Taşıma şartı: Git diff ile seçim; aynı öğeyi iki kez ekleme; mevcut mekânsal paneli ve farklı ajanların commitlerini koruma; tüm değişikliği tek kanonik dalda test etme.

## Tek teslimatın kapanış kriterleri
1. 156/152 ve 266/268 **pas ağı farkları** CSV+XML olay kimliği, kararlı zaman sırası, özgün `hpfootball-site/tools/match-charts/calc.py` ve kaynak sürümü üzerinden çözülür. Kesin pas alıcısı yoksa yönlü pas oku gösterilmez.
2. Kayıp/kazanımın olay sayıları, devre etiketleri, eksen/yarı dönüşü, oyuncular ve 14/26–11/19–1/8 bölgesel göstergeleri veriden tekrar üretilir. Ham 27 top kaybı ile haritaya alınan 26 olay ayrı tutulur.
3. Yeni mekânsal panel korunup yeniden kullanılabilir, dokunmatik/klavyeli ve erişilebilir interaktif devre analiziyle güçlendirilir; mevcut grafik aileleri bozulmaz.
4. Üst düzey futbol çıkarımı kaynak-olay-sekans-şüphe alternatiflerini içeren editoryal sentez olarak yazılır; kamuya iç QA notları taşınmaz.
5. Güncel Floodlight premium tema, mobil 360/390/768px ve masaüstü 1280px/1440px, %200 zoom, reduced-motion, renk/klavye kontrolleri ekran görüntüsü ve bulguyla kabul edilir.
6. Astro production build, tüm aktif testler, 16 skip nedeni/çözümü, `git diff --check`, kanal ve başka yazıların regresyonu kanıtla PASS olur.
7. Eser/analiz/kaynakların sürüm listesi ve doğrulanabilir CI/build/test/görsel çıktılarıyla tek PR hazırlanır. Kullanıcı onayı olmadan merge/deploy yoktur.

## Aktif engel
UserLAnd SSH `127.0.0.1:2022` bağlantı sıfırlıyor; bu nedenle yerel dalın kodu doğrudan okunamıyor ve Astro build/tarayıcı testi henüz çalıştırılamadı. Bu engeli başarısız test gibi sunma. GitHub'daki kanonik dalda kaynak kodu ve test düzenlemeleri sürdürülebilir.

## Durum
IN PROGRESS / YAYIN HOLD. Tek iş sahibi, tek teslimat ve tek onay kapısı.
