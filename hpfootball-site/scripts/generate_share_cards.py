#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HPAnalytic standart sosyal medya paylasim kartlari.

Her mac icin iki sabit sablondan (yatay + dikey) iki goruntu uretir:
  - <slug>-1200x630.jpg  -> og:image / twitter:image (Twitter, WhatsApp, Facebook link onizlemesi)
  - <slug>-1080x1920.jpg -> Instagram/TikTok Hikaye & WhatsApp Durumu icin indirilebilir gorsel

Arka plan gorselleri degismez (kullanicinin sectigi iki tablo); her mac icin degisen
tek sey ustune binen metin (takimlar, skor, kanca cumlesi). Boylece "standart kart"
sistemi: yeni bir mac eklenince MATCHES listesine bir satir eklenir, script tekrar
calistirilir, iki boyut da otomatik uretilir. Yeni illustrasyon/kapak gorseli
siparis edilmez (standing kural); ayni iki sablon tekrar tekrar kullanilir.

Calistirma:
  python3 scripts/generate_share_cards.py            # tum maclar
  python3 scripts/generate_share_cards.py <slug>      # tek mac
"""
import sys
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'scripts', 'assets')
BG_LANDSCAPE = os.path.join(ASSETS, 'share-cards', 'bg-landscape.jpg')
BG_PORTRAIT = os.path.join(ASSETS, 'share-cards', 'bg-portrait.jpg')
FONT_DIR = os.path.join(ASSETS, 'fonts')
OUT_DIR = os.path.join(ROOT, 'public', 'og')

F_SERIF_BOLD = os.path.join(FONT_DIR, 'Newsreader-Bold.ttf')
F_SERIF_SEMI = os.path.join(FONT_DIR, 'Newsreader-SemiBold.ttf')
F_SERIF_REG = os.path.join(FONT_DIR, 'Newsreader-Regular.ttf')
F_MONO_SEMI = os.path.join(FONT_DIR, 'PlexMono-SemiBold.ttf')
F_MONO_MED = os.path.join(FONT_DIR, 'PlexMono-Medium.ttf')
# Newsreader/Plex Mono's "latin" subset omits ş/Ş/ğ/Ğ/İ (they live in a separate "latin-ext" file).
# Rather than font-merge two subset files (composite-glyph dependency hell), these three cover the
# rare Turkish-only glyphs: glyph-for-glyph lookup falls back to them only where it's missing.
F_FALLBACK_SERIF_BOLD = os.path.join(FONT_DIR, 'Fallback-SerifBold.ttf')
F_FALLBACK_SERIF_REG = os.path.join(FONT_DIR, 'Fallback-SerifRegular.ttf')
F_FALLBACK_MONO = os.path.join(FONT_DIR, 'Fallback-MonoBold.ttf')
TURKISH_ONLY = set('şŞğĞİ')

# Club tokens, same values as src/styles/global.css [data-club="..."] (colour policy: no red on Fenerbahce).
CLUBS = {
    'fenerbahce': {'amber': (255, 211, 26), 'tint': (6, 17, 42), 'ink': (245, 243, 234)},
    'galatasaray': {'amber': (242, 183, 5), 'tint': (18, 7, 7), 'ink': (246, 241, 232)},
    'besiktas': {'amber': (242, 242, 242), 'tint': (5, 5, 5), 'ink': (246, 241, 232)},
}

# Tek kaynak: mac verisi. Yeni bir mac eklerken buraya bir satir eklemek yeterli.
MATCHES = [
    dict(slug='fenerbahce-slavia-prag-2026-10-20', club='fenerbahce', kicker='MAÇ ÖNÜ · UEFA ŞAMPİYONLAR LİGİ',
         home='Fenerbahçe', away='Slavia Prag', score=None,
         hook="Ligin en yoğun ikinci presi, rakip yarıda en az top kazanan takımlardan biriyle karşılaşıyor.",
         foot='20 Ekim 2026 · Şükrü Saracoğlu'),
    dict(slug='lille-galatasaray-2026-10-21', club='galatasaray', kicker='MAÇ ÖNÜ · UEFA ŞAMPİYONLAR LİGİ',
         home='Lille', away='Galatasaray', score=None,
         hook='Turnuvanın en az şut atan iki takımı karşı karşıya.',
         foot='21 Ekim 2026 · Stade Pierre-Mauroy'),
    dict(slug='besiktas-crystal-palace-2026-10-22', club='besiktas', kicker='MAÇ ÖNÜ · UEFA AVRUPA LİGİ',
         home='Beşiktaş', away='Crystal Palace', score=None,
         hook='Beşiktaş topu alacak, Crystal Palace almak istemeyecek.',
         foot='22 Ekim 2026 · Tüpraş Stadı'),
    dict(slug='lille-galatasaray-2026-10-21-mac-sonu', club='galatasaray', kicker='MAÇ SONU · UEFA ŞAMPİYONLAR LİGİ',
         home='Lille', away='Galatasaray', score='2–4',
         hook='Deplasmanda 1-2 geriye düştüler. Sonra yirmi dakikada üç gol buldular.',
         foot='21 Ekim 2026 · Stade Pierre-Mauroy'),
    dict(slug='fenerbahce-slavia-prag-2026-10-20-mac-sonu', club='fenerbahce', kicker='MAÇ SONU · UEFA ŞAMPİYONLAR LİGİ',
         home='Fenerbahçe', away='Slavia Prag', score='2–2',
         hook='11. dakikada 2-0 öndeydiler. Üç dakika kırk saniye sonra her şey değişti.',
         foot='20 Ekim 2026 · Şükrü Saracoğlu'),
]


def seg_length(text, primary, fallback):
    return sum((fallback if ch in TURKISH_ONLY else primary).getlength(ch) for ch in text)


def draw_segmented(draw, xy, text, primary, fallback, fill):
    x, y = xy
    for ch in text:
        font = fallback if ch in TURKISH_ONLY else primary
        draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch)


def wrap(text, primary, fallback, max_width):
    words = text.split()
    lines, cur = [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if seg_length(test, primary, fallback) <= max_width:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def gradient_overlay(size, tint, band_start_ratio, strength=235):
    """Bottom-weighted vertical gradient in the club's own dark tone, for text legibility."""
    w, h = size
    grad = Image.new('L', (1, h), 0)
    start = int(h * band_start_ratio)
    for y in range(h):
        if y < start:
            a = 0
        else:
            a = int(strength * ((y - start) / max(1, h - start)) ** 1.4)
        grad.putpixel((0, y), min(255, a))
    grad = grad.resize((w, h))
    overlay = Image.new('RGBA', size, tint + (0,))
    overlay.putalpha(grad)
    return overlay


def fit_cover(im, target_w, target_h):
    src_ratio = im.width / im.height
    dst_ratio = target_w / target_h
    if src_ratio > dst_ratio:
        new_h = target_h
        new_w = int(new_h * src_ratio)
    else:
        new_w = target_w
        new_h = int(new_w / src_ratio)
    im = im.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return im.crop((left, top, left + target_w, top + target_h))


def draw_card(bg_path, size, m, out_path, *, pad, kicker_size, title_size, hook_size, foot_size,
              band_start_ratio, line_gap_title, line_gap_hook, max_hook_lines, cta=None):
    w, h = size
    club = CLUBS[m['club']]
    base = fit_cover(Image.open(bg_path).convert('RGB'), w, h).convert('RGBA')
    base.alpha_composite(gradient_overlay((w, h), club['tint'], band_start_ratio))
    draw = ImageDraw.Draw(base)

    kicker_font = ImageFont.truetype(F_MONO_SEMI, kicker_size)
    title_font = ImageFont.truetype(F_SERIF_BOLD, title_size)
    hook_font = ImageFont.truetype(F_SERIF_REG, hook_size)
    foot_font = ImageFont.truetype(F_MONO_MED, foot_size)
    fb_mono = ImageFont.truetype(F_FALLBACK_MONO, int(kicker_size * 0.86))
    fb_mono_foot = ImageFont.truetype(F_FALLBACK_MONO, int(foot_size * 0.86))
    fb_serif_bold = ImageFont.truetype(F_FALLBACK_SERIF_BOLD, int(title_size * 0.86))
    fb_serif_reg = ImageFont.truetype(F_FALLBACK_SERIF_REG, int(hook_size * 0.86))

    max_w = w - 2 * pad
    amber = club['amber']
    ink = club['ink']

    # Headline (team names + score, or "vs" for previews), bottom-anchored, built upward.
    if m['score']:
        title = f"{m['home']} {m['score'].split('–')[0]}–{m['score'].split('–')[1]} {m['away']}"
    else:
        title = f"{m['home']} – {m['away']}"
    title_lines = wrap(title, title_font, fb_serif_bold, max_w)

    hook_lines = wrap(m['hook'], hook_font, fb_serif_reg, max_w)[:max_hook_lines]

    # Stack from the bottom up: foot -> hook -> title -> kicker.
    y = h - pad
    foot_text = f"HPANALYTIC.COM · {m['foot']}" if not cta else f"HPANALYTIC.COM · {cta}"
    foot_h = foot_font.getbbox(foot_text)[3]
    y -= foot_h
    foot_y = y
    y -= int(foot_size * 0.9)

    hook_block_h = len(hook_lines) * (hook_size + line_gap_hook)
    y -= hook_block_h
    hook_y = y
    y -= int(hook_size * 0.6)

    title_block_h = len(title_lines) * (title_size + line_gap_title)
    y -= title_block_h
    title_y = y
    y -= int(title_size * 0.5)

    kicker_y = y - kicker_size - 6

    draw_segmented(draw, (pad, kicker_y), m['kicker'], kicker_font, fb_mono, amber + (255,))

    ty = title_y
    for line in title_lines:
        draw_segmented(draw, (pad, ty), line, title_font, fb_serif_bold, ink + (255,))
        ty += title_size + line_gap_title

    hy = hook_y
    for line in hook_lines:
        draw_segmented(draw, (pad, hy), line, hook_font, fb_serif_reg, (223, 219, 210, 255))
        hy += hook_size + line_gap_hook

    draw_segmented(draw, (pad, foot_y), foot_text, foot_font, fb_mono_foot, amber + (210,))

    base.convert('RGB').save(out_path, 'JPEG', quality=90, optimize=True)


def generate(m):
    os.makedirs(OUT_DIR, exist_ok=True)
    landscape_out = os.path.join(OUT_DIR, f"{m['slug']}-1200x630.jpg")
    portrait_out = os.path.join(OUT_DIR, f"{m['slug']}-1080x1920.jpg")

    draw_card(BG_LANDSCAPE, (1200, 630), m, landscape_out,
              pad=56, kicker_size=20, title_size=54, hook_size=23, foot_size=17,
              band_start_ratio=0.42, line_gap_title=4, line_gap_hook=6, max_hook_lines=2)

    draw_card(BG_PORTRAIT, (1080, 1920), m, portrait_out,
              pad=72, kicker_size=30, title_size=76, hook_size=34, foot_size=25,
              band_start_ratio=0.56, line_gap_title=8, line_gap_hook=10, max_hook_lines=3,
              cta='Dosyayı oku')

    print(f"  {m['slug']}")
    print(f"    -> {os.path.relpath(landscape_out, ROOT)}")
    print(f"    -> {os.path.relpath(portrait_out, ROOT)}")


if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else None
    todo = [m for m in MATCHES if target is None or m['slug'] == target]
    if not todo:
        print(f"Bilinmeyen slug: {target}")
        sys.exit(1)
    print(f"{len(todo)} mac icin paylasim karti uretiliyor...")
    for m in todo:
        generate(m)
    print("Bitti.")
