#!/usr/bin/env bash
# Pitch Layers veri köprüsü
# Pipeline'ın ürettiği SVG/JSON çıktılarını site veri klasörüne aktarır.
#
# Kullanım:
#   bridge-pitch-layers.sh <match-slug> [observations.csv]
#
# observations.csv verilmişse: Python modülleriyle SVG üretir.
# Verilmemişse: pipeline çıktı klasörlerinden otomatik arar.

set -euo pipefail

MATCH_SLUG="${1:?Kullanım: bridge-pitch-layers.sh <match-slug> [observations.csv]}"
OBS_CSV="${2:-}"

SITE_DATA="/root/hpanalytic-repo/public/assets/data/${MATCH_SLUG}"
PIPELINE_DIR="/data/data/com.termux/files/home/HP_WORKSPACE/hp_pipeline"
MERGED="${PIPELINE_DIR}/_userland_merged"

mkdir -p "${SITE_DATA}"

# Otomatik arama: observations.csv verilmediyse pipeline klasörlerinde bul
if [ -z "${OBS_CSV}" ] || [ ! -f "${OBS_CSV}" ]; then
  echo ">>> Pipeline çıktılarında observations.csv aranıyor..."
  for stage_dir in "${PIPELINE_DIR}/output/${MATCH_SLUG}" \
                   "${PIPELINE_DIR}/test_outputs"/*"${MATCH_SLUG}"*; do
    if [ -f "${stage_dir}/observations.csv" ]; then
      OBS_CSV="${stage_dir}/observations.csv"
      echo ">>> Bulundu: ${OBS_CSV}"
      break
    fi
  done
fi

# Üretim: observations.csv varsa SVG üret
if [ -n "${OBS_CSV}" ] && [ -f "${OBS_CSV}" ]; then
  echo ">>> SVG üretiliyor: ${OBS_CSV}"
  python3 -c "
import sys, csv, json
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, '${MERGED}')
from pitch_layers import build_svg, teams_of
from sixteen_layers import build as build_sixteen

def _number(v):
    try: return float(v) if v not in (None, '', 'None') else None
    except (TypeError, ValueError): return None

def _family(s):
    v = (s or '').casefold()
    if 'keeper' in v or 'goal' in v or v in ('gk','goalkeeper'): return 'keeper'
    if 'team' in v: return 'team'
    return 'player'

def load_obs(path):
    events = defaultdict(list)
    ids = []
    with open(path, newline='', encoding='utf-8') as f:
        for n, row in enumerate(csv.DictReader(f), start=2):
            fam = _family(row.get('surface'))
            sr = row.get('source_row') or str(n)
            key = f'{fam}|{sr}'
            act = (row.get('action_csv') or row.get('action_xml') or '').strip()
            team = (row.get('team_resolved') or row.get('team_csv') or
                    row.get('team_xml') or 'UNKNOWN').strip() or 'UNKNOWN'
            x, y = _number(row.get('pos_x')), _number(row.get('pos_y'))
            events[fam].append({
                'event_key': key, 'family': fam,
                'team': team, 'coord': [x, y] if x is not None and y is not None else None,
                'action_labels': [act] if act else [],
            })
            if team != 'UNKNOWN' and team not in ids: ids.append(team)
    return {'events': dict(events), 'team_identities': {str(i): n for i, n in enumerate(ids[:2], 1)}}

data = load_obs('${OBS_CSV}')
turnovers = {'turnovers': []}

svg9 = build_svg(data, turnovers)
svg16, counts = build_sixteen(data, turnovers)

Path('${SITE_DATA}/pitch_layers.svg').write_text(svg9, encoding='utf-8')
Path('${SITE_DATA}/sixteen_layers.svg').write_text(svg16, encoding='utf-8')

meta = {
    'match': '${MATCH_SLUG}',
    'teams': dict(data.get('team_identities', {})),
    'layer_counts': counts,
    'layers_available': ['pitch_layers', 'sixteen_layers']
}
Path('${SITE_DATA}/pitch_layers_meta.json').write_text(
    json.dumps(meta, indent=2, ensure_ascii=False), encoding='utf-8')

print(f'pitch_layers.svg: {len(svg9)} bytes')
print(f'sixteen_layers.svg: {len(svg16)} bytes')
print(f'Meta: {json.dumps(meta, ensure_ascii=False)}')
"
else
  echo ">>> observations.csv bulunamadı. Hazır SVG aranıyor..."
  FOUND=0
  for src in "${PIPELINE_DIR}/output/${MATCH_SLUG}"/*.svg \
             "${PIPELINE_DIR}/test_outputs"/*"${MATCH_SLUG}"*/*.svg; do
    [ -f "${src}" ] || continue
    base=$(basename "${src}")
    cp "${src}" "${SITE_DATA}/${base}"
    echo "Kopyalandı: ${base}"
    FOUND=1
  done

  if [ ! -f "${SITE_DATA}/pitch_layers_meta.json" ]; then
    echo '{"match":"'"${MATCH_SLUG}"'","layers_available":[]}' > "${SITE_DATA}/pitch_layers_meta.json"
  fi

  if [ "${FOUND}" -eq 0 ]; then
    echo "UYARI: Ne observations.csv ne de hazır SVG bulunabildi."
    echo "Kullanım: bridge-pitch-layers.sh ${MATCH_SLUG} /path/to/observations.csv"
  fi
fi

echo "=== Köprü tamamlandı: ${SITE_DATA} ==="
ls -la "${SITE_DATA}"/pitch_layers* "${SITE_DATA}"/sixteen_layers* 2>/dev/null || echo "(Henüz SVG yok)"
