#!/usr/bin/env python3
"""PLAYERS.xml → shot_map.json (dedup + coordinate normalize)."""
import json
from pathlib import Path
from lxml import etree
from collections import Counter

SRC = Path.home() / "pipeline/input/gs-fb-2026-10-26/MATCH_2026-10-26_Galatasaray_vs_Fenerbahce_XML_PLAYERS.xml"
OUT = Path.home() / "hpanalytic/public/assets/data/shot_map.json"

tree = etree.parse(str(SRC))
root = tree.getroot()

# Instance bazlı event topla
events = {}
for inst in root.iter('instance'):
    eid = inst.findtext('ID')
    start = inst.findtext('start')
    end = inst.findtext('end')
    if eid not in events:
        events[eid] = {"id": eid, "start": float(start or 0), "end": float(end or 0), "codes": []}
    # Bu instance'ın altındaki tüm code'ları topla
    for code in inst.iter('code'):
        txt = code.findtext('text') or ''
        if txt and txt not in events[eid]["codes"]:
            events[eid]["codes"].append(txt)

# Her event için player/team/koordinat
# CSV'den al (daha kolay)
import csv
CSV_SRC = Path.home() / "pipeline/input/gs-fb-2026-10-26/MATCH_2026-10-26_Galatasaray_vs_Fenerbahce_CSV_PLAYERS.csv"
csv_data = {}
with open(CSV_SRC, encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        eid = row['ID']
        if eid not in csv_data:
            csv_data[eid] = row

SHOT_CODES = {
    "45. Goals": ("Goal", 1),
    "45.1 Shots on target": ("On Target", 2),
    "45.2 Shots off target": ("Off Target", 3),
    "45.3 Shots blocked": ("Blocked", 4),
    "45.4 Shots on post / bar": ("Post", 5),
}
TYPE_PRIORITY = {"Goal": 1, "Post": 2, "On Target": 3, "Blocked": 4, "Off Target": 5}

raw = []
for eid, ev in events.items():
    types = [SHOT_CODES[c][0] for c in ev["codes"] if c in SHOT_CODES]
    if not types: continue
    best = min(types, key=lambda t: TYPE_PRIORITY[t])
    row = csv_data.get(eid)
    if not row: continue
    raw.append({
        "id": eid,
        "player": row.get('action', '').split(' - ')[0] if row.get('action') else '',
        "team": "GS" if "Galatasaray" in (row.get('team', '') or '') else "FB",
        "x": float(row.get('pos_x', 0) or 0),
        "y": float(row.get('pos_y', 0) or 0),
        "type": best,
        "start": ev["start"],
    })

# Dedup: aynı oyuncu + aynı koordinat + yakın zaman (5 saniye içinde) → tek
raw.sort(key=lambda s: (s["player"], round(s["x"], 1), round(s["y"], 1), s["start"]))
deduped = []
for s in raw:
    if not deduped:
        deduped.append(s)
        continue
    prev = deduped[-1]
    if (prev["player"] == s["player"]
        and abs(prev["x"] - s["x"]) < 0.5
        and abs(prev["y"] - s["y"]) < 0.5
        and s["start"] - prev["start"] < 5):
        # Daha yüksek öncelikli tipi tut
        if TYPE_PRIORITY[s["type"]] < TYPE_PRIORITY[prev["type"]]:
            deduped[-1] = s
        continue
    deduped.append(s)

# x koordinatını normalize et — Fenerbahçe sağdan sola oynuyor
for s in deduped:
    if s["team"] == "FB":
        s["x"] = 105 - s["x"]
    s["x"] = round(s["x"], 2)
    s["y"] = round(s["y"], 2)

OUT.write_text(json.dumps(deduped, ensure_ascii=False, indent=2))

print(f"✓ {len(raw)} ham → {len(deduped)} dedup şut")
print(f"  Tip dağılımı: {dict(Counter(s['type'] for s in deduped))}")
print(f"  Takım dağılımı: {dict(Counter(s['team'] for s in deduped))}")
