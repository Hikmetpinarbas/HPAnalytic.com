"""Publication gate — 0-EMIT ve fail-closed mantığı.

Veri yoksa veya doğrulanmamışsa makale üretimini REDDEDER.
Sessizce boş alan bırakmak yerine açıkça durdurur.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from .schema import ArticleContract, ArticleType, EpistemicLevel, MatchSummary


@dataclass
class GateResult:
    passed: bool
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)

    def __bool__(self) -> bool:
        return self.passed


def _check_match_data(summary: MatchSummary) -> tuple[list, list]:
    """Maç verisi bütünlük kontrolü."""
    errors = []
    warnings = []

    if not summary.match_id:
        errors.append("match_id boş")
    if not summary.home_team or not summary.away_team:
        errors.append("Takım adları eksik")
    if not summary.date:
        errors.append("Tarih eksik")

    required_fields = [
        ("shots", summary.shots),
        ("goals", summary.goals),
    ]
    for name, df in required_fields:
        if df is None:
            errors.append(f"{name}: veri yok (None)")
        elif not df.is_publishable:
            errors.append(
                f"{name}: publishable değil "
                f"(value={df.value}, epistemic={df.epistemic.value})"
            )

    optional_fields = [
        ("passes", summary.passes),
        ("xg_totals", summary.xg_totals),
        ("possession", summary.possession),
        ("four_phases", summary.four_phases),
        ("pressure", summary.pressure),
        ("shot_map", summary.shot_map),
        ("xg_flow", summary.xg_flow),
        ("player_radar", summary.player_radar),
        ("pass_network", summary.pass_network),
    ]
    for name, df in optional_fields:
        if df is None:
            warnings.append(f"{name}: veri yok, blok atlanacak")
        elif df.epistemic == EpistemicLevel.HYPOTHESIS:
            warnings.append(f"{name}: HYPOTHESIS seviyesinde, claim ceiling düşük")
        elif df.epistemic == EpistemicLevel.UNKNOWN:
            errors.append(f"{name}: epistemic=UNKNOWN, kaynak belirsiz → REJECT")

    if not summary.reconciled:
        warnings.append("Veri reconcile edilmemiş (XLSX cross-check yapılmadı)")

    return errors, warnings


TEMPLATE_REQUIREMENTS = {
    ArticleType.MAC: ["match_summary"],
    ArticleType.SCOUTING: ["match_summary"],
    ArticleType.METRIK: [],
    ArticleType.SEZON: [],
    ArticleType.PORTRE: [],
    ArticleType.KULTUR: [],
    ArticleType.ARTICLES: [],
}


def check_publication_gate(contract: ArticleContract) -> GateResult:
    """Ana kapı: makale üretilebilir mi?

    Fail-closed: şüphe varsa reddet.
    """
    errors = []
    warnings = []

    # 1. Temel kontroller
    if not contract.title:
        errors.append("Başlık boş")
    if not contract.slug:
        errors.append("Slug boş")
    if not contract.date:
        warnings.append("Tarih belirtilmemiş")

    # 2. Explicit rejection kontrolü
    if contract.publication_authorized is False:
        errors.append(
            f"publication_authorized=False → "
            f"{contract.rejection_reason or 'Sebep belirtilmemiş'}"
        )

    # 3. Şablona özel gereksinimler
    reqs = TEMPLATE_REQUIREMENTS.get(contract.article_type, [])
    if "match_summary" in reqs:
        if contract.match_summary is None:
            errors.append(
                f"{contract.article_type.value} şablonu match_summary gerektirir"
            )
        else:
            match_errors, match_warnings = _check_match_data(contract.match_summary)
            errors.extend(match_errors)
            warnings.extend(match_warnings)

    # 4. 0-EMIT: Hiçbir UNKNOWN epistemic alan yayına geçemez
    #    (zaten _check_match_data'da yakalıyoruz, ama burada da explicit)

    return GateResult(
        passed=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )
