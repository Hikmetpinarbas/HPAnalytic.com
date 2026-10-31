# HPAnalytic — Yöntem ve Teknoloji Araştırması v1
**Tarih:** 31.10.2026 · **Durum:** çalışma belgesi, sabah Hikmet onayına
**Kapsam:** Futbol analitiğinde kullanılan matematik, istatistik, yazılım, analiz biçimleri.

---

## BÖLÜM I — MATEMATİK VE İSTATİSTİK

### 1. Olasılık Modelleri (skor ve olay tahmini)

| Yöntem | Ne sorar | Veri | Kütüphane | HPA'da |
|---|---|---|---|---|
| **Poisson** | Kaç gol atar? | Takım gol ortalaması | scipy.stats.poisson | Tek maç için zayıf, sezon için güçlü |
| **Bivariate Poisson** | İki takım bağımlı mı? | Ortak gol dağılımı | scipy | Sezon gerekli |
| **Dixon-Coles** | Düşük skor düzeltmesi | Tüm lig maçları | kendi kod | Sezon XLSX varsa mümkün |
| **Skellam** | Skor farkı olasılığı | λ_home, λ_away | scipy.stats.skellam | Maç önü simülasyon |
| **Bayesçi hiyerarşik** | Küçük örnekte? | Tüm maçlar + önsel | pymc (yok), statsmodels | Bu hafta kurulum |
| **Bootstrap CI** | Ortalama güven aralığı | Her metrik | numpy | Her yerde kullanılmalı |
| **Wilson CI** | Oran güven aralığı | Şut isabeti gibi | statsmodels.stats | Zorunlu |
| **Permütasyon testi** | Fark gerçek mi? | İki grup | scipy.stats.permutation_test | Küçük n için |

**Kural:** n<30 ise Wilson aralığı ve permütasyon testi; n>100 ise standart testler.

### 2. Değer Modelleri (aksiyon başına katkı)

| Yöntem | Ne ölçer | Veri | Durum |
|---|---|---|---|
| **xG** | Şut → gol olasılığı | XLSX'te hazır | ✓ var |
| **xT (Expected Threat)** | Pozisyon → gol potansiyeli | pos_x, pos_y | ✓ vekil kuruldu |
| **xA** | Pas → asist olasılığı | XLSX'te hazır | ✓ var |
| **xGOT** | Şut → kurtarılabilirlik | XLSX'te var mı | Kontrol |
| **VAEP** | Aksiyon → skor değişimi | Olay + skor | socceraction yok, kendi kod |
| **EPV** | Possession → beklenen değer | Tracking gerekir | ✗ vekil |
| **OBV** | Top üzerinde değer | FBref'ten | Kopya |
| **xPass** | Pas tamamlanma olasılığı | pos + pas tipi | Mümkün |
| **Packing rate** | Kaç rakibi geçti? | pos + rakip konum | Vekil |

**Kritik ayrım:** xT "pozisyon değeri", VAEP "aksiyon değeri". İkisi farklı soruyu yanıtlar.

### 3. Zaman Serisi ve Sekans

| Yöntem | Ne sorar | Veri | Not |
|---|---|---|---|
| **Markov zinciri** | Sonraki aksiyon ne? | Aksiyon geçişleri | Pas tahmini |
| **HMM** | Hangi fazdayız? | Aksiyon + pozisyon | Faz tespiti |
| **Change-point** | Ne zaman değişti? | Aksiyon yoğunluğu | Momentum |
| **Survival analizi** | At-risk ne zaman? | Top kaybı süresi | Kaç saniye dayandı |
| **Hawkes süreci** | Olay kümelenmesi? | Şut/kart zamanı | Riskli, örneklem küçük |

### 4. Ağ Teorisi (pas ağı)

| Yöntem | Ne sorar | Kütüphane | Durum |
|---|---|---|---|
| **Degree centrality** | Kim çok pas alıyor? | networkx | ✓ kolay |
| **Betweenness** | Kim köprü? | networkx | ✓ kolay |
| **Clustering** | Alt gruplar? | networkx | ✓ kolay |
| **Louvain community** | Hangi kümeler? | networkx | ✓ kolay |
| **Pass motifs** | Tipik 3-4 pas? | kendi kod | Orta |
| **Weighted centrality** | Pas ağırlıklı | networkx | ✓ |

### 5. Uzamsal İstatistik

| Yöntem | Ne sorar | Kütüphane |
|---|---|---|
| **KDE ısı haritası** | Yoğunluk nerede? | scipy.stats.gaussian_kde |
| **Voronoi** | Bölge kontrolü | scipy.spatial.Voronoi |
| **Ripley's K** | Kümelenme var mı? | kendi kod |
| **Hexbin** | 6-gen grid | matplotlib |
| **xT grid** | Pozisyon değeri | ✓ kuruldu |

### 6. Optimizasyon

| Yöntem | Ne sorar | Kütüphane |
|---|---|---|
| **Linear programming** | En iyi kadro? | scipy.optimize.linprog |
| **Assignment** | En iyi eşleşme? | scipy.optimize.linear_sum_assignment |
| **Dynamic programming** | Optimal oyun planı | kendi kod |
| **Minimax** | Duran top savunma | kendi kod |

### 7. Boyut İndirgeme ve Kümeleme

| Yöntem | Ne sorar | Kütüphane | Öncelik |
|---|---|---|---|
| **PCA** | Oyuncu stil haritası | sklearn | ✓ öncelikli |
| **t-SNE** | Benzerlik | sklearn | Görsel |
| **UMAP** | Hızlı benzerlik | umap (yok) | Sonra |
| **K-means** | Hücum tipi | sklearn | ✓ öncelikli |
| **DBSCAN** | Yoğunluk kümesi | sklearn | Orta |
| **GMM** | Soft küme | sklearn | Orta |

### 8. Nedensel Çıkarım

| Yöntem | Ne sorar | Veri | Not |
|---|---|---|---|
| **Difference-in-differences** | Müdahale etkisi? | Ön/son | Maç içi taktik değişiklik |
| **Propensity matching** | Benzer oyuncu? | Sezon XLSX | Scouting için |
| **DAG** | Nedensel grafik | Uzman bilgisi | Yazı için |

### 9. Bilgi Teorisi

| Yöntem | Ne sorar |
|---|---|
| **Shannon entropi** | Oyun düzensizliği |
| **JS divergence** | Dağılım farkı (yarı bazlı) |
| **Mutual information** | İki olay bağımlı mı? |

### 10. Karar Teorisi

| Yöntem | Ne sorar |
|---|---|
| **Expected value** | Beklenen değer (duran top) |
| **Decision tree** | Karar ağacı (kadro) |
| **Nash equilibrium** | Penalta oyunu |

---

## BÖLÜM II — YAZILIM TEKNOLOJİLERİ

### Veri katmanı
- **pandas 3.1** — okuma, filtre (temel)
- **polars** — 10× hızlı, opsiyonel (yok)
- **duckdb 1.5** — SQL ile aggregate (✓ var)
- **Parquet** — büyük dosya (gerekirse)
- **openpyxl, lxml** — XLSX, XML (✓ var)

### Hesaplama
- **numpy 2.5** — vektör (✓)
- **scipy 1.18** — istatistik (✓)
- **numba** — JIT hızlandırma (yok, gerekirse)
- **dask** — parallel (gerekmez, tek maç)

### ML
- **scikit-learn 1.9** — kmeans, PCA, RF (✓)
- **statsmodels 0.15** — regresyon (✓)
- **XGBoost/LightGBM** — xG modeli (yok, gerekirse)

### Görsel
- **matplotlib 3.11** — temel (✓)
- **mplsoccer 1.8** — saha (✓ Userland)
- **plotly + kaleido** — interaktif (✓)
- **D3.js** — web interaktif (✓)
- **svgwrite** — SVG (✓)

### Video
- **ffmpeg 8.1** — MP4/GIF (✓)
- **Pillow** — kare üret (✓)

### Pipeline
- **kendi CLI** — `hpa analyze` (✓ başladı)
- **Make/Snakemake** — workflow (gerekirse)

### API/Web
- **Vite 8** — build (✓)
- **Netlify** — host (✓)
- **FastAPI** — API (gerekmez, static yeter)

---

## BÖLÜM III — FUTBOL ANALİZ BİÇİMLERİ

### 1. Maç Analizi (tek maç)
- xG flow (dakika × kümülatif)
- Momentum timeline
- Phase analysis (in/out pos)
- Set-piece breakdown
- Individual events (pas, şut, mücadele)
- Goal chains (öncesi 15sn)

### 2. Oyuncu Analizi
- Percentile radar (grup içi)
- Rolling 10 maç
- Adjusted per90
- Progression (pass/carry)
- Defensive actions p90
- xG over/under performance

### 3. Takım Analizi
- PPDA (pres yoğunluğu)
- Field tilt (saha hakimiyeti)
- Deep completion
- Direct speed (m/dk)
- Press resistance
- Transition speed

### 4. Sezon Analizi
- Table trajectory
- xG vs points (over/under)
- Consistency (variance)
- Strength of schedule
- Home/away split

### 5. Turnuva Analizi
- Group → knockout delta
- Squad rotation
- Fatigue effects
- Opponent quality adjustment

### 6. Rakip Analizi (scouting)
- Formation scan
- Set-piece tendencies
- Pressing patterns
- Weak zones (heatmap)
- Similar opponents matching

### 7. Taktik Trendler
- Formation adoption rate (lig geneli)
- Build-up pattern prevalence
- High-press adoption
- Set-piece evolution

### 8. Tarihsel Analiz
- Era comparison (1950 vs 2026)
- Player evolution (physical demands)
- Tactic diffusion

---

## BÖLÜM IV — HPA PIPELINE'A NE GİRMELİ

### Öncelik P0 (bu hafta)
1. **xG flow** — Lille yazısı için kritik
2. **Percentile radar** — her oyuncu için
3. **Pass network centrality** — data lab
4. **xT grid + trace** — ✓ başladı

### P1 (gelecek hafta)
5. **Poisson skor simülasyonu** — maç önü
6. **Dixon-Coles** — sezon modeli (yeterli maç varsa)
7. **K-means hücum tipleri** — insight
8. **PCA oyuncu haritası** — scouting

### P2 (sonraki)
9. **HMM faz tespiti**
10. **Causal matching** (benzer oyuncu)
11. **Voronoi bölge kontrolü**
12. **Nash penalty modeli**

### Bilinçli olarak dışarıda
- **Derin öğrenme** — veri yok, sonuç gürültü
- **Pitch control** — tracking yok
- **RL oyun planı** — veri yok
- **socceraction VAEP** — pandas 1.x deps, kendi kod yeterli
- **StatsBomb open data** — bu hafta değil, tarih yazısı için

---

## BÖLÜM V — SINIRLAR VE KARŞI KANIT

**Her yöntemin bir sınırı var. Uydurmayacağız.**

| Yöntem | Ne yapamaz |
|---|---|
| xG | Bitiricilik yeteneği ölçmez — sadece şut kalitesi |
| xT | Pası atan oyuncuyu bilmez — sadece konum |
| Poisson | Kadro/sakatlık bilmez |
| Pass network | Pas veren-alan gerçek mi? (5sn pencere tahmini) |
| VAEP | Takım arkadaşları bağlamını atlar |
| K-means | Etiket süpervizyonu yok — yorumcu gerekir |

**Karşı kanıt protokolü:**
Her iddia için bir "sınır cümlesi" yazılır. "Yanlışsam ne görmeliyim?" sorusu cevaplanır.

---

## BÖLÜM VI — SONRAKİ ADIMLAR

1. **Sabah** (Hikmet onayı):
   - Öncelik sırası onaylanır
   - xT trace test edilir
   - Pipeline dosyaları gözden geçirilir

2. **Yarın**:
   - xG flow modülü (XLSX → dakika eğrisi)
   - İlk gerçek görsel: Lille-GS xG flow + shot map + xt-grid
   - Yazıya yerleştir

3. **Bu hafta**:
   - Her derive modülü tamamlanır
   - Visual katalogdan otomatik seçim
   - Narrative şablonlar

4. **Gelecek hafta**:
   - Sezon verisi pipeline'a
   - Takım karşılaştırma modülü
   - Otomasyon cron

---

**Yazar notu:** Bu belge bir reçete değil, bir harita. Hangi yolu seçeceğimizi Hikmet söyler. Ben sadece yolların nereye çıktığını yazarım.

**Kaynaklar:** Karstens & Zaman 2013 (xT), Decroos 2019 (VAEP), Dixon-Coles 1997, Spearman 2018 (pitch control), StatsBomb blog, Opta Analyst.
