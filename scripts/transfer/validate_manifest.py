"""Transfer manifest doğrulayıcı (HP-MISTRAL-REPO-026).

REPO_TRANSFER_MANIFEST.schema.json alt kümesini dış bağımlılık olmadan uygular:
required, const, enum, pattern, type, minItems, minLength, additionalProperties:false,
nested object/array. Ek kurallar: SHA-256 formatı, göreli repo yolu (.. yok),
REPO_MODULE_MAP.json'da modül kimliği, REPO_TRANSFER_ALLOWLIST.json hedef uyumu,
durum=tasindi ise dosyaların varlığı ve --verify ile gerçek SHA-256 eşleşmesi.

Kullanım:
    python3 scripts/transfer/validate_manifest.py REPO_TRANSFER_MANIFEST.example.json \
        --allowlist REPO_TRANSFER_ALLOWLIST.json --module-map REPO_MODULE_MAP.json [--verify]
"""
from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SHA256_RE = re.compile(r"^[a-f0-9]{64}$")


def hata_bul(deger, sema, yol):
    hatalar = []
    if "const" in sema and deger != sema["const"]:
        hatalar.append(f"{yol}: const beklenen {sema['const']!r}, bulunan {deger!r}")
    if "enum" in sema and deger not in sema["enum"]:
        hatalar.append(f"{yol}: enum dışı değer {deger!r}")
    tur = sema.get("type")
    if tur == "object":
        if not isinstance(deger, dict):
            return hatalar + [f"{yol}: object beklenir"]
        props = sema.get("properties", {})
        for gerek in sema.get("required", []):
            if gerek not in deger:
                hatalar.append(f"{yol}.{gerek}: zorunlu alan eksik")
        if sema.get("additionalProperties") is False:
            for anahtar in deger:
                if anahtar not in props:
                    hatalar.append(f"{yol}.{anahtar}: şemada tanımsız alan")
        for anahtar, alt in deger.items():
            if anahtar in props:
                hatalar.extend(hata_bul(alt, props[anahtar], f"{yol}.{anahtar}"))
        return hatalar
    if tur == "array":
        if not isinstance(deger, list):
            return hatalar + [f"{yol}: array beklenir"]
        if len(deger) < sema.get("minItems", 0):
            hatalar.append(f"{yol}: en az {sema['minItems']} öğe gerekli")
        alt = sema.get("items")
        if alt:
            for i, oge in enumerate(deger):
                hatalar.extend(hata_bul(oge, alt, f"{yol}[{i}]"))
        return hatalar
    if tur == "integer" and not (isinstance(deger, int) and not isinstance(deger, bool)):
        hatalar.append(f"{yol}: integer beklenir")
    if tur == "boolean" and not isinstance(deger, bool):
        hatalar.append(f"{yol}: boolean beklenir")
    if tur == "string":
        if not isinstance(deger, str):
            hatalar.append(f"{yol}: string beklenir")
            return hatalar
        if len(deger) < sema.get("minLength", 0):
            hatalar.append(f"{yol}: en az {sema['minLength']} karakter gerekli")
        if "pattern" in sema and not re.search(sema["pattern"], deger):
            hatalar.append(f"{yol}: desene uymuyor ({sema['pattern']})")
    return hatalar


def ozel_kurallar(manifest, repo=REPO_ROOT):
    hatalar = []
    if not SHA256_RE.match(manifest["hedef"]["hedef_sha256"]):
        hatalar.append("hedef.hedef_sha256: geçersiz SHA-256")
    durum = manifest.get("durum", "beklemede")
    for d in manifest["dosyalar"]:
        hedef = Path(d["hedef_yol"])
        if hedef.is_absolute() or ".." in hedef.parts:
            hatalar.append(f"dosyalar.hedef_yol: göreli repo yolu olmalı: {d['hedef_yol']}")
        if durum == "tasindi" and not (repo / hedef).exists():
            hatalar.append(f"dosyalar: taşındı bildirilen dosya repoda yok: {d['hedef_yol']}")
    if manifest["bagimliliklar"]["durum"] == "tam" and manifest["bagimliliklar"]["eksik"]:
        hatalar.append("bagimliliklar: eksik listesi doluysa durum 'eksik-bilgili' olmalı")
    if manifest["yayin"]["release_status"] == "IZIN" and manifest["test"]["durum"] != "gecti":
        hatalar.append("yayin: release_status=IZIN yalnızca test=gecti ile bildirilebilir")
    return hatalar


def ozel_kurallar_izinliste(manifest, izinliste):
    hatalar = []
    deny = izinliste["deny"]["paths"]
    allow = izinliste["allow"]["paths"]
    istisnalar = izinliste.get("existing_whitelisted_exceptions", {}).get("paths", [])
    esik = izinliste["needs_review"].get("size_limit_bytes", 524288)
    for d in manifest["dosyalar"]:
        yol = d["hedef_yol"]
        ifdeny = any(fnmatch.fnmatch(yol, dp) for dp in deny)
        if ifdeny and not any(fnmatch.fnmatch(yol, s) for s in istisnalar):
            hatalar.append(f"dosyalar.hedef_yol: denylist ile çakışıyor: {yol}")
        if not (any(fnmatch.fnmatch(yol, ap) for ap in allow) or any(fnmatch.fnmatch(yol, s) for s in istisnalar)):
            hatalar.append(f"dosyalar.hedef_yol: allowlist dışı (needs-review): {yol}")
        if d["boyut_bayt"] > esik:
            hatalar.append(f"dosyalar: boyut eşiği aşılıyor: {yol} > {esik}")
    return hatalar


def ozel_kurallar_modul_haritasi(manifest, harita):
    idler = {m["id"]: m for m in harita["modules"]}
    if manifest["module_id"] not in idler:
        return [f"module_id: REPO_MODULE_MAP.json'da yok: {manifest['module_id']}"]
    modul = idler[manifest["module_id"]]
    hatalar = []
    if not manifest["hedef"]["repo_kok_yolu"].startswith(modul["hedef_kok"]):
        hatalar.append(
            f"hedef.repo_kok_yolu: modül hedef kökünden sapıyor "
            f"({manifest['hedef']['repo_kok_yolu']} ≠ {modul['hedef_kok']})"
        )
    for d in manifest["dosyalar"]:
        if not d["hedef_yol"].startswith(modul["hedef_kok"]):
            hatalar.append(f"dosyalar.hedef_yol: modül {manifest['module_id']} hedef kökünden sapıyor: {d['hedef_yol']}")
    ic = manifest.get("bagimliliklar", {}).get("icmodul", [])
    for mid in ic:
        if mid not in idler:
            hatalar.append(f"bagimliliklar.icmodul: haritada yok: {mid}")
    return hatalar


def sha256_dosya(yol):
    h = hashlib.sha256()
    with open(yol, "rb") as f:
        for parca in iter(lambda: f.read(65536), b""):
            h.update(parca)
    return h.hexdigest()


def dogrula(manifest, sema, izinliste=None, harita=None, repo=REPO_ROOT, verify=False):
    hatalar = hata_bul(manifest, sema, "manifest")
    if hatalar:
        return hatalar
    hatalar.extend(ozel_kurallar(manifest, repo))
    if izinliste is not None:
        hatalar.extend(ozel_kurallar_izinliste(manifest, izinliste))
    if harita is not None:
        hatalar.extend(ozel_kurallar_modul_haritasi(manifest, harita))
    if verify and manifest.get("durum") == "tasindi":
        for d in manifest["dosyalar"]:
            tam = repo / d["hedef_yol"]
            if tam.exists() and sha256_dosya(tam) != d["sha256"]:
                hatalar.append(f"dosyalar: SHA-256 eşleşmedi ({d['hedef_yol']})")
    return hatalar


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("manifest")
    ap.add_argument("--schema", default=str(REPO_ROOT / "REPO_TRANSFER_MANIFEST.schema.json"))
    ap.add_argument("--allowlist", default=None)
    ap.add_argument("--module-map", dest="module_map", default=None)
    ap.add_argument("--verify", action="store_true")
    args = ap.parse_args()

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    sema = json.loads(Path(args.schema).read_text(encoding="utf-8"))
    izinliste = json.loads(Path(args.allowlist).read_text(encoding="utf-8")) if args.allowlist else None
    harita = json.loads(Path(args.module_map).read_text(encoding="utf-8")) if args.module_map else None

    hatalar = dogrula(manifest, sema, izinliste, harita, repo=REPO_ROOT, verify=args.verify)
    rapor = {
        "schema_version": "hpa.manifest_validation.v1",
        "task": "HP-MISTRAL-REPO-026",
        "manifest": args.manifest,
        "verify": args.verify,
        "sonuc": "GECERLI" if not hatalar else "GECERSIZ",
        "hatalar": hatalar,
    }
    print(json.dumps(rapor, ensure_ascii=False, indent=2))
    sys.exit(0 if not hatalar else 1)


if __name__ == "__main__":
    main()
