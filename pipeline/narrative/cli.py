#!/usr/bin/env python3
"""Narrative CLI — pipeline JSON'dan makale iskeleti üretir.

Kullanım:
    python -m pipeline.narrative.cli \\
        --input public/assets/data/packages/lille-gs-2026-10-21.json \\
        --type mac \\
        --title "Kuzey Fransa'da Verimlilik Dersi" \\
        --slug mac-lille-galatasaray-2026-10-21 \\
        --authorize \\
        --output content/yazilar/mac-lille-galatasaray-2026-10-21.md

    --authorize olmadan çalıştırmak gate'i test eder ama makale üretmez.
"""
import argparse
import sys
from pathlib import Path

from .schema import ArticleType
from .adapter import pipeline_to_article, AdapterError
from .gate import check_publication_gate


def main():
    p = argparse.ArgumentParser(
        prog="narrative",
        description="Pipeline JSON → Makale iskeleti (0-EMIT gate'li)",
    )
    p.add_argument("--input", "-i", required=True, help="Pipeline JSON dosyası")
    p.add_argument("--type", "-t", required=True, choices=[t.value for t in ArticleType])
    p.add_argument("--title", required=True)
    p.add_argument("--slug", required=True)
    p.add_argument("--excerpt", default=None)
    p.add_argument("--output", "-o", default=None, help="Çıktı .md dosyası (yoksa stdout)")
    p.add_argument("--authorize", action="store_true", help="publication_authorized=True")
    p.add_argument("--dry-run", action="store_true", help="Gate kontrolü yap ama üretme")

    args = p.parse_args()
    json_path = Path(args.input)

    if not json_path.exists():
        print(f"✗ Dosya bulunamadı: {json_path}", file=sys.stderr)
        sys.exit(1)

    try:
        if args.dry_run:
            from .adapter import load_match_package
            from .schema import ArticleContract
            ms = load_match_package(json_path)
            contract = ArticleContract(
                article_type=ArticleType(args.type),
                title=args.title,
                slug=args.slug,
                excerpt=args.excerpt,
                date=ms.date,
                match_summary=ms,
                publication_authorized=args.authorize,
            )
            gate = check_publication_gate(contract)
            _print_gate(gate)
            sys.exit(0 if gate else 1)

        markdown, gate = pipeline_to_article(
            json_path=json_path,
            article_type=ArticleType(args.type),
            title=args.title,
            slug=args.slug,
            excerpt=args.excerpt,
            publication_authorized=args.authorize,
        )

        _print_gate(gate)

        if args.output:
            out = Path(args.output)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(markdown, encoding="utf-8")
            print(f"\n✓ Makale iskeleti: {out}")
            print(f"  Viz slotları: {gate.warnings}")
        else:
            print("\n" + "─" * 60)
            print(markdown)

    except AdapterError as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)


def _print_gate(gate):
    status = "✓ GATE PASSED" if gate else "✗ GATE FAILED"
    print(f"\n{'═' * 50}")
    print(f"  {status}")
    print(f"{'═' * 50}")
    if gate.errors:
        for e in gate.errors:
            print(f"  ✗ {e}")
    if gate.warnings:
        for w in gate.warnings:
            print(f"  ⚠ {w}")


if __name__ == "__main__":
    main()
