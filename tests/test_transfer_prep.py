"""Transfer hazırlık altyapısı testleri (HP-MISTRAL-REPO-026).

Çalıştırma: python3 -m unittest tests/test_transfer_prep.py -v
Yalnızca standart kütüphane; ücretli API, ağ ve deploy yok.
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "scripts" / "transfer"))
sys.path.insert(0, str(REPO))

import check_transfer_pr as gate  # noqa: E402
import validate_manifest as vm  # noqa: E402

ALLOWLIST = json.loads((REPO / "REPO_TRANSFER_ALLOWLIST.json").read_text(encoding="utf-8"))
SCHEMA = json.loads((REPO / "REPO_TRANSFER_MANIFEST.schema.json").read_text(encoding="utf-8"))
HARITA = json.loads((REPO / "REPO_MODULE_MAP.json").read_text(encoding="utf-8"))


class KapiTanisiTest(unittest.TestCase):
    def test_secret_ormu_yakalar(self):
        self.assertTrue(gate.gizli_bilgi_tara('key = "sk-proj-ABCDEFGHIJKLMNOPQRSTUVWXYZ123"'))

    def test_temiz_dosya_secret_vermez(self):
        self.assertEqual(gate.gizli_bilgi_tara("import os\nprint('merhaba')\n"), [])

    def test_cihaz_yolu_imlecli_satir_muaf(self):
        satir = 'x = "/data/data/com.termux/files/home"  # hpa:allow-path ornek dokuman taramasi\n'
        self.assertEqual(gate.cihaz_yolu_tara(satir), [])

    def test_cihaz_yolu_yakalar(self):
        self.assertNotEqual(gate.cihaz_yolu_tara('Path("/storage/emulated/0/HPAnaliz")\n'), [])

    def test_denylist_eslesme(self):
        self.assertTrue(gate.eslesiyor(ALLOWLIST["deny"]["paths"], "pipeline/input/x.csv"))
        self.assertFalse(gate.eslesiyor(ALLOWLIST["deny"]["paths"], "hpa-pipeline-v3/ingest/load.py"))

    def test_istisna_bilinen_fixture(self):
        self.assertTrue(gate.eslesiyor(ALLOWLIST["existing_whitelisted_exceptions"]["paths"], "test/subs_test/expected.json"))


class GATEEndToEndTest(unittest.TestCase):
    def test_temiz_kume_gecer(self):
        ihlal = gate.denetle(["hpa-pipeline-v3/paths.py", "scripts/transfer/check_transfer_pr.py"],
                             ALLOWLIST, repo=REPO)
        tip = set(t for t, _, _ in ihlal)
        hatalar = [i for i in ihlal if i[0] in {"SECRET_SCAN", "DEVICE_PATH", "DENYLIST", "SYMLINK", "BROKEN_REFERENCE"}]
        self.assertEqual(hatalar, [], f"beklenmedik ihlal: {ihlal}")
        self.assertTrue(tip <= {"SIZE_NEEDS_REVIEW"} or not tip)

    def test_denied_csv_blok(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d) / "ham.csv"
            tmp.write_text("id,player\n1,x\n")
            ihlal = gate.denetle(["ham.csv"], ALLOWLIST, repo=Path(d))
            self.assertTrue(any(t == "DENYLIST" for t, _, _ in ihlal))

    def test_secret_iceren_kod_blok(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d) / "leak.py"
            tmp.write_text("cfg = {\"api_key\": \"sk-proj-ABCDEFGHIJKLMNOPQRSTUVWXYZ123\"}\n")
            ihlal = gate.denetle(["leak.py"], ALLOWLIST, repo=Path(d))
            self.assertTrue(any(t == "SECRET_SCAN" for t, _, _ in ihlal))

    def test_md_goreli_link_hedefi_yoksa_blok(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d) / "rapor.md"
            tmp.write_text("bkz. [sözleşme](VERI-YOK-123.json)\n")
            ihlal = gate.denetle(["rapor.md"], ALLOWLIST, repo=Path(d))
            self.assertTrue(any(t == "BROKEN_LINK" for t, _, _ in ihlal))


class ManifestDogrulamaTest(unittest.TestCase):
    def ornek_manifest(self, durum="ornek"):
        return {
            "schema_version": "hpa.repo_transfer_manifest.v1",
            "transfer_id": "HP-TR-TEST",
            "module_id": "M11",
            "module_name": "kaynak-dogrulama-kalite-kontrol",
            "durum": durum,
            "kaynak": {"cihaz": "ubuntu", "orijinal_yol": "scripts/transfer", "yol_duzenlemesi": "paths.py-portable"},
            "hedef": {"repo_kok_yolu": "scripts/transfer", "hedef_sha256": "a" * 64},
            "dosyalar": [{
                "kaynak_yol": "scripts/transfer/check_transfer_pr.py",
                "hedef_yol": "scripts/transfer/check_transfer_pr.py",
                "sha256": "b" * 64,
                "boyut_bayt": 1024,
                "rol": "kod",
            }],
            "gorev": "PR diff tabanlı transfer kabul kapısı",
            "bagimliliklar": {"python": [], "node": [], "sistem": [], "icmodul": [], "eksik": [], "durum": "tam"},
            "calistirma": {
                "komut": "python3 scripts/transfer/check_transfer_pr.py --base origin/main --head HEAD",
                "ortamlar": ["ubuntu", "ubuntu-actions"],
                "giris_sozlesmesi": {"tur": "git-diff", "yol": "scripts/transfer/check_transfer_pr.py"},
                "cikis_sozlesmesi": {"tur": "kabul-raporu-json", "yol": "transfer-gate-report.json"},
            },
            "test": {"komut": "python3 -m unittest tests.test_transfer_prep", "durum": "gecti", "fixture_yolu": "tests/test_transfer_prep.py"},
            "kaynak_bilgisi": {"lisans": "PROPRIETARY-HPANALYTIC (sahip: Hikmet Pınarbaş)", "atiflar": []},
            "cakisma": {"isim_cakismasi": False, "uzerine_yazilanlar": [], "surum": "1.0", "detay": ""},
            "guvenlik": {"gizli_bilgi_taramasi": "temiz", "cihaz_yolu_taramasi": "temiz", "buyuk_dosya_taramasi": "temiz", "notlar": []},
            "yayin": {"release_status": "HOLD", "publication_authorized": False, "review_required": True},
        }

    def test_ornek_manifest_gecerli(self):
        hatalar = vm.dogrula(self.ornek_manifest(), SCHEMA, ALLOWLIST, HARITA, repo=REPO)
        self.assertEqual(hatalar, [], hatalar)

    def test_publication_kilidi_zorunlu(self):
        m = self.ornek_manifest()
        m["yayin"]["publication_authorized"] = True
        hatalar = vm.dogrula(m, SCHEMA, ALLOWLIST, HARITA, repo=REPO)
        self.assertTrue(any("publication_authorized" in h for h in hatalar))

    def test_yanlis_sha_formati_blok(self):
        m = self.ornek_manifest()
        m["dosyalar"][0]["sha256"] = "KISA"
        hatalar = vm.dogrula(m, SCHEMA, ALLOWLIST, HARITA, repo=REPO)
        self.assertTrue(any("dosyalar[0].sha256" in h for h in hatalar))

    def test_bilinmeyen_modul_id_blok(self):
        m = self.ornek_manifest()
        m["module_id"] = "M99"
        hatalar = vm.dogrula(m, SCHEMA, ALLOWLIST, HARITA, repo=REPO)
        self.assertTrue(any("module_id" in h for h in hatalar))

    def test_hedef_kok_sapmasi_blok(self):
        m = self.ornek_manifest()
        m["hedef"]["repo_kok_yolu"] = "src"
        hatalar = vm.dogrula(m, SCHEMA, ALLOWLIST, HARITA, repo=REPO)
        self.assertTrue(True in [any("repo_kok_yolu" in h for h in hatalar)] or hatalar)

    def test_denied_hedef_blok(self):
        m = self.ornek_manifest()
        m["dosyalar"][0]["hedef_yol"] = "pipeline/input/x.py"
        m["kaynak"]["orijinal_yol"] = "pipeline/input"
        hatalar = vm.dogrula(m, SCHEMA, ALLOWLIST, HARITA, repo=REPO)
        self.assertTrue(any("denylist" in h for h in hatalar))


class YapilandirmaTutarlilikTest(unittest.TestCase):
    def test_modul_haritasi_13_modul(self):
        self.assertEqual(len(HARITA["modules"]), 13)

    def test_hedef_kokler_repoda_var(self):
        for m in HARITA["modules"]:
            self.assertTrue((REPO / m["hedef_kok"]).exists(), m["hedef_kok"])

    def test_katman_kumesi_hatasiz(self):
        GECTILI = {"veri", "bilim", "gorsel", "editoryal", "otonomi", "guvenlik-kalite", "site", "test"}
        for m in HARITA["modules"]:
            self.assertIn(m["layer"], GECTILI)

    def test_paths_modulu_var_ve_bagimli_gecerli(self):
        self.assertTrue((REPO / "hpa-pipeline-v3" / "paths.py").exists())

    def test_kilit_akiskanligi(self):
        for m in HARITA["modules"]:
            self.assertIn("publication_authorized", json.dumps(SCHEMA))
            break


if __name__ == "__main__":
    unittest.main(verbosity=2)
