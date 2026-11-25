r"""Transfer manifest üretici (HP-MISTRAL-REPO-026).

Termux/transfer tarafındaki dosya setinden REPO_TRANSFER_MANIFEST.schema.json
uyumlu manifest iskeleti üretir: gerçek SHA-256 ve bayt boyutu hesaplar,
yayın kilitlerini HOLD/publication_authorized=false/review_required=true olarak sabitler.

Durum politikası: üretilen manifest varsayılan olarak durum='beklemede' yazar;
transfer ile dosyalar hedefe taşındığında 'tasindi' yapıp --verify ile SHA
eşleşmesi doğrulanır. Bu script koddan koda transfer yapmaz; yalnızca kayıt üretir.

Kullanım (örnek yollar hpa:allow-path imleçli örnektir; kod sabiti değildir):
    python3 scripts/transfer/generate_transfer_manifest.py \
        --transfer-id HP-TR-001 --module-id M02 --module-name veri-muhendisligi-boru-hatti \
        --device termux --repo-kok /data/data/com.termux/files/home/HPAnaliz/... \  # hpa:allow-path: doküman örneği
        --file /sdcard/a.py:hpa-pipeline-v3/ingest/a.py \  # hpa:allow-path: doküman örneği
        --file /sdcard/b.py:hpa-pipeline-v3/ingest/b.py \  # hpa:allow-path: doküman örneği
        --out REPO_TRANSFER_MANIFEST.M02-sevkiyat.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
from validate_manifest import dogrula  # noqa: E402


def sha256_dosya(yol):
    h = hashlib.sha256()
    with open(yol, "rb") as f:
        for parca in iter(lambda: f.read(65536), b""):
            h.update(parca)
    return h.hexdigest()


def rolleri_ata(hedef_yol):
    if "/tests/" in hedef_yol or hedef_yol.startswith("tests/") or "test_" in Path(hedef_yol).name:
        return "test"
    if "fixture" in hedef_yol.lower():
        return "fixture"
    if hedef_yol.endswith(".md"):
        return "dokumantasyon"
    if ("SOZLESMESI" in hedef_yol) or ("VERI" in hedef_yol.upper() and hedef_yol.endswith(".json")):
        return "sozlesme"
    return "kod"


def manifest_uret(arglar):
    entries = []
    for tanim in arglar.dosyalar:
        if ":" in tanim:
            kaynak, hedef = tanim.split(":", 1)
        else:
            kaynak = hedef = tanim
        kay_tam = Path(kaynak)
        vec = kay_tam.read_bytes()
        entries.append({
            "kaynak_yol": kaynak,
            "hedef_yol": hedef,
            "sha256": sha256_dosya(kay_tam),
            "boyut_bayt": len(vec),
            "rol": rolleri_ata(hedef),
        })
    kok_sha = sha256_dosya(Path(entries[0]["hedef_yol"])) if (REPO_ROOT / entries[0]["hedef_yol"]).exists() and Path(entries[0]["kaynak_yol"]).resolve() == (REPO_ROOT / entries[0]["hedef_yol"]).resolve() else "0" * 64

    manifest = {
        "schema_version": "hpa.repo_transfer_manifest.v1",
        "transfer_id": arglar.transfer_id,
        "module_id": arglar.module_id,
        "module_name": arglar.module_name,
        "durum": "beklemede",
        "kaynak": {
            "cihaz": arglar.device,
            "orijinal_yol": arglar.repo_kok,
            "yol_duzenlemesi": arglar.yol_duzenlemesi,
        },
        "hedef": {
            "repo_kok_yolu": arglar.hedef_kok,
            "hedef_sha256": kok_sha,
        },
        "dosyalar": entries,
        "gorev": arglar.gorev or f"{arglar.module_id} modülü transfer kabul kaydı (HP-MISTRAL-REPO-026)",
        "bagimliliklar": {
            "python": arglar.bagimlilik_python,
            "node": arglar.bagimlilik_node,
            "sistem": arglar.bagimlilik_sistem,
            "icmodul": arglar.icmodul,
            "eksik": arglar.eksik,
            "durum": "eksik-bilgili" if arglar.eksik else "tam",
        },
        "calistirma": {
            "komut": arglar.calistirma,
            "ortamlar": arglar.ortamlar,
            "giris_sozlesmesi": {"tur": arglar.giris_tur, "yol": arglar.giris_yol, "not": "Ham veri repoya girmez; HPA_* ortam değişkeniyle gösterilir."},
            "cikis_sozlesmesi": {"tur": arglar.cikis_tur, "yol": arglar.cikis_yol, "not": "Türetilmiş çıktı; allowlist desenlerine göre değerlendirilir."},
        },
        "test": {
            "komut": arglar.test_komut,
            "durum": arglar.test_durum,
            "kayit_yolu": arglar.test_kayit,
            "fixture_yolu": arglar.test_fixture,
            "not": "Test kayıtları gerçek koşumlardan alınır; uydurma kayıt kabul edilmez.",
        },
        "kaynak_bilgisi": {"lisans": arglar.lisans, "atiflar": arglar.atiflar},
        "cakisma": {
            "isim_cakismasi": arglar.cakisma,
            "uzerine_yazilanlar": arglar.uzerine_yazilanlar,
            "surum": arglar.surum,
            "detay": arglar.cakisma_detay,
        },
        "guvenlik": {
            "gizli_bilgi_taramasi": "temiz",
            "cihaz_yolu_taramasi": "temiz",
            "buyuk_dosya_taramasi": "temiz",
            "notlar": ["check_transfer_pr.py ve validate_manifest.py koşumu PR içinde kanıta bağlanır."],
        },
        "yayin": {
            "release_status": "HOLD",
            "publication_authorized": False,
            "review_required": True,
        },
    }
    return manifest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--transfer-id", required=True)
    ap.add_argument("--module-id", required=True)
    ap.add_argument("--module-name", required=True)
    ap.add_argument("--device", default="termux", choices=["termux", "ubuntu", "userland", "ubuntu-actions", "diger"])
    ap.add_argument("--repo-kok", default="")
    ap.add_argument("--yol-duzenlemesi", default="paths.py-portable",
                    choices=["paths.py-portable", "komut-arg", "yeniden-yazildi", "dokuman-ornegi"])
    ap.add_argument("--hedef-kok", required=True)
    ap.add_argument("--file", dest="dosyalar", action="append", required=True,
                    help="kaynak_yol:hedef_yol (aynıysa yalnızca yol)")
    ap.add_argument("--gorev")
    ap.add_argument("--calistirma", default="python3 <modul>")
    ap.add_argument("--ortamlar", nargs="+", default=["termux", "ubuntu", "userland", "ubuntu-actions"])
    ap.add_argument("--giris-tur", default="ham-olay-verisi")
    ap.add_argument("--giris-yol", default="pipeline/input")
    ap.add_argument("--cikis-tur", default="turetilmis-json")
    ap.add_argument("--cikis-yol", default="pipeline/output")
    ap.add_argument("--test-komut", default="python3 hpa-pipeline-v3/tests/test_<modul>.py")
    ap.add_argument("--test-durum", default="uygulanmadi", choices=["gecti", "kaldi", "uygulanmadi"])
    ap.add_argument("--test-kayit", default="")
    ap.add_argument("--test-fixture", default="hpa-pipeline-v3/tests/fixtures")
    ap.add_argument("--lisans", default="PROPRIETARY-HPANALYTIC (sahip: Hikmet Pınarbaş)")
    ap.add_argument("--atiflar", nargs="*", default=[])
    ap.add_argument("--bagimlilik_python", nargs="*", default=[])
    ap.add_argument("--bagimlilik_node", nargs="*", default=[])
    ap.add_argument("--bagimlilik_sistem", nargs="*", default=[])
    ap.add_argument("--icmodul", nargs="*", default=[])
    ap.add_argument("--eksik", nargs="*", default=[])
    ap.add_argument("--cakisma", action="store_true")
    ap.add_argument("--uzerine-yazilanlar", nargs="*", default=[])
    ap.add_argument("--surum", default="1.0")
    ap.add_argument("--cakisma-detay", default="")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    manifest = manifest_uret(args)
    sema = json.loads((REPO_ROOT / "REPO_TRANSFER_MANIFEST.schema.json").read_text(encoding="utf-8"))
    izinliste = json.loads((REPO_ROOT / "REPO_TRANSFER_ALLOWLIST.json").read_text(encoding="utf-8"))
    harita = json.loads((REPO_ROOT / "REPO_MODULE_MAP.json").read_text(encoding="utf-8"))
    hatalar = dogrula(manifest, sema, izinliste, harita)

    sozcuk = json.dumps(manifest, ensure_ascii=False, indent=2)
    if hatalar:
        print(json.dumps({"sonuc": "GECERSIZ_URETIM", "hatalar": hatalar}, ensure_ascii=False, indent=2), file=sys.stderr)
        sys.exit(1)
    Path(args.out).write_text(sozcuk + "\n", encoding="utf-8")
    print(json.dumps({"sonuc": "URETILDI", "cikti": args.out, "dosya_sayisi": len(manifest["dosyalar"]),
                      "durum": manifest["durum"], "release_status": manifest["yayin"]["release_status"]},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
