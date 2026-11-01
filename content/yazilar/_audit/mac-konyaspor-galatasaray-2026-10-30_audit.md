# Konyaspor–Galatasaray (30.10.2026) — İç Editoryal Denetim

> Arşiv; yayın metni değildir. Önceki 27 maddelik liste paylaşılmadığından, bu 27 madde erişilebilir kaynaklarla yeniden derlenmiştir. `_audit` klasörünün build dışında kaldığı ayrıca test edilmelidir.

## Özet — 5 bulgu

1. [YANLIŞ] `%45 savunma` veya `%45,2` iddiası mevcut faz paketinden doğrulanmıyor.
2. [ÇÜRÜK] `334 set hücum = 0 gol / 42 geçiş = 2 gol` gol bazlı faz eşleştirmesi olmadan kanıt değildir.
3. [REVIEW] GAL hücum sprinti 987 m, KON 414 m (2,38 kat). GAL 384 m, KON 437 m sprint alt kırılımlarında açıklanamıyor.
4. [YANLIŞ] `19 şut` mevcut kanonik 14–8 şut referansıyla çelişir; eski PPDA ve pas sayıları sürüm/ontoloji denetimi gerektirir.
5. [EKSİK] Gol zincirleri ve pas ilişkileri doğrulanmadıkça taktik mekanizma hükmü kesinleştirilmez.

## Ayrıntılı denetim — 27 madde

1. [YANLIŞ] `%45 savunmada` JSON faz çıktısında yok. `set_defense` model payı %12,6.
2. [YANLIŞ] `%45,2 / 1263 aksiyon` mevcut paketle eşleşmiyor; eski sürüm iddiası.
3. [REVIEW] `build_up`: 360 aksiyon; %40,2 model payı. Doğrudan topa sahip olma süresi değildir.
4. [REVIEW] `set_attack`: 334 aksiyon; %37,2 model payı. Doğrudan yerleşik hücum süresi değildir.
5. [REVIEW] `transition_attack`: 42 aksiyon; %4,7 model payı. Doğrulanmış hücum dizisi sayısı değildir.
6. [REVIEW] `set_defense`: 113 aksiyon; %12,6 model payı. Doğrulanmış savunma süresi değildir.
7. [REVIEW] `transition_defense`: 47 aksiyon; %5,2 model payı. Kaynak ontolojisi denetlenmeli.
8. [YANLIŞ] `%77,4 hücum aksiyonu` ifadesi yanlıştır: %77,4 = %40,2 + %37,2 model payı; aksiyon payı değil.
9. [ÇÜRÜK] `334 yerleşik hücum, sıfır gol` iddiası gol→faz eşleştirmesiyle gösterilmedi.
10. [ÇÜRÜK] `42 geçiş aksiyonu, iki gol` iddiası gol→faz eşleştirmesiyle gösterilmedi.
11. [REVIEW] Osimhen'in ilk golü için hücum başlangıcı ve faz etiketi ayrı kanıt ister.
12. [REVIEW] Batrakov golünün geçişten geldiği doğrulanmış gol zinciri olmadan söylenemez.
13. [YANLIŞ] Galatasaray `19 şut` iddiası kanonik takım CSV referansıyla çelişiyor: GAL 14, KON 8.
14. [REVIEW] `69 yüksek pres` ifadesi olay tanımı ve satır ID'leri olmadan doğrulanmış değil.
15. [REVIEW] `5 rakip yarı top kazanımı` iddiası kaynak satırlarıyla ayrıca uzlaştırılmadı.
16. [YANLIŞ] `PPDA 2,54` mevcut kanonik türetilmiş GAL 2,77 değeriyle eşleşmiyor.
17. [REVIEW] `PPDA 4,24 / 3,47 / 4,75` alternatif hesapların kapsamı ve kaynağı teyit edilmedi.
18. [REVIEW] `1409 / 666 pas` değerleri hangi kapsamı gösteriyor belirsiz; yayımlanmaz.
19. [REVIEW] `444 / 398 pas` değerleri kaynak tanımları ve oyuncu/takım kapsamı olmadan onaylanmaz.
20. [REVIEW] Gabriel Sara'nın 42/40/38 pas değerleri metrik tanımına göre ayrıştırılmalı.
21. [REVIEW] Sara için `2 asist / 3 şans yaratma` iddiası doğrulanmış kaynak satırına bağlanmadı.
22. [EKSİK] Bu maça ait doğrulanmış xG modeli yok. xG grafiği veya skor üretilmez.
23. [EKSİK] Goller için top kazanımı, pas alıcısı, aksiyon zinciri ve faz kimliği doğrulanmadı.
24. [REVIEW] GAL sprint: toplam 1.975 m; hücum 987 m, savunma 604 m; açıklanmayan fark 384 m.
25. [REVIEW] KON sprint: toplam 1.945 m; hücum 414 m, savunma 1.094 m; açıklanmayan fark 437 m. `1.531 m` savunma tahmini yanlış.
26. [REVIEW] Yüksek hızlı koşuda açıklanmayan kırılım: GAL 8.541−3.107−3.345=2.089 m; KON 8.473−2.668−3.803=2.002 m.
27. [EKSİK] Maçlık bireysel sprint yok; `player_fitness=SEASON_AGGREGATE_ONLY_NOT_MATCH`. Osimhen için maçlık sprint iddiası kurma.

## Kanıt kaynakları ve yayın sınırı

- `/sdcard/HPAnalytic/data/output/packages_v4/konyaspor-gs-2026-10-30_v4.json`
- `/sdcard/HPAnalytic/data/output/editorial_briefs/konyaspor-gs-2026-10-30_fitness.json`
- Fitness kaynağı: `/sdcard/Download/31.10.2026 - Galatasaray - Team fitness.xlsx`, `Tüm maçlar` sayfası.
- Fitness kapsamı: `TEAM_MATCH_ONLY`; durum `MATCH_LEVEL_IDENTIFIED`; `warnings=[]`.
- GAL hücum sprinti 987 m; KON hücum sprinti 414 m. Ölçümler mevcut; kırılımın tüm toplamı neden kapsamadığı açıklanmıyor.
- Açıklanmayan farkı `transition` gibi doğrulanmamış bir kategoriye taşıma.
- İç sistem yolları, inceleme durumları ve ham teknik alanlar okuyucu HTML'sine aktarılmamalı.
- Bu arşiv herhangi bir makale veya yayın onayı değildir.
