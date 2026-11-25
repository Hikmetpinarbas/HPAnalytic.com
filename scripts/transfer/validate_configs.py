"""Transfer hazırlık yapılandırma dosyalarının tutarlılık denetimi (HP-MISTRAL-REPO-026).

Şu dosyaları yükler ve aralarındaki referans bütünlüğünü denetler:
- REPO_TRANSFER_ALLOWLIST.json (desenler derlenebilir olmalı)
- REPO_TRANSFER_MANIFEST.schema.json
- REPO_MODULE_MAP.json (hedef kökler repoda var; id benzersiz)
- DEPENDENCY_MATRIX.json (katmanlar modül haritasıyla tutarlı)
- TRANSFER_ACCEPTANCE_REPORT.json (şema sürümü sabiti)

Kullanım: python3 scripts/transfer/validate_configs.py
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

ZORUNLU_CONFIG = [
    "REPO_TRANSFER_ALLOWLIST.json",
    "REPO_TRANSFER_MANIFEST.schema.json",
    "REPO_MODULE_MAP.json",
    "DEPENDENCY_MATRIX.json",
    "TRANSFER_ACCEPTANCE_REPORT.json",
]

KATMANLAR_TR = {"veri", "bilim", "gorsel", "editoryal", "otonomi", "guvenlik-kalite", "site", "test"}


def hatalar(repo=REPO_ROOT):
    hatalar = []
    yuklenen = {}
    for ad in ZORUNLU_CONFIG:
        yol = repo / ad
        if not yol.exists():
            hatalar.append(f"{ad}: zorunlu yapılandırma dosyası yok")
            continue
        try:
            yuklenen[ad] = json.loads(yol.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            hatalar.append(f"{ad}: geçersiz JSON ({e})")
    if any(ad not in yuklenen for ad in ZORUNLU_CONFIG):
        return hatalar

    izinliste = yuklenen["REPO_TRANSFER_ALLOWLIST.json"]
    schema = yuklenen["REPO_TRANSFER_MANIFEST.schema.json"]
    harita = yuklenen["REPO_MODULE_MAP.json"]
    matris = yuklenen["DEPENDENCY_MATRIX.json"]
    rapor = yuklenen["TRANSFER_ACCEPTANCE_REPORT.json"]

    for desen in (izinliste["allow"]["paths"] + izinliste["deny"]["paths"]
                  + izinliste.get("existing_whitelisted_exceptions", {}).get("paths", [])):
        if not isinstance(desen, str) or not desen.strip():
            hatalar.append(f"ALLOWLIST: boş/geçersiz desen '{desen}'")
        else:
            degis = desen.replace("**/", "\0a").replace("**", ".*").replace("\0a", "(?:.*/)?")
            degis = degis.replace("*", "[^/]*").replace("?", "[^/]")
            try:
                re.compile(degis)
            except re.error as e:
                hatalar.append(f"ALLOWLIST: desen derlenemedi '{desen}' ({e})")

    if schema.get("$id") != "hpa.repo_transfer_manifest.v1":
        hatalar.append("SCHEMA: $id beklenen değil")

    idler = [m.get("id") for m in harita.get("modules", [])]
    if len(idler) != len(set(idler)):
        hatalar.append("MODULE_MAP: module id tekrarlı")
    for modul in harita.get("modules", []):
        if modul.get("layer") not in KATMANLAR_TR:
            hatalar.append(f"MODULE_MAP {modul['id']}: bilinmeyen katman {modul.get('layer')}")
        kok = repo / modul["hedef_kok"]
        if not kok.exists():
            hatalar.append(f"MODULE_MAP {modul['id']}: hedef kök repoda yok {modul['hedef_kok']}")

    for esdeger in MODUL_ESDEGERLERI(harita):
        hedef = repo / esdeger.rstrip("/")
        if not hedef.exists():
            hatalar.append(f"MODULE_MAP: mevcut eşdeğer repoda yok: {esdeger}")

    katman_adi = {l["ad"] for l in matris.get("layerlar", [])}
    eksik = KATMANLAR_TR - katman_adi
    if eksik:
        hatalar.append(f"DEPENDENCY_MATRIX: katman eksik {sorted(eksik)}")

    if rapor.get("schema_version") != "hpa.transfer_acceptance_report.v1":
        hatalar.append("ACCEPTANCE_REPORT: schema_version beklenen değil")

    return hatalar


def MODUL_ESDEGERLERI(harita):
    esdeger_tumu = []
    for modul in harita.get("modules", []):
        for e in modul.get("mevcut_esdegerler", []):
            esdeger_tumu.append(e)
    return esdeger_tumu


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=str(REPO_ROOT))
    args = ap.parse_args()
    h = hatalar(Path(args.repo).resolve())
    rapor = {
        "schema_version": "hpa.config_validation.v1",
        "task": "HP-MISTRAL-REPO-026",
        "kontrol_edilen": len(ZORUNLU_CONFIG),
        "sonuc": "GECERLI" if not h else "GECERSIZ",
        "hatalar": h,
    }
    print(json.dumps(rapor, ensure_ascii=False, indent=2))
    sys.exit(0 if not h else 1)


if __name__ == "__main__":
    main()
