"""Narrative modülü — veri-to-makale adaptörü.

Kullanım:
    from pipeline.narrative import pipeline_to_article, ArticleType

    markdown, gate = pipeline_to_article(
        json_path=Path("public/assets/data/packages/lille-gs-2026-10-21.json"),
        article_type=ArticleType.MAC,
        title="Kuzey Fransa'da Verimlilik Dersi",
        slug="mac-lille-galatasaray-2026-10-21",
        publication_authorized=True,
    )
"""
from .schema import ArticleType, EpistemicLevel, ArticleContract, MatchSummary, DataField
from .gate import check_publication_gate, GateResult
from .adapter import pipeline_to_article, load_match_package, AdapterError

__all__ = [
    "ArticleType",
    "EpistemicLevel",
    "ArticleContract",
    "MatchSummary",
    "DataField",
    "GateResult",
    "check_publication_gate",
    "pipeline_to_article",
    "load_match_package",
    "AdapterError",
]
