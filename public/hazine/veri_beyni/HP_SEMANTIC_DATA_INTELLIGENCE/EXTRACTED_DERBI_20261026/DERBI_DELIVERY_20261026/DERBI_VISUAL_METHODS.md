# HPAnalytic — Görselleştirme Metodolojisi ve Harsh Krishna Uyarlaması
**Doküman:** DERBI_VISUAL_METHODS.md  
**Referans Depo:** [harshkrishna17 GitHub Repositories](https://github.com/harshkrishna17)  

---

## 1. İncelenen Projeler ve Uyarlanan Teknikler

### A. Shot-Centrality (`harshkrishna17/Shot-Centrality`)
- **Teorik Temel:** Bir takımın veya oyuncunun şutlarının kale çizgisi merkezine ($Xc=105, Yc=34$) olan yakınlığını ve merkeziliğini ölçer.
- **Matematiksel Formülasyon:**
  $$X_{sd} = \sqrt{\frac{1}{N}\sum (105 - x_i)^2}, \quad Y_{sd} = \sqrt{\frac{1}{N}\sum (34 - y_i)^2}$$
  Burada $Y_{sd}$ şutların kale merkez aksından ne kadar saptığını (açı daralmasını), $X_{sd}$ ise şutların kaleye olan ortalama derinlik mesafesini ifade eder.
- **HPAnalytic Uyarlaması:** [HPA_DERBI_SHOT_CENTRALITY.png](file:///home/userland/HP_WORKSPACE/DERBI_DELIVERY_20261026/charts/HPA_DERBI_SHOT_CENTRALITY.png) grafiğinde son Alanyaspor ve Gençlerbirliği maçlarının şut koordinatları birebir bu formülle haritalandırılmış, kale çizgisi merkeziyle olan mekânsal ilişki görselleştirilmiştir.

### B. xG Race / Step Chart (`harshkrishna17/ggplot2-Functions` & `PlayerFinishingOverviewShiny`)
- **Teorik Temel:** Maç boyunca şutların zaman damgasıyla biriken kümülatif xG değerinin basamak fonksiyonu (step function) olarak çizilmesi.
- **HPAnalytic Uyarlaması:** [HPA_DERBI_XG_RACE_TREND.png](file:///home/userland/HP_WORKSPACE/DERBI_DELIVERY_20261026/charts/HPA_DERBI_XG_RACE_TREND.png) grafiğinde iki takımın son lig karşılaşmalarındaki xG birikim ritmi dakika bazında karşılaştırılmıştır.

### C. Dumbbell Chart (Lig Medyanına Göre Konumlandırma)
- **Teorik Temel:** Takımların performansını izole bir mutlak değer olarak değil, ligin 19 takımından elde edilen medyan değerine olan mesafesiyle kıyaslama yöntemi.
- **HPAnalytic Uyarlaması:** [HPA_DERBI_DUMBBELL_LIG_MEDYANI.png](file:///home/userland/HP_WORKSPACE/DERBI_DELIVERY_20261026/charts/HPA_DERBI_DUMBBELL_LIG_MEDYANI.png) grafiğinde 9 kritik metrikte Lig Medyanı, Fenerbahçe ve Galatasaray tek eksende gösterilmiştir.

---

## 2. Grafik Güvenilirlik İlkeleri
1. **Sıfır Manuel Sabitleme:** Hiçbir grafik değeri koda elle yazılmamıştır; tamamı doğrudan `generate_all_visuals.py` betiği tarafından Excel ve CSV dosyaları okunarak hesaplanmaktadır.
2. **Çift Format:** Tüm grafikler yayın ve baskı kalitesi için hem `.png` (300 DPI) hem de vektörel `.svg` formatında derlenmiştir.
3. **Tutarlı Renk Kodlaması:**
   - Fenerbahçe: Lacivert zemin (`#0C2340`), Sarı hat (`#FFED02`)
   - Galatasaray: Kırmızı/Bordo zemin (`#A90432`), Sarı hat (`#FDB912`)
   - Nötr/Medyan: Gri/Mavi (`#9CA3AF`, `#4F46E5`)
