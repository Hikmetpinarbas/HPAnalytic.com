import os, re, shutil, hashlib
from pathlib import Path
import openpyxl

DOWNLOAD = Path("/sdcard/Download")
MACLAR = Path("/sdcard/HPAnaliz/SportsBase/maclar")
KARANTINA = Path("/sdcard/HPAnaliz/SportsBase/KARANTINA")
TARGET_DIR = MACLAR / "MATCH_2026_11_03_Galatasaray_vs_VfB_Stuttgart"

def analyze_file(fp):
    """5 Parametreli Çapraz Kontrol"""
    scores = {'PLAYERS': 0, 'TEAMS': 0, 'GOALKEEPERS': 0}
    name = fp.name.lower()
    size = fp.stat().st_size
    ext = fp.suffix.lower()
    
    if 'player' in name: scores['PLAYERS'] += 2
    elif 'team' in name: scores['TEAMS'] += 2
    elif 'goalkeep' in name: scores['GOALKEEPERS'] += 2

    if size > 250_000: scores['PLAYERS'] += 1; scores['TEAMS'] += 1
    elif size < 50_000: scores['GOALKEEPERS'] += 2

    if ext == '.csv':
        with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
            header = f.readline().lower()
            rows = sum(1 for _ in f)
            if 'player' in header or 'shirt' in header: scores['PLAYERS'] += 3
            elif 'team' in header and 'player' not in header: scores['TEAMS'] += 3
            else: scores['GOALKEEPERS'] += 3
            if rows > 1500: scores['PLAYERS'] += 1
            elif rows < 300: scores['GOALKEEPERS'] += 1

    elif ext == '.xml':
        with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
            head = f.read(5000).lower()
            if 'players' in head and 'goalkeepers' not in head: scores['PLAYERS'] += 3
            elif 'teams' in head and 'players' not in head: scores['TEAMS'] += 3
            else: scores['GOALKEEPERS'] += 3

    elif ext == '.xlsx':
        try:
            wb = openpyxl.load_workbook(fp, read_only=True)
            sheet = ' '.join(wb.sheetnames).lower()
            if 'player' in sheet and 'gk' not in sheet: scores['PLAYERS'] += 3
            elif 'team' in sheet and 'player' not in sheet: scores['TEAMS'] += 3
            else: scores['GOALKEEPERS'] += 3
        except: pass

    best_type = max(scores, key=scores.get)
    sorted_scores = sorted(scores.values(), reverse=True)
    
    # Güven skoru düşükse veya iki tip birbirine çok yakınsa KARANTINA'ya
    if sorted_scores[0] < 4 or (sorted_scores[0] - sorted_scores[1] < 2):
        return None, scores
    return best_type, scores

def process():
    if not DOWNLOAD.exists(): return
    print("🛡️ GÜVENLİ ORGANİZASYON BAŞLADI (Sadece Kopyalama)\n")
    
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    count = 0

    for f in DOWNLOAD.iterdir():
        if not f.is_file() or f.suffix.lower() not in ['.csv', '.xml', '.xlsx']: continue
        # Sadece Stuttgart maçı dosyalarını al, Atletico'yu karıştırma
        if 'stuttgart' not in f.name.lower() or 'atletico' in f.name.lower(): continue

        detected, scores = analyze_file(f)
        
        if not detected:
            KARANTINA.mkdir(parents=True, exist_ok=True)
            dest = KARANTINA / f.name
            if not dest.exists():
                shutil.copy2(f, dest)
            print(f"  ⚠️ KARANTINA: {f.name} | Skorlar: {scores}")
            continue

        dest = TARGET_DIR / f"{detected}__{f.suffix[1:].upper()}{f.suffix}"
        if not dest.exists():
            shutil.copy2(f, dest) # KOPYALA, TAŞIMA YOK
            print(f"  ✅ KOPYALANDI: {f.name} -> {dest.name} (Tip: {detected})")
            count += 1
        else:
            print(f"  ⏭️ ATLANDI (Hedefte zaten var): {f.name}")

    print(f"\n✅ Bitti. {count} yeni dosya kopyalandı. Orijinaller Download'da güvende.")

if __name__ == "__main__":
    process()
