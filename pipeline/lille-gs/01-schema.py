#!/usr/bin/env python3
"""Lille-GS veri şeması — action kodları, saat, koordinat."""
import csv, json
from pathlib import Path
from collections import Counter
from lxml import etree

SRC = Path.home() / "pipeline/input/lille-gs-2026-10-21"
OUT = Path.home() / "hpanalytic/docs"

# ── CSV PLAYERS ──
csv_path = SRC / "MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.csv"
actions = Counter()
half_counts = Counter()
sample_rows = []

with open(csv_path, encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for i, row in enumerate(reader):
        actions[row['action']] += 1
        half_counts[row['half']] += 1
        if i < 5:
            sample_rows.append(row)

# ── XML PLAYERS ──
xml_path = SRC / "MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.xml"
tree = etree.parse(str(xml_path))
root = tree.getroot()

xml_actions = Counter()
xml_groups = Counter()
for inst in root.iter('instance'):
    for lbl in inst.findall('label'):
        grp = lbl.findtext('group')
        txt = lbl.findtext('text')
        xml_groups[grp] += 1
        if grp == 'Action' and txt:
            xml_actions[txt] += 1

# ── RAPOR ──
report = {
    "csv": {
        "satir": sum(actions.values()),
        "action_kodlari": dict(actions.most_common()),
        "half_dagilimi": dict(half_counts),
        "ornek_5": sample_rows,
    },
    "xml": {
        "label_gruplari": dict(xml_groups.most_common()),
        "action_kodlari": dict(xml_actions.most_common()),
    },
}

(OUT / "LILLE-GS-SCHEMA.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2))

# Kısa terminal özeti
print(f"✓ CSV: {sum(actions.values())} satır · {len(actions)} farklı action")
print(f"✓ XML: {len(xml_actions)} farklı action")
print(f"✓ Half: {dict(half_counts)}")
print(f"\n=== CSV ACTION KODLARI (ilk 40) ===")
for act, cnt in actions.most_common(40):
    print(f"  {act}: {cnt}")
