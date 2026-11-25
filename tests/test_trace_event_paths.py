# HP-URGENT-SITE-FINAL-047 K1 — trace_event yol çözümleme sözleşmesi.
# Yetkili geçici dizin: tempfile (TMPDIR) kullanılır; Termux /tmp zorunlu değildir (K6).
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

PROJE = Path(__file__).resolve().parents[1]
SCRIPT = PROJE / "scripts" / "trace_event.py"

PLAYERS = "ID;start;end;action;code;pos_x;pos_y\n" \
          "1;5.0;6.0;Goal kicks (short);Galatasaray - Goal kicks;50.0;50.0\n"
TEAMS = "ID;start;end;code;pos_x;pos_y\n" \
        "9;5.1;6.1;1. Ali (1) - Ball recovery;50.5;49.8\n"
XML = '<?xml version="1.0"?><instances><instance><ID>1</ID>' \
      '<code>Galatasaray - Goal kicks</code><label><group>x</group><text>y</text></label></instance></instances>'


def mac_klasoru(kok):
    d = Path(kok) / "mac-veri"
    d.mkdir()
    (d / "players.csv").write_text(PLAYERS, encoding="utf-8")
    (d / "teams.csv").write_text(TEAMS, encoding="utf-8")
    (d / "MATCH_TEST__PLAYERS__XML.xml").write_text(XML, encoding="utf-8")
    return d


def calistir(*argv):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *argv], capture_output=True, text=True, timeout=120
    )


class TraceEventYolSozlesmesi(unittest.TestCase):
    def test_pozitif_src_ile_tam_kosu(self):
        with tempfile.TemporaryDirectory() as kok:
            src = mac_klasoru(kok)
            r = calistir("--src", str(src))
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertIn("HEDEF OLAY", r.stdout)

    def test_negatif_src_eksik_fail_closed(self):
        r = calistir()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("Kaynak klasoru gerekli", r.stderr + r.stdout)

    def test_negatif_out_desteklenmiyor(self):
        with tempfile.TemporaryDirectory() as kok:
            src = mac_klasoru(kok)
            r = calistir("--src", str(src), "--out", str(Path(kok) / "cikti"))
            self.assertNotEqual(r.returncode, 0)
            self.assertIn("--out desteklenmiyor", r.stderr + r.stdout)

    def test_negatif_gecersiz_src_repo_fallback_yok(self):
        with tempfile.TemporaryDirectory() as kok:
            src = Path(kok) / "bos-klasor"
            src.mkdir()
            r = calistir("--src", str(src))
            self.assertNotEqual(r.returncode, 0)
            self.assertIn("fail-closed", r.stderr + r.stdout)

    def test_negatif_olmayan_src_fail_closed(self):
        with tempfile.TemporaryDirectory() as kok:
            r = calistir("--src", str(Path(kok) / "yok"))
            self.assertNotEqual(r.returncode, 0)
            birlesik = r.stderr + r.stdout
            self.assertIn("--src gecersiz", birlesik)
            self.assertNotIn("content/kaynak-veri", birlesik)


if __name__ == "__main__":
    unittest.main()
