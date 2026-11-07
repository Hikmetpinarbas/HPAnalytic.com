"""Makale veri şeması — pipeline çıktısı ile makale şablonu arasındaki sözleşme.

Her alan 0-EMIT felsefesine tabidir:
  - Veri varsa ve doğrulanmışsa → kullan
  - Veri yoksa → None (şablon o bloğu atlar)
  - Veri şüpheliyse → epistemic seviyesini düşür, ama uydurma
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class ArticleType(Enum):
    MAC = "mac"
    SCOUTING = "scouting"
    METRIK = "metrik"
    SEZON = "sezon"
    PORTRE = "portre"
    KULTUR = "kultur"
    ARTICLES = "articles"


class EpistemicLevel(Enum):
    """Verinin kaynağına göre epistemik seviye."""
    GROUND_TRUTH = "ground_truth"   # XLSX ham veri, doğrudan sayım
    DERIVED = "derived"             # Pipeline'dan türetilmiş (xG, xT, faz)
    PROXY = "proxy"                 # Dolaylı gösterge
    HYPOTHESIS = "hypothesis"       # Model tahmini, düşük güvenirlik
    UNKNOWN = "unknown"             # Kaynağı belirsiz


@dataclass
class DataField:
    """Tek bir veri noktası + epistemik metadata."""
    value: object
    source: str                             # "xlsx", "csv", "v4_canonical", "manual"
    epistemic: EpistemicLevel = EpistemicLevel.UNKNOWN
    note: Optional[str] = None              # "Reconciled with XLSX ground truth"

    @property
    def is_publishable(self) -> bool:
        return (
            self.value is not None
            and self.epistemic != EpistemicLevel.UNKNOWN
        )


@dataclass
class MatchSummary:
    """Pipeline'ın ürettiği maç özeti — makaleye beslenecek ham malzeme."""
    match_id: str
    home_team: str
    away_team: str
    date: str
    score: Optional[str] = None

    # Temel sayılar — her biri DataField olarak sarılı
    passes: Optional[DataField] = None
    shots: Optional[DataField] = None
    goals: Optional[DataField] = None
    xg_totals: Optional[DataField] = None
    possession: Optional[DataField] = None

    # Derinlik katmanları
    four_phases: Optional[DataField] = None
    pressure: Optional[DataField] = None
    shot_map: Optional[DataField] = None
    xg_flow: Optional[DataField] = None
    player_radar: Optional[DataField] = None
    pass_network: Optional[DataField] = None

    # Provenance
    source_files: dict = field(default_factory=dict)
    reconciled: bool = False


@dataclass
class ArticleContract:
    """Makale üretimi için gerekli minimum sözleşme."""
    article_type: ArticleType
    title: str
    slug: str
    author: str = "Hikmet Pınarbaş"
    excerpt: Optional[str] = None
    date: Optional[str] = None

    # Veri katmanı
    match_summary: Optional[MatchSummary] = None

    # Publication gate
    publication_authorized: bool = False
    rejection_reason: Optional[str] = None

    # Hangi viz blokları aktif
    viz_slots: list = field(default_factory=list)
