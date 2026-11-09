import xml.etree.ElementTree as ET, re
from pathlib import Path

md = Path('/storage/emulated/0/HPAnaliz/SportsBase/maclar/MATCH_2026_11_03_Galatasaray_vs_VfB_Stuttgart')

# Referans oyuncular: starter mi, sub mı olduğunu bildiklerimiz
targets = ['Karazor', 'Sallai', 'Barış', 'Batrakov', 'Jakobs',
           'Singo', 'Leão', 'Sané', 'Elmalı', 'Spalt', 'Nartey']

for xml_file in sorted(md.glob('*.xml')):
    print(f"\n=== {xml_file.name} ({xml_file.stat().st_size} bytes) ===")
    first_events = {}
    for inst in ET.parse(xml_file).getroot().iter('instance'):
        c = inst.find('code')
        if c is None or not c.text: continue
        m = re.match(r'^\d+\.\s+(.+?)\s+\(\d+\)\s*-', c.text.strip())
        if not m: continue
        name = m.group(1).strip()
        for t in targets:
            if t in name:
                s = inst.find('start')
                if s is None or not s.text: continue
                try: sv = float(s.text) / 60.0
                except: continue
                if name not in first_events or sv < first_events[name]:
                    first_events[name] = sv
                break
    for n, v in sorted(first_events.items(), key=lambda x: x[1]):
        print(f"  {n:25s} first = {v:.2f}'")
