#!/usr/bin/env python3
import argparse, json
from pathlib import Path
from pipeline.core.loaders import load_players_csv
from pipeline.derive.xt import build_grid, trace_goal
from pipeline.derive.xg_flow import build_xg_flow

ROOT = Path.home() / "pipeline/input"
OUT = Path.home() / "hpanalytic/public/assets/data"

MATCHES = {
    'lille-gs': {
        'path': 'lille-gs-2026-10-21/MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.csv',
        'xlsx': 'lille-gs-2026-10-21/MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.xlsx',
        'home': 'LOSC Lille', 'away': 'Galatasaray', 'date': '2026-10-21',
    },
    'gs-fb': {
        'path': 'gs-fb-2026-10-26/MATCH_2026-10-26_Galatasaray_vs_Fenerbahce_CSV_PLAYERS.csv',
        'xlsx': 'gs-fb-2026-10-26/MATCH_2026-10-26_Galatasaray_vs_Fenerbahce_XLSX_PLAYERS.xlsx',
        'home': 'Galatasaray', 'away': 'Fenerbahce', 'date': '2026-10-26',
    },
}

def _load(match_id):
    cfg = MATCHES[match_id]
    return load_players_csv(ROOT / cfg['path'], match_id, cfg['home'], cfg['away'], cfg['date']), cfg

def cmd_xt(args):
    match, cfg = _load(args.match)
    print(f"✓ {args.match}: {len(match.events)} olay, {len(match.goals())} gol")
    grid = build_grid(match, target='GS')
    traces = sorted([trace_goal(match, g, grid) for g in match.goals()],
                    key=lambda t: t['minute'])
    out_dir = OUT / args.match
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'xt_grid.json').write_text(json.dumps(
        {'grid': {'x': 10, 'y': 8}, 'cells': grid, 'traces': traces},
        ensure_ascii=False, indent=2))
    print(f"✓ {len(traces)} gol trace")
    for tr in traces:
        print(f"  {tr['minute']}' {tr['team']} zirve={tr['peak_xT']:.3f} · {len(tr['cells'])} adım")

def cmd_xg(args):
    match, cfg = _load(args.match)
    flow = build_xg_flow(match, ROOT / cfg['xlsx'])
    out_dir = OUT / args.match
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'xg_flow.json').write_text(json.dumps(flow, ensure_ascii=False, indent=2))
    print(f"✓ xG flow: GS {flow['totals']['GS']} · LIL {flow['totals']['LIL']}")

def cmd_all(args):
    cmd_xt(args)
    cmd_xg(args)

def cmd_list(args):
    for k, v in MATCHES.items():
        print(f"  {k}: {v['home']} vs {v['away']} ({v['date']})")

def main():
    p = argparse.ArgumentParser(prog='hpa')
    sub = p.add_subparsers(dest='cmd', required=True)

    xt = sub.add_parser('xt'); xt.add_argument('match'); xt.set_defaults(func=cmd_xt)
    xg = sub.add_parser('xg'); xg.add_argument('match'); xg.set_defaults(func=cmd_xg)
    al = sub.add_parser('all'); al.add_argument('match'); al.set_defaults(func=cmd_all)
    ls = sub.add_parser('list'); ls.set_defaults(func=cmd_list)

    args = p.parse_args()
    args.func(args)

if __name__ == '__main__':
    main()
