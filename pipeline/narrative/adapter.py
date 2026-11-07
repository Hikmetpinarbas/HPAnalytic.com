"""Data-to-Article adapter — pipeline JSON çıktısını makale frontmatter + body'ye dönüştürür.

Mimari:
  1. Pipeline JSON → ArticleContract (schema.py)
  2. ArticleContract → Gate kontrolü (gate.py)
  3. Gate geçerse → Markdown frontmatter + viz slot'ları
  4. build-yazi.mjs bu Markdown'ı HTML'e dönüştürür (mevcut sistem)

Bu adapter yeni bir render engine DEĞİLDİR.
Mevcut build-yazi.mjs pipeline'ının UPSTREAM'idir.
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import Optional
from .schema import (
    ArticleContract, ArticleType, EpistemicLevel,
    DataField, MatchSummary,
)
from .gate import check_publication_gate, GateResult


# ── Design Token Mapping ──────────────────────────────────────────
# tokens.css'ten türetilmiş — pipeline verisi makaleye aktarılırken
# hangi tipografik ve renk atamalarının yapılacağını belirler.
#
# Bu mapping şimdilik kavramsal: build-yazi.mjs zaten CSS token'larını
# kullanıyor. Adapter'in işi veriyi doğru formatta Markdown'a koymak,
# CSS tarafı mevcut token sistemiyle çalışır.

DESIGN_TOKENS = {
    "fonts": {
        "title": "var(--serif)",       # Newsreader — makale başlığı
        "body": "var(--sans)",         # Hanken Grotesk — gövde metni
        "data": "var(--mono)",         # JetBrains Mono — veri, istatistik, kod
        "viz_label": "var(--mono)",    # JetBrains Mono — grafik etiketleri
    },
    "colors": {
        "primary": "var(--neon)",      # #B4FF39 — vurgu, CTA, ana accent
        "secondary": "var(--orange)",  # #FF6B35 — ikincil vurgu, kicker
        "data_proxy": "var(--proxy)",  # #D4A548 — proxy verisi işareti
        "data_hypo": "var(--hypo)",    # #C44536 — hipotez işareti
        "data_schema": "var(--schema)",# #6B7A99 — şema/yapısal veri
    },
    "type_colors": {
        "mac": "var(--neon)",
        "metrik": "var(--proxy)",
        "portre": "var(--orange)",
        "scouting": "#6B9FE8",
        "kultur": "#9B7BB8",
        "articles": "var(--neon)",
    },
}

# Epistemik seviyeye göre hangi CSS sınıfı atanır
EPISTEMIC_CSS = {
    EpistemicLevel.GROUND_TRUTH: "",                    # Temiz, ek işaret yok
    EpistemicLevel.DERIVED: "data-epistemic='derived'", # Mono font, standart
    EpistemicLevel.PROXY: "data-epistemic='proxy'",     # Sarı (#D4A548) kenarlık
    EpistemicLevel.HYPOTHESIS: "data-epistemic='hypo'", # Kırmızı (#C44536) kenarlık
}


class AdapterError(Exception):
    """Gate'ten geçemeyen makale."""
    def __init__(self, gate_result: GateResult):
        self.gate_result = gate_result
        msg = "MAKALE ÜRETİMİ REDDEDİLDİ:\n" + "\n".join(
            f"  ✗ {e}" for e in gate_result.errors
        )
        if gate_result.warnings:
            msg += "\nUyarılar:\n" + "\n".join(
                f"  ⚠ {w}" for w in gate_result.warnings
            )
        super().__init__(msg)


def load_match_package(json_path: Path) -> MatchSummary:
    """Pipeline JSON çıktısını MatchSummary'ye dönüştür.

    İki format desteklenir:
      1. V4 match_package (gs-fb/match_package.json formatı)
      2. Packages (packages/lille-gs-2026-10-21.json formatı)
    """
    raw = json.loads(json_path.read_text(encoding="utf-8"))

    # Format tespiti
    if "summary" in raw and "metadata" in raw:
        return _from_v4_package(raw)
    elif "match_id" in raw and "metadata" in raw:
        return _from_legacy_package(raw)
    else:
        raise ValueError(f"Tanınmayan JSON formatı: {json_path}")


def _parse_match_id(match_id: str) -> tuple[str, str, str]:
    """match_id'den takım ve tarih çıkar. Örn: 'gs-fb-2026-10-26'."""
    import re
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', match_id)
    date = date_match.group(1) if date_match else ""
    prefix = match_id[:date_match.start()].rstrip("-") if date_match else match_id
    parts = prefix.split("-")
    team_codes = {
        "gs": "Galatasaray", "fb": "Fenerbahce", "bjk": "Besiktas",
        "ts": "Trabzonspor", "lille": "LOSC Lille", "konya": "Konyaspor",
        "konyaspor": "Konyaspor", "aston": "Aston Villa",
    }
    home = team_codes.get(parts[0], parts[0]) if parts else ""
    away = team_codes.get(parts[-1], parts[-1]) if len(parts) > 1 else ""
    return home, away, date


def _from_v4_package(raw: dict) -> MatchSummary:
    """V4 canonical + XLSX ground truth formatı."""
    meta = raw["metadata"]
    summary = raw["summary"]

    match_id = meta["match_id"]
    team = meta.get("team", "")
    home, away, date = _parse_match_id(match_id)
    if team and not home:
        home = team

    ms = MatchSummary(
        match_id=match_id,
        home_team=home,
        away_team=away,
        date=date,
        reconciled=meta.get("shots_reconciled", False),
    )

    if "passes" in summary:
        ms.passes = DataField(
            value=summary["passes"],
            source="xlsx",
            epistemic=EpistemicLevel.GROUND_TRUTH,
            note="XLSX ground truth",
        )
    if "goals" in summary:
        ms.goals = DataField(
            value=summary["goals"],
            source="xlsx",
            epistemic=EpistemicLevel.GROUND_TRUTH,
        )
    if "shots" in summary:
        ms.shots = DataField(
            value=summary["shots"],
            source="xlsx",
            epistemic=EpistemicLevel.GROUND_TRUTH,
        )

    if "four_phases" in raw:
        ms.four_phases = DataField(
            value=raw["four_phases"],
            source="v4_canonical",
            epistemic=EpistemicLevel.DERIVED,
        )
    if "pressure" in raw:
        ms.pressure = DataField(
            value=raw["pressure"],
            source="v4_canonical",
            epistemic=EpistemicLevel.DERIVED,
        )
    if "player_radar" in raw:
        ms.player_radar = DataField(
            value=raw["player_radar"],
            source="v4_canonical",
            epistemic=EpistemicLevel.DERIVED,
            note=raw["player_radar"].get("epistemic", ""),
        )

    ms.source_files = meta

    return ms


def _from_legacy_package(raw: dict) -> MatchSummary:
    """Legacy packages formatı (lille-gs-2026-10-21.json)."""
    meta = raw["metadata"]

    ms = MatchSummary(
        match_id=raw["match_id"],
        home_team=meta.get("home_team", ""),
        away_team=meta.get("away_team", ""),
        date=meta.get("date", ""),
        score=meta.get("score"),
        reconciled=True,  # Legacy paketler zaten reconcile edilmiş
    )

    ms.goals = DataField(
        value={"total": meta.get("goals_total", 0)},
        source="pipeline",
        epistemic=EpistemicLevel.GROUND_TRUTH,
    )
    ms.shots = DataField(
        value={"total": meta.get("shots_total", 0), "on_target": meta.get("on_target", 0)},
        source="pipeline",
        epistemic=EpistemicLevel.GROUND_TRUTH,
    )

    if "players_xg" in raw:
        total_xg = sum(raw["players_xg"].values())
        ms.xg_totals = DataField(
            value={"total": round(total_xg, 2), "by_player": raw["players_xg"]},
            source="xlsx",
            epistemic=EpistemicLevel.DERIVED,
        )

    if "shot_map" in raw:
        ms.shot_map = DataField(
            value=raw["shot_map"],
            source="pipeline",
            epistemic=EpistemicLevel.GROUND_TRUTH,
        )

    if raw.get("xg_flow"):
        ms.xg_flow = DataField(
            value=raw["xg_flow"],
            source="pipeline",
            epistemic=EpistemicLevel.DERIVED,
        )

    ms.source_files = meta.get("source_files", {})

    return ms


def _build_frontmatter(contract: ArticleContract) -> str:
    """Markdown frontmatter bloğu üret."""
    lines = [
        "---",
        f'title: "{contract.title}"',
        f"slug: {contract.slug}",
        f"type: {contract.article_type.value}",
        f'author: "{contract.author}"',
    ]
    if contract.excerpt:
        lines.append(f'excerpt: "{contract.excerpt}"')
    if contract.date:
        lines.append(f"date: {contract.date}")
    if contract.match_summary and contract.match_summary.score:
        lines.append(f"score: {contract.match_summary.score}")
    lines.append("---")
    return "\n".join(lines)


def _build_stat_block(label: str, df: DataField) -> str:
    """Tek bir stat bloğu üret — :::stat VALUE|LABEL|SUB formatında."""
    val = df.value
    if isinstance(val, dict):
        if "total" in val:
            display = str(val["total"])
            sub = ", ".join(f"{k}: {v}" for k, v in val.get("by_team", {}).items())
        else:
            display = json.dumps(val, ensure_ascii=False)
            sub = ""
    else:
        display = str(val)
        sub = ""

    source_tag = f"[{df.source}]" if df.source else ""
    epistemic_tag = ""
    if df.epistemic == EpistemicLevel.PROXY:
        epistemic_tag = " · PROXY"
    elif df.epistemic == EpistemicLevel.HYPOTHESIS:
        epistemic_tag = " · HİPOTEZ"

    return f":::stat {display}|{label}|{sub}{source_tag}{epistemic_tag}"


def _build_viz_slot(viz_type: str, match_id: str) -> str:
    """Vizualizasyon slot'u — build-yazi.mjs'in :::visual bloğuna uyumlu."""
    viz_labels = {
        "shot_map": ("shot-map", "Şut Haritası", "Pozisyonlar ve xG değerleri"),
        "xg_flow": ("xg-flow", "xG Akış Grafiği", "Kümülatif beklenen gol trendi"),
        "pass_network": ("pass-network", "Pas Ağı", "Oyuncu arası pas yoğunlukları"),
        "four_phases": ("four-phases", "Dört Faz", "Hücum-Savunma-Geçiş analizi"),
        "pressure": ("pressure-map", "Baskı Haritası", "PPDA ve baskı bölgeleri"),
        "player_radar": ("player-radar", "Oyuncu Radarı", "Bireysel performans profili"),
    }
    slug, title, note = viz_labels.get(viz_type, (viz_type, viz_type, ""))
    return f":::visual [{slug}] | {title} | {note}\n:::"


def build_article_markdown(contract: ArticleContract) -> str:
    """ArticleContract'tan Markdown makale iskeleti üret.

    NOT: Bu fonksiyon YAZI ÜRETMEZ. Yalnızca:
      1. Frontmatter
      2. Stat blokları (varsa)
      3. Viz slot'ları (varsa)
    oluşturur. Asıl metin ayrı bir süreçle (editör/LLM/insan) yazılır.
    """
    parts = [_build_frontmatter(contract), ""]

    ms = contract.match_summary
    if ms:
        # İstatistik blokları
        stats = []
        if ms.goals and ms.goals.is_publishable:
            stats.append(_build_stat_block("Gol", ms.goals))
        if ms.shots and ms.shots.is_publishable:
            stats.append(_build_stat_block("Şut", ms.shots))
        if ms.passes and ms.passes.is_publishable:
            stats.append(_build_stat_block("Pas", ms.passes))
        if ms.xg_totals and ms.xg_totals.is_publishable:
            stats.append(_build_stat_block("xG", ms.xg_totals))
        if ms.possession and ms.possession.is_publishable:
            stats.append(_build_stat_block("Top Hakimiyeti", ms.possession))

        if stats:
            parts.append(":::stats")
            parts.extend(stats)
            parts.append(":::")
            parts.append("")

        # Viz slotları
        viz_map = {
            "shot_map": ms.shot_map,
            "xg_flow": ms.xg_flow,
            "pass_network": ms.pass_network,
            "four_phases": ms.four_phases,
            "pressure": ms.pressure,
            "player_radar": ms.player_radar,
        }
        for viz_type, df in viz_map.items():
            if df is not None and df.is_publishable:
                parts.append(_build_viz_slot(viz_type, ms.match_id))
                parts.append("")
                contract.viz_slots.append(viz_type)

    # Metin placeholder'ı
    parts.append("<!-- MAKALE METNİ BURAYA YAZILACAK -->")
    parts.append("")
    parts.append("")

    return "\n".join(parts)


def pipeline_to_article(
    json_path: Path,
    article_type: ArticleType,
    title: str,
    slug: str,
    excerpt: Optional[str] = None,
    publication_authorized: bool = False,
) -> tuple[str, GateResult]:
    """Ana giriş noktası: Pipeline JSON → Markdown makale iskeleti.

    Returns:
        (markdown_str, gate_result) — gate geçerse markdown döner,
        geçemezse AdapterError fırlatır.
    """
    # 1. JSON'ı yükle
    match_summary = load_match_package(json_path)

    # 2. Contract oluştur
    contract = ArticleContract(
        article_type=article_type,
        title=title,
        slug=slug,
        excerpt=excerpt,
        date=match_summary.date,
        match_summary=match_summary,
        publication_authorized=publication_authorized,
    )

    # 3. Gate kontrolü
    gate = check_publication_gate(contract)
    if not gate:
        raise AdapterError(gate)

    # 4. Markdown üret
    markdown = build_article_markdown(contract)

    return markdown, gate
