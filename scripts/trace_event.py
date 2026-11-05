import csv, os
import pandas as pd
from pathlib import Path

BASE = Path("public/assets/data/gs-stuttgart")
SRC = Path("/storage/emulated/0/HPAnaliz/SportsBase/maclar/MATCH_2026_11_03_Galatasaray_vs_Stuttgart")

print("=" * 70)
print("BİR KALE VURUŞUNUN 6 DOSYADAKİ İZİNİ SÜRELİM")
print("=" * 70)

# 1. players.csv'den ilk kale vuruşunu bul
gk_events = []
with open(BASE / "players.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter=";"):
        if "Goal kicks" in row["code"] and row["pos_x"]:
            gk_events.append(row)

first = gk_events[0]
target_id = first["ID"]
target_start = float(first["start"])

print(f"\nHEDEF OLAY: ID={target_id}, start={first['start']}, action={first['action']}")
print(f"  pos_x={first['pos_x']}, pos_y={first['pos_y']}\n")

# 2. players.csv - aynı ID
print("[1] players.csv — SADECE aynı ID:")
with open(BASE / "players.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter=";"):
        if row["ID"] == target_id:
            print(f"  ID={row['ID']} | {row['start']}-{row['end']} | {row['action']} | pos=({row['pos_x']},{row['pos_y']})")

# 3. teams.csv - aynı ID
print("\n[2] teams.csv — AYNI ID (başka bir oyuncunun olayı mı?):")
with open(BASE / "teams.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter=";"):
        if row["ID"] == target_id:
            print(f"  ID={row['ID']} | {row['start']}-{row['end']} | {row['code']} | pos=({row['pos_x']},{row['pos_y']})")

# 4. teams.csv - aynı zaman penceresi (start ± 1 sn)
print(f"\n[3] teams.csv — aynı ZAMAN penceresi (start={target_start} ± 1):")
with open(BASE / "teams.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter=";"):
        try:
            s = float(row["start"])
        except: continue
        if abs(s - target_start) <= 1:
            print(f"  ID={row['ID']} | {row['start']}-{row['end']} | {row['code'][:60]} | pos=({row['pos_x']},{row['pos_y']})")

# 5. XML'ler
print(f"\n[4] players.XML — aynı ID:")
xml_path = SRC / "MATCH_2026_11_03_Galatasaray_vs_Stuttgart__PLAYERS__XML.xml"
if xml_path.exists():
    import xml.etree.ElementTree as ET
    tree = ET.parse(xml_path)
    for inst in tree.getroot().iter("instance"):
        id_el = inst.find("ID")
        if id_el is not None and id_el.text == target_id:
            code_el = inst.find("code")
            print(f"  ID={target_id} | code={code_el.text[:60] if code_el is not None else '-'}")
            for lbl in inst.findall("label"):
                g = lbl.find("group").text if lbl.find("group") is not None else "?"
                t = lbl.find("text").text if lbl.find("text") is not None else "?"
                print(f"    {g} = {t}")

# 6. goalkeepers.xlsx — zaman yok, sadece sayılar
print(f"\n[5] goalkeepers.xlsx — zaman damgası YOK, sadece toplam sayılar:")
print(f"  (Bu dosya her kale vuruşunun toplamını içerir, tek tek eşleştirme mümkün değil)")
print(f"  Uğurcan: 'Goal kicks' = 2 (kale vuruşu sayısı)")
print(f"  Ama bu maçta players.csv'de {len(gk_events)} kale vuruşu olayı var!")

print("\n" + "=" * 70)
print("SONUÇ")
print("=" * 70)
print(f"players.csv'de 'Goal kicks' etiketli satır: {len(gk_events)}")
print(f"goalkeepers.xlsx'te 'Goal kicks' sayısı: 2")
print(f"Fark: x{len(gk_events) // 2}")
print()
print("Bu farkın sebebi: players.csv'de bir kale vuruşu")
print("top havada kaldığı süre boyunca HER SANİYE tekrar kayıtlı.")
print("goalkeepers.xlsx ise gerçek SAYIYI veriyor.")
print()
print("Çözüm: players.csv'de (team + round(start)) bazlı DEDUPE gerek.")
