import subprocess, sys, shutil
from pathlib import Path

def main():
    args = sys.argv[1:]
    src, slug = None, None
    for i, a in enumerate(args):
        if a == '--src' and i+1 < len(args): src = args[i+1]
        elif a == '--slug' and i+1 < len(args): slug = args[i+1]
    if not src or not slug:
        print("KULLANIM: --src <dizin> --slug <slug>"); sys.exit(1)
    src_path = Path(src)
    if not src_path.exists():
        print(f"HATA: {src} bulunamadi"); sys.exit(1)
    out = Path("public/assets/data") / slug
    out.mkdir(parents=True, exist_ok=True)
    # Icеrik bazli algilama: "N. Isim (ID) - Event" formati hangi dosyada daha cok?
    import re as _re
    _player_re = _re.compile(r"^\d+\.\s+.+?\(\d+\)\s*-")
    def _count_player_lines(path):
        if not path or not path.exists(): return 0
        cnt = 0
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                for _ in range(200):
                    line = fh.readline()
                    if not line: break
                    parts = line.split(";")
                    if len(parts) >= 4 and _player_re.match(parts[3]):
                        cnt += 1
        except Exception:
            pass
        return cnt

    f_players = next(src_path.glob("*__PLAYERS__CSV.csv"), None)
    f_teams = next(src_path.glob("*__TEAMS__CSV.csv"), None)
    n_players = _count_player_lines(f_players)
    n_teams = _count_player_lines(f_teams)
    print(f"  oyuncu-satiri sayilari: PLAYERS_CSV={n_players} TEAMS_CSV={n_teams}")

    if n_players > n_teams:
        # Ters durum (Fenerbahce gibi): PLAYERS_CSV oyuncu iceriyor
        if f_players: shutil.copy(f_players, out / "teams.csv"); print("  kopya: teams.csv (PLAYERS_CSV'den)")
        if f_teams: shutil.copy(f_teams, out / "players.csv"); print("  kopya: players.csv (TEAMS_CSV'den)")
    else:
        # Normal durum (Stuttgart gibi)
        if f_players: shutil.copy(f_players, out / "players.csv"); print("  kopya: players.csv (PLAYERS_CSV'den)")
        if f_teams: shutil.copy(f_teams, out / "teams.csv"); print("  kopya: teams.csv (TEAMS_CSV'den)")
    for script, exp in [("build_gk_data.py","gk_distribution.json"),
                        ("build_pass_network_v2.py","pass_network_v2.json"),
                        ("build_player_zones.py","player_zones.json")]:
        print(f"\n> {script}")
        r = subprocess.run([sys.executable, f"scripts/{script}",
                            "--src", str(src_path.resolve()),
                            "--out", str(out.resolve())])
        if r.returncode == 0 and (out/exp).exists():
            print(f"  OK: {exp}")
        else:
            print(f"  FAIL exit={r.returncode}")
    print(f"\nCIKTI: {out}")
    for f in sorted(out.iterdir()):
        print(f"  {f.name}: {f.stat().st_size}")

if __name__ == "__main__": main()
