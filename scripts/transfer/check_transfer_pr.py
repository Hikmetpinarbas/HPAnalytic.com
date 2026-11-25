"""PR diff tabanlı transfer kabulu kapısı (HP-MISTRAL-REPO-026).

Fail-closed: şüphede blokla. Standart kütüphane dışı bağımlılık yok.

Kontroller:
- denylist yol desenleri (transfer PR'ında asla görünmemeli)
- gizli bilgi / token taraması (tüm değişen metin dosyaları)
- cihaz yolu taraması (kod dosyaları; doküman örneği istisna)
- sembolik bağlantı / bozuk bağlantı
- boyut sınırı (needs_review eşik)
- .md içindeki göreli bağlantıların hedef dosyası var mı

Kullanım:
    python3 scripts/transfer/check_transfer_pr.py --base origin/main --head HEAD
    python3 scripts/transfer/check_transfer_pr.py --files a.py b.py   (dışarıdan dosya listesi ile)
"""
from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

SECRET_ORMUNTULERI = (  # hpa:allow-path: desen tanımları sabit olarak saklanır
    re.compile(r"sk-proj-[a-zA-Z0-9_-]{12,}"),  # hpa:allow-path: desen tanımı, sır değildir
    re.compile(r"ghp_[a-zA-Z0-9]{20,}"),
    re.compile(r"github_pat_[a-zA-Z0-9_]{20,}"),
    re.compile(r"AIza[a-zA-Z0-9_-]{30,}"),  # hpa:allow-path: desen tanımı, sır değildir
    re.compile(r"(?i)(api[_-]?key|token|secret)\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}['\"]"),
)

CIHAZ_YOLU_ORMUNTULERI = (  # hpa:allow-path: desen tanımları sabit olarak saklanmaz
    "/data/data/com.termux",  # hpa:allow-path: desen tanımı, sır değildir
    "/storage/emulated",  # hpa:allow-path: desen tanımı, sır değildir
    "/sdcard",  # hpa:allow-path: desen tanımı, sır değildir
)

KOD_UZANTILARI = (".py", ".mjs", ".js", ".ts", ".sh", ".html")

IZINLI_YOL_IMLECI = "hpa:allow-path"

TARAMA_MUAF_DOSYALAR = (
    "REPO_TRANSFER_ALLOWLIST.json",
    "REPO_TRANSFER_MANIFEST.schema.json",
    "REPO_TRANSFER_MANIFEST.example.json",
    "REPO_MODULE_MAP.json",
    "DEPENDENCY_MATRIX.json",
    "TRANSFER_ACCEPTANCE_REPORT.json",
)


def eslesiyor(desenler, yol):
    for d in desenler:
        if fnmatch.fnmatch(yol, d):
            return True
        if d.startswith("**/") and fnmatch.fnmatch(yol, d[3:]):
            return True
    return False


def metin_mi(veri_bayt):
    return b"\x00" not in veri_bayt[:8192]


def gizli_bilgi_tara(metin):
    bulunan = []
    for satir_no, satir in enumerate(metin.splitlines(), 1):
        if IZINLI_YOL_IMLECI in satir:
            continue
        for orm in SECRET_ORMUNTULERI:
            if orm.search(satir):
                bulunan.append((satir_no, orm.pattern[:40]))
    return bulunan


def cihaz_yolu_tara(metin, ek_desenler=()):
    bulunan = []
    desenler = set(CIHAZ_YOLU_ORMUNTULERI) | {d for d in ek_desenler if d.startswith("/")}
    for satir_no, satir in enumerate(metin.splitlines(), 1):
        if IZINLI_YOL_IMLECI in satir:
            continue
        for uyeleri in sorted(desenler, key=len, reverse=True):
            if uyeleri in satir:
                bulunan.append((satir_no, uyeleri))
    return bulunan


def goreli_link_tara(metin, dosya_yolu):
    hatalar = []
    for satir_no, satir in enumerate(metin.splitlines(), 1):
        for hedef in re.findall(r"\]\((?!https?://|#|/)[^)#\s]+\)", satir):
            hedef_yol = (Path(dosya_yolu).parent / hedef).resolve()
            if not hedef_yol.exists():
                hatalar.append((satir_no, hedef))
    return hatalar


def degisen_dosyalar(repo, taban, bas):
    sonuc = subprocess.run(
        ["git", "-C", str(repo), "diff", "--name-only", "--diff-filter=ACMR", f"{taban}...{bas}"],
        capture_output=True, text=True, check=False,
    )
    if sonuc.returncode != 0:
        raise SystemExit(f"GIT_DIFF_ERROR: {sonuc.stderr.strip()}")
    return [y for y in (s.strip() for s in sonuc.stdout.splitlines()) if y]


def denetle(dosyalar, izinliste, repo=REPO_ROOT):
    ihlaller = []
    deny = izinliste["deny"]["paths"]
    must_not = izinliste["deny"]["must_not_contain"]
    esik = izinliste["needs_review"].get("size_limit_bytes", 524288)
    istisnalar = izinliste.get("existing_whitelisted_exceptions", {}).get("paths", [])

    must_not_basina = [m for m in must_not if not m.startswith("/")]

    for yol in dosyalar:
        tam = repo / yol

        if os.path.islink(tam):
            ihlaller.append(("SYMLINK", yol, "Sembolik bağlantı repoya girmez"))
            continue
        if not tam.exists():
            ihlaller.append(("BROKEN_REFERENCE", yol, "Değişen dosya çalışma ağacında yok"))
            continue

        if eslesiyor(deny, yol) and not eslesiyor(istisnalar, yol):
            ihlaller.append(("DENYLIST", yol, f"{yol} denylist deseniyle eşleşti"))
            continue

        if tam.stat().st_size > esik:
            ihlaller.append(("SIZE_NEEDS_REVIEW", yol, f"{tam.stat().st_size} bayt > {esik}"))
            continue

        try:
            veri = tam.read_bytes()
        except OSError as e:
            ihlaller.append(("READ_ERROR", yol, str(e)[:80]))
            continue
        if not metin_mi(veri):
            continue
        metin = veri.decode("utf-8", errors="replace")

        if yol in TARAMA_MUAF_DOSYALAR:
            continue

        for satir_no, orm in gizli_bilgi_tara(metin):
            ihlaller.append(("SECRET_SCAN", f"{yol}:{satir_no}", f"desen {orm}"))

        if yol.endswith(KOD_UZANTILARI) or yol.endswith(".json"):
            dusuk = metin.lower()
            for satir_no, satir in enumerate(metin.splitlines(), 1):
                if IZINLI_YOL_IMLECI in satir:
                    continue
                for gizli in must_not_basina:
                    if gizli.lower() in satir.lower():
                        ihlaller.append(("SECRET_SCAN", f"{yol}:{satir_no}", f"allowlist dizesi {gizli[:24]}"))
            for satir_no, uyeleri in cihaz_yolu_tara(metin, must_not):
                ihlaller.append(("DEVICE_PATH", f"{yol}:{satir_no}", f"cihaz yolu {uyeleri}"))

        if yol.endswith(".md"):
            for satir_no, hedef in goreli_link_tara(metin, tam):
                ihlaller.append(("BROKEN_LINK", f"{yol}:{satir_no}", f"hedef yok: {hedef}"))

    return ihlaller


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="origin/main")
    ap.add_argument("--head", default="HEAD")
    ap.add_argument("--files", nargs="*")
    ap.add_argument("--allowlist", default=str(REPO_ROOT / "REPO_TRANSFER_ALLOWLIST.json"))
    ap.add_argument("--json", dest="json_cikti", help="rapor bu yola yazılır")
    args = ap.parse_args()

    izinliste = json.loads(Path(args.allowlist).read_text(encoding="utf-8"))

    if args.files:
        dosyalar = args.files
    else:
        dosyalar = degisen_dosyalar(REPO_ROOT, args.base, args.head)

    ihlaller = denetle(dosyalar, izinliste)

    rapor = {
        "schema_version": "hpa.transfer_gate_report.v1",
        "task": "HP-MISTRAL-REPO-026",
        "base": args.base,
        "head": args.head,
        "taranan_dosya": len(dosyalar),
        "ihlal": len(ihlaller),
        "sonuc": "GECIRDI" if not ihlaller else "BLOKLANDI",
        "ihlaller": [{"tip": t, "yol": y, "detay": d} for t, y, d in ihlaller],
    }

    yaz = json.dumps(rapor, ensure_ascii=False, indent=2)
    if args.json_cikti:
        Path(args.json_cikti).write_text(yaz + "\n", encoding="utf-8")
    print(yaz)

    sys.exit(0 if not ihlaller else 1)


if __name__ == "__main__":
    main()
