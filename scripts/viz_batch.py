"""
Toplu maç işleyici. Bir manifest JSON okur, her maç için
build_viz_bundle.py'yi çağırır.

Manifest formatı:
[
  {"slug": "gs-stuttgart", "src": "/storage/.../MATCH_..."},
  ...
]

Kullanım:
  python3 scripts/viz_batch.py --manifest ORCHESTRATION/pilot_manifest.json
"""
import json, subprocess, sys
from pathlib import Path

def main():
    args = sys.argv[1:]
    manifest_path = "ORCHESTRATION/pilot_manifest.json"
    for i, a in enumerate(args):
        if a == '--manifest' and i+1 < len(args):
            manifest_path = args[i+1]

    mp = Path(manifest_path)
    if not mp.exists():
        print(f"HATA: manifest bulunamadi: {mp}")
        sys.exit(1)

    manifest = json.loads(mp.read_text(encoding="utf-8"))
    print(f"Manifest: {mp} ({len(manifest)} mac)\n")

    ok_count = 0
    fail_count = 0
    for i, m in enumerate(manifest, 1):
        slug = m.get("slug")
        src = m.get("src")
        print(f"\n{'='*60}")
        print(f"[{i}/{len(manifest)}] {slug}")
        print(f"  src: {src}")
        print(f"{'='*60}")

        src_path = Path(src)
        if not src_path.exists():
            print(f"  ATLANDI: kaynak dizin yok")
            fail_count += 1
            continue

        r = subprocess.run([
            sys.executable, "scripts/build_viz_bundle.py",
            "--src", str(src_path),
            "--slug", slug
        ])
        if r.returncode == 0:
            out_dir = Path("public/assets/data") / slug
            files = list(out_dir.glob("*.json")) if out_dir.exists() else []
            if len(files) >= 3:
                print(f"  ✅ {slug} BASARILI ({len(files)} JSON)")
                ok_count += 1
            else:
                print(f"  ⚠️ {slug} kismi ({len(files)} JSON, 3 beklenir)")
                fail_count += 1
        else:
            print(f"  ❌ {slug} FAIL (exit={r.returncode})")
            fail_count += 1

    print(f"\n{'='*60}")
    print(f"OZET: {ok_count} basarili, {fail_count} basarisiz / {len(manifest)} mac")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
