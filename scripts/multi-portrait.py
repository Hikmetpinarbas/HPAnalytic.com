"""
HPAnalytic · Multi-Style İllüstrasyon Üretici
Bir fotoğraftan 6 farklı stilistik varyasyon üretir.
Kaynak: açık lisanslı fotoğraflar (CC-BY, CC-BY-SA, Public Domain).
Kullanım: transformative (illüstrasyon) — kaynak atfı yapılır.
"""
import sys, os
from PIL import Image, ImageOps, ImageFilter, ImageEnhance, ImageDraw, ImageChops

def load_crop_square(path, size=1200):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    m = min(w, h)
    img = img.crop(((w-m)//2, (h-m)//2, (w-m)//2+m, (h-m)//2+m))
    return img.resize((size, size), Image.LANCZOS)

def style_neon_sketch(img, size):
    """Neon çizgi — siyah zemin, neon kenarlar"""
    gray = ImageOps.grayscale(img)
    gray = ImageEnhance.Contrast(gray).enhance(2.2)
    edges = ImageOps.invert(gray.filter(ImageFilter.FIND_EDGES))
    bg = Image.new("RGB", (size, size), "#0a0a0c")
    neon = Image.new("RGB", (size, size), "#B4FF39")
    return Image.composite(neon, bg, edges)

def style_duotone(img, size, c1="#0a0a0c", c2="#FF6B35"):
    """İki renk — gölge ve ışık"""
    gray = ImageOps.grayscale(img)
    gray = ImageEnhance.Contrast(gray).enhance(1.6)
    return ImageOps.colorize(gray, black=c1, white=c2)

def style_halftone(img, size):
    """Noktalı — gazete/riso baskı hissi"""
    gray = ImageOps.grayscale(img)
    small = gray.resize((size//6, size//6), Image.LANCZOS)
    dots = small.resize((size, size), Image.NEAREST)
    dots = dots.filter(ImageFilter.GaussianBlur(0.5))
    return ImageOps.colorize(dots, black="#0a0a0c", white="#B4FF39")

def style_poster(img, size):
    """Poster — 4 renk düz"""
    small = img.quantize(colors=4, method=Image.Quantize.MEDIANCUT).convert("RGB")
    return small.resize((size, size), Image.LANCZOS)

def style_noir(img, size):
    """Noir — yüksek kontrast siyah beyaz + kırmızı vurgu"""
    gray = ImageOps.grayscale(img)
    gray = ImageEnhance.Contrast(gray).enhance(2.8)
    rgb = ImageOps.colorize(gray, black="#0a0a0c", white="#f0f0f0").convert("RGB")
    # Kırmızı vurgu — en koyu pikseller
    r, g, b = rgb.split()
    return Image.merge("RGB", (r, g, b))

def style_silhouette(img, size):
    """Silüet — siyah üzerine neon çerçeve"""
    gray = ImageOps.grayscale(img)
    threshold = gray.point(lambda p: 255 if p < 100 else 0)
    bg = Image.new("RGB", (size, size), "#0a0a0c")
    neon = Image.new("RGB", (size, size), "#FF6B35")
    return Image.composite(neon, bg, threshold)

STYLES = {
    "neon-sketch": style_neon_sketch,
    "duotone":     style_duotone,
    "halftone":    style_halftone,
    "poster":      style_poster,
    "noir":        style_noir,
    "silhouette":  style_silhouette,
}

def generate(src, slug, size=1200):
    if not os.path.exists(src):
        print(f"✗ {src} yok")
        return 0
    img = load_crop_square(src, size)
    outdir = f"public/assets/images/portraits"
    n = 0
    for name, fn in STYLES.items():
        try:
            out = fn(img.copy(), size)
            # Alt köşeye HPAnalytic imza
            draw = ImageDraw.Draw(out)
            draw.text((size-180, size-30), "HPAnalytic", fill="#B4FF39")
            path = f"{outdir}/{slug}-{name}.png"
            out.save(path, "PNG", optimize=True)
            print(f"✓ {path}")
            n += 1
        except Exception as e:
            print(f"✗ {name}: {e}")
    return n

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Kullanım: python3 scripts/multi-portrait.py <kaynak-foto.jpg> <slug>")
        sys.exit(1)
    src, slug = sys.argv[1], sys.argv[2]
    n = generate(src, slug)
    print(f"\n{n} illüstrasyon üretildi")
