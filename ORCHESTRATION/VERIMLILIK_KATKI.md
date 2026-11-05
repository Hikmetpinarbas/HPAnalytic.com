# VERİMLİLİK KATKISI — OFANSİF + DEFANSİF

## Felsefe
Her oyuncunun takıma katkısı **iki boyutta** ölçülür:

### Ofansif Katkı
- **Ağırlıklı metrikler:** Goals(4), Assists(4), xG(3), xA(3), Key passes(1.5), Chances created(1.2), Passes into penalty box(0.8), Progressive passes(0.7), Shots(0.5), Final third entries(0.3), Crosses(0.2)
- **Kaynak:** `players.xlsx`

### Defansif Katkı
- **Ağırlıklı metrikler:** Tackles successful(2.5), Tackles(2.0), Interceptions(2.0), Ball recoveries in opponent's half(1.5), Aerial challenges won(1.2), Ball recoveries(1.2), Challenges won(1.0), Clearances(1.0)
- **Kaynak:** `players.xlsx`

### Toplam
`total_pct = (offensive_pct + defensive_pct) / 2`

## Göstergeler
- **Node üzerinde çift bar** — turuncu (def), neon (of)
- **Hover:** "Yunus Akgün · Ofansif %11.2 · Defansif %3.5 · Toplam %7.4"
- **Değişenler panelinde:** "Sara ← Lemina: ofansif %5.3, defansif %9.1"

## Beklenti — Doğru profil testi
- **Kanat oyuncusu** (Yunus): OF yüksek, DEF düşük
- **Stoper** (Abdülkerim): OF düşük, DEF yüksek
- **DM** (Torreira): dengeli, DEF ağırlıklı
- **10 numara** (Batrakov): OF yüksek

Eğer bir kanat oyuncusunun DEF %15 çıkıyorsa, ağırlıklarda bir sorun var.

## Sürdürülebilirlik
- Ağırlıklar bu dosyada sabit, koda gömülü değil
- Metrik eklendiğinde bu doküman + script birlikte güncellenir
