# HP-MISTRAL-WAVE1-SITE-01 — fail-closed canli skor ticker fetcher.
# Kural: Gercek ve dogrulanabilir skor yoksa bos/unavailable payload yazilir;
# hicbir skor uydurulmaz ve eskimis veri tekrar yayinlanmaz (fail-closed).
# Kaynak: --source argumani ya da HPA_TICKER_SOURCE ortam degiskeni.
# Kaynak calisma zamani config'idir; token/anahtar repoya girmez.
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = "hpa.live_ticker.v1"
VALID_STATUS = {"scheduled", "live", "final"}
SCORE_RE = __import__("re").compile(r"^-?\d+$")
IDENTITY = {
    "ajans_adi": "Mistral",
    "faz": "WAVE1",
    "gorev_id": "HP-MISTRAL-WAVE1-SITE-01",
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_score(value) -> int | None:
    if value is None:
        return None
    s = str(value).strip()
    if not SCORE_RE.match(s):
        return None
    n = int(s)
    return n if n >= 0 else None


def validate_item(raw) -> dict | None:
    """Gecerli ogeyi normalize eder; ucuryse None doner (fail-closed)."""
    if not isinstance(raw, dict):
        return None
    home, away, status, date = raw.get("home"), raw.get("away"), raw.get("status"), raw.get("date")
    competition = raw.get("competition")
    if not all(isinstance(x, str) and x.strip() for x in (home, away, status)):
        return None
    status = status.strip().lower()
    if status not in VALID_STATUS:
        return None
    if not isinstance(date, str) or not date.strip():
        return None
    try:
        parsed_date = datetime.fromisoformat(date.strip().replace("Z", "+00:00"))
    except ValueError:
        return None
    item = {
        "home": home.strip(),
        "away": away.strip(),
        "status": status,
        "date": parsed_date.date().isoformat(),
        "competition": competition.strip() if isinstance(competition, str) and competition.strip() else "Ma\u00e7",
    }
    if status in ("live", "final"):
        gh = parse_score(raw.get("home_goals"))
        ga = parse_score(raw.get("away_goals"))
        if gh is None or ga is None:
            return None
        item["score"] = f"{gh}-{ga}"
    return item


def parse_items(raw) -> tuple[list[dict], int]:
    if not isinstance(raw, dict) or not isinstance(raw.get("items"), list):
        return [], 0
    items, dropped = [], 0
    for entry in raw["items"]:
        item = validate_item(entry)
        if item is None:
            dropped += 1
        else:
            items.append(item)
    return items, dropped


def build_payload(items: list[dict], available: bool, reason: str, fetched_at: str | None) -> dict:
    return {
        "schema": SCHEMA,
        "available": available,
        "reason": reason,
        "fetched_at": fetched_at,
        "item_count": len(items),
        "publication_authorized": False,
        "olusturan": IDENTITY,
        "items": items,
    }


def unavailable_payload(reason: str) -> dict:
    return build_payload([], False, reason, None)


def fetch_source(url: str, timeout: float = 10.0):
    req = urllib.request.Request(url, headers={"User-Agent": "HPAnalytic-live-ticker/1 (fail-closed)"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        if res.status != 200:
            raise OSError(f"HTTP {res.status}")
        return json.loads(res.read().decode("utf-8"))


def main(argv: list[str] | None = None) -> int:
    import os

    ap = argparse.ArgumentParser(description="Fail-closed canli skor ticker guncelleyici")
    ap.add_argument("--source", default=None, help="JSON kaynak URL (yoksa HPA_TICKER_SOURCE)")
    ap.add_argument("--out", default="public/assets/data/live-ticker.json")
    ap.add_argument("--strict", action="store_true", help="Hatada sifirdan sone koduyla cik")
    args = ap.parse_args(argv)

    source = args.source or os.environ.get("HPA_TICKER_SOURCE", "").strip() or None
    if not source:
        payload = unavailable_payload("NO_SOURCE_CONFIGURED")
        Path(args.out).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("UYARI: kaynak tanimli degil; fail-closed unavailable payload yazildi", file=sys.stderr)
        return 3 if args.strict else 0
    try:
        raw = fetch_source(source)
    except Exception as exc:  # noqa: BLE001 - fail-closed: her hata unavailable uretir
        payload = unavailable_payload("FETCH_FAILED")
        Path(args.out).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"UYARI: cekim basarisiz ({exc}); fail-closed unavailable payload yazildi", file=sys.stderr)
        return 3 if args.strict else 0
    items, dropped = parse_items(raw)
    if not items:
        payload = unavailable_payload("NO_VALID_ITEMS")
    else:
        payload = build_payload(items, True, "OK", utc_now_iso())
    if dropped:
        print(f"UYARI: {dropped} oge dogrulanamadi ve atildi", file=sys.stderr)
    Path(args.out).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"OK ticker: {len(items)} oge, {dropped} atilan")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
