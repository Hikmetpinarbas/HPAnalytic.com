import pandas as pd
import json

INPUT_XLSX = "/storage/emulated/0/HPAnaliz/SportsBase/maclar/MATCH_2026_11_03_Galatasaray_vs_Stuttgart/MATCH_2026_11_03_Galatasaray_vs_Stuttgart__PLAYERS__XLSX.xlsx"
OUTPUT_JSON = "public/assets/data/gs-stuttgart/player_stats.json"

print("XLSX verisi işleniyor...")
df = pd.read_excel(INPUT_XLSX)

# Sadece ihtiyacımız olan sütunları seçelim
cols = ['Player', 'Team', 'Minutes played', 'Position', 'Goals', 'Assists', 'Shots', 'Shots on target', 
        'xG (expected goals)', 'xA (expected assists)', 'Passes', 'Passes accurate, %', 
        'Key passes', 'Progressive passes', 'Tackles', 'Interceptions', 'Challenges won, %']

# Sadece sahada olan oyuncuları al (yedekleri de alıyoruz ki değişikliklerde kullanabilelim)
df = df[cols].fillna(0)

# JSON'a çevir
stats = df.to_dict(orient='records')
with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(stats, f, indent=2, ensure_ascii=False)

print(f"✅ BAŞARILI! {len(stats)} oyuncunun detaylı istatistiği hazır.")
