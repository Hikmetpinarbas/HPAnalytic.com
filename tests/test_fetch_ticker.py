# HP-MISTRAL-WAVE1-SITE-01 — fetch_ticker fail-closed birim testleri.
import json
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import fetch_ticker as ft


class ValidateItemTest(unittest.TestCase):
    def test_valid_final_item_with_score(self):
        item = ft.validate_item({
            "home": "A", "away": "B", "status": "final",
            "date": "2026-11-24T18:00:00Z", "home_goals": 2, "away_goals": 1,
            "competition": "UCL",
        })
        self.assertEqual(item["score"], "2-1")
        self.assertEqual(item["status"], "final")
        self.assertEqual(item["date"], "2026-11-24")

    def test_missing_score_on_final_is_dropped(self):
        self.assertIsNone(ft.validate_item({
            "home": "A", "away": "B", "status": "final", "date": "2026-11-24",
        }))

    def test_negative_or_nonnumeric_score_is_dropped(self):
        self.assertIsNone(ft.validate_item({
            "home": "A", "away": "B", "status": "live", "date": "2026-11-24",
            "home_goals": 2, "away_goals": "?",
        }))

    def test_scheduled_item_needs_no_score(self):
        item = ft.validate_item({
            "home": "A", "away": "B", "status": "scheduled", "date": "2026-12-01",
        })
        self.assertNotIn("score", item)

    def test_unknown_status_is_dropped(self):
        self.assertIsNone(ft.validate_item({
            "home": "A", "away": "B", "status": "maybe", "date": "2026-11-24",
        }))

    def test_empty_or_junk_entries_fail_closed(self):
        self.assertIsNone(ft.validate_item(None))
        self.assertIsNone(ft.validate_item("2-1"))
        self.assertIsNone(ft.validate_item({"home": "", "away": "B", "status": "final", "date": "2026-11-24"}))


class ParseItemsTest(unittest.TestCase):
    def test_drops_invalid_and_keeps_valid(self):
        raw = {"items": [
            {"home": "A", "away": "B", "status": "final", "date": "2026-11-24", "home_goals": 1, "away_goals": 0},
            {"home": "X", "status": "final", "date": "2026-11-24", "home_goals": 1, "away_goals": 0},
            "junk",
        ]}
        items, dropped = ft.parse_items(raw)
        self.assertEqual(len(items), 1)
        self.assertEqual(dropped, 2)

    def test_non_dict_payload_fails_closed(self):
        items, dropped = ft.parse_items([1, 2, 3])
        self.assertEqual((items, dropped), ([], 0))


class BuildPayloadTest(unittest.TestCase):
    def test_unavailable_payload_has_no_items_and_null_fetched_at(self):
        payload = ft.unavailable_payload("FETCH_FAILED")
        self.assertFalse(payload["available"])
        self.assertIsNone(payload["fetched_at"])
        self.assertEqual(payload["items"], [])
        self.assertEqual(payload["schema"], "hpa.live_ticker.v1")

    def test_available_payload_stamps_identity(self):
        payload = ft.build_payload([{"home": "A", "away": "B", "status": "scheduled", "date": "2026-12-01"}], True, "OK", ft.utc_now_iso())
        self.assertTrue(payload["available"])
        self.assertEqual(payload["olusturan"]["gorev_id"], "HP-MISTRAL-WAVE1-SITE-01")
        datetime.strptime(payload["fetched_at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


class MainFailClosedTest(unittest.TestCase):
    def test_missing_source_writes_unavailable_seed(self):
        out = Path("/tmp/ticker_test_no_source.json")
        code = ft.main(["--out", str(out)])
        self.assertEqual(code, 0)
        payload = json.loads(out.read_text())
        self.assertFalse(payload["available"])
        self.assertEqual(payload["reason"], "NO_SOURCE_CONFIGURED")

    def test_strict_missing_source_returns_nonzero(self):
        out = Path("/tmp/ticker_test_strict.json")
        code = ft.main(["--out", str(out), "--strict"])
        self.assertEqual(code, 3)
        self.assertIn("NO_SOURCE_CONFIGURED", out.read_text())

    def test_bad_network_fails_closed(self):
        out = Path("/tmp/ticker_test_netfail.json")
        code = ft.main(["--source", "http://127.0.0.1:9/none", "--out", str(out)])
        self.assertEqual(code, 0)
        payload = json.loads(out.read_text())
        self.assertFalse(payload["available"])
        self.assertEqual(payload["reason"], "FETCH_FAILED")


if __name__ == "__main__":
    unittest.main()
