"""paths.py taşınabilirlik testleri (HP-MISTRAL-REPO-026).

Çalıştırma: python3 hpa-pipeline-v3/tests/test_paths.py
Dış bağımlılık yok; standart kütüphane.
"""
from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from hpa_pipeline_v3 import paths


class PathsTest(unittest.TestCase):
    def test_repo_root_pipeline_dosyasini_isaret_eder(self):
        self.assertTrue((paths.repo_root() / "hpa-pipeline-v3" / "paths.py").exists())

    def test_varsayilan_girdi_koku_pipeline_input(self):
        temiz = {k: v for k, v in os.environ.items() if k.startswith("HPA_")}
        with mock.patch.dict(os.environ, temiz, clear=True):
            self.assertEqual(paths.girdi_koku(), paths.repo_root() / "pipeline" / "input")
            self.assertEqual(paths.cikti_koku(), paths.repo_root() / "pipeline" / "output")

    def test_hpa_data_root_override(self):
        with mock.patch.dict(os.environ, {"HPA_DATA_ROOT": "/tmp/hpa-deneme"}):
            self.assertEqual(paths.girdi_koku(), Path("/tmp/hpa-deneme/pipeline/input"))

    def test_hpa_data_root_goreli_repo_kokune_cozulur(self):
        with mock.patch.dict(os.environ, {"HPA_DATA_ROOT": "public_data"}):
            self.assertEqual(paths.veri_koku(), paths.repo_root() / "public_data")

    def test_hpa_input_root_override(self):
        with mock.patch.dict(os.environ, {"HPA_INPUT_ROOT": "/data/data/com.termux/files/home/pipeline/input"}):
            self.assertEqual(paths.girdi_koku(), Path("/data/data/com.termux/files/home/pipeline/input"))

    def test_ortam_tespiti(self):
        with mock.patch.dict(os.environ, {"TERMUX_VERSION": "0.118"}):
            self.assertEqual(paths.ortam_tespiti(), "termux")
        with mock.patch.dict(os.environ, {"CI": "true", "GITHUB_ACTIONS": "true"}):
            self.assertEqual(paths.ortam_tespiti(), "ci")

    def test_repo_ici_mi(self):
        self.assertTrue(paths.repo_ici_mi(paths.repo_root() / "public_data"))
        self.assertFalse(paths.repo_ici_mi("/data/data/com.termux/files/home"))

    def test_kendi_kaynagi_cihaz_yolu_sabiti_kullanmaz(self):
        kaynak = (Path(__file__).parent.parent / "paths.py").read_text(encoding="utf-8")
        self.assertNotIn('Path("/data/data/com.termux', kaynak)
        self.assertNotIn("'/data/data/com.termux", kaynak)


if __name__ == "__main__":
    unittest.main(verbosity=2)
