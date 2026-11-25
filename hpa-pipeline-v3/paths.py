"""Taşınabilir yol yapılandırması (HP-MISTRAL-REPO-026).

Termux, Ubuntu, UserLAnd, GitHub Actions ve diğer Linux ortamlarında
tek yapılandırma noktası: hiçbir modül sabit cihaz yolu okumaz,
yol bilgisini buradan alır (REPO_TRANSFER_PLAN.md §4).

Çözümleme sırası: ortam değişkeni (HPA_*) > HPA_DATA_ROOT > repo kökü.
Göreli HPA_* değerleri repo köküne göre çözümlenir.
"""
from __future__ import annotations

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

GEREKLI_HP_ENV = {
    "girdi": "HPA_INPUT_ROOT",
    "cikti": "HPA_OUTPUT_ROOT",
    "kanonik": "HPA_CANONICAL_ROOT",
    "public_data": "HPA_PUBLIC_DATA_ROOT",
}

DEFAULT_YOLLAR = {
    "girdi": ("pipeline", "input"),
    "cikti": ("pipeline", "output"),
    "kanonik": ("public_data", "canonical"),
    "public_data": ("public_data",),
}


def repo_root() -> Path:
    return REPO_ROOT


def veri_koku() -> Path:
    deger = os.environ.get("HPA_DATA_ROOT")
    if not deger:
        return (REPO_ROOT / "public_data").resolve()
    yol = Path(deger).expanduser()
    if yol.is_absolute():
        return yol
    return (REPO_ROOT / yol).resolve()


def _coz(name: str) -> Path:
    deger = os.environ.get(GEREKLI_HP_ENV[name])
    if deger:
        yol = Path(deger).expanduser()
        if yol.is_absolute():
            return yol
        return (veri_koku() / yol).resolve()
    kok = veri_koku() if os.environ.get("HPA_DATA_ROOT") else REPO_ROOT
    return (kok / Path(*DEFAULT_YOLLAR[name])).resolve()


def girdi_koku() -> Path:
    return _coz("girdi")


def cikti_koku() -> Path:
    return _coz("cikti")


def kanonik_koku() -> Path:
    return _coz("kanonik")


def public_data_koku() -> Path:
    return _coz("public_data")


def ortam_tespiti() -> str:
    if os.environ.get("CI") and os.environ.get("GITHUB_ACTIONS"):
        return "ci"
    if os.environ.get("TERMUX_VERSION") or os.environ.get("TERMUX_APP__PACKAGE_NAME"):
        return "termux"
    if os.environ.get("USERLAND_PRODUCT") or os.environ.get("USERLAND_PROFILE"):
        return "userland"
    prefix = os.environ.get("PREFIX", "")
    if prefix and not prefix.startswith("/usr"):
        return "termux"
    if Path("/etc/os-release").exists():
        return "ubuntu"
    return "bilinmeyen"


def repo_ici_mi(yol: str | Path) -> bool:
    try:
        Path(yol).resolve().relative_to(REPO_ROOT)
        return True
    except ValueError:
        return False


CIHAZ_YOLU_ORMUNTUSU = (
    "/data/data/com.termux",  # hpa:allow-path desen tablosu; sabit yol olarak veri okunmaz
    "/storage/emulated",  # hpa:allow-path desen tablosu; sabit yol olarak veri okunmaz
    "/sdcard",  # hpa:allow-path desen tablosu; sabit yol olarak veri okunmaz
    "/root/",  # hpa:allow-path desen tablosu; sabit yol olarak veri okunmaz
    "/home/",  # hpa:allow-path desen tablosu; sabit yol olarak veri okunmaz
)
