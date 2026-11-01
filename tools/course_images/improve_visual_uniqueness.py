"""Re-render official covers with stronger per-course visual differentiation.

Does not change source_id filenames. Updates media + public mirrors + manifest hashes.
Uses sqlite for Course.image path repair (no Django startup cost).
"""
from __future__ import annotations

import hashlib
import json
import math
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Import render pieces by loading generator module path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools" / "course_images"))

# Inline minimal renderer (copy critical bits) to avoid django import from generator
W, H = 1280, 800
WEBP_QUALITY = 80
OUT = ROOT / "backend" / "media" / "course_thumbnails" / "official"
PUB = ROOT / "frontend" / "public" / "images" / "courses" / "official"
MANIFEST = ROOT / "backend" / "courses" / "data" / "course_image_manifest.json"
DB = ROOT / "backend" / "db.sqlite3"

CATEGORY_PALETTES = {
    "mep-building-services": {"c0": (15, 55, 95), "c1": (22, 119, 255), "c2": (180, 140, 40), "motif": "mep", "name": "MEP & Building Services"},
    "architecture-bim-digital-construction": {"c0": (20, 40, 70), "c1": (70, 110, 160), "c2": (200, 170, 90), "motif": "bim", "name": "Architecture, BIM & Digital Construction"},
    "quantity-surveying-cost-management": {"c0": (30, 50, 55), "c1": (40, 100, 110), "c2": (210, 160, 60), "motif": "qs", "name": "Quantity Surveying & Cost Management"},
    "project-management-infrastructure": {"c0": (25, 45, 75), "c1": (35, 90, 150), "c2": (190, 120, 50), "motif": "infra", "name": "Project Management & Infrastructure"},
    "industrial-engineering-automation": {"c0": (18, 30, 48), "c1": (50, 80, 120), "c2": (0, 160, 180), "motif": "auto", "name": "Industrial Engineering & Automation"},
    "renewable-energy-sustainability": {"c0": (12, 50, 45), "c1": (20, 120, 90), "c2": (230, 180, 40), "motif": "energy", "name": "Renewable Energy & Sustainability"},
    "engineering-finance-investment": {"c0": (25, 35, 55), "c1": (45, 75, 130), "c2": (180, 150, 70), "motif": "finance", "name": "Engineering Finance & Investment"},
    "corporate-strategy-leadership": {"c0": (30, 35, 55), "c1": (55, 70, 110), "c2": (200, 160, 50), "motif": "lead", "name": "Corporate Strategy & Leadership"},
}
FALLBACK = {"c0": (21, 54, 91), "c1": (22, 119, 255), "c2": (196, 154, 58), "motif": "generic", "name": "CAITECH"}


def seed_from(s: str) -> int:
    return int(hashlib.sha256(s.encode()).hexdigest()[:8], 16)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def font(size: int):
    for p in (r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def motif(draw, kind, seed, accent):
    if kind == "mep":
        for i in range(6):
            y = 120 + i * 100 + (seed >> i) % 40
            draw.rectangle([80, y, W - 80, y + 18], outline=accent + (180,), width=2)
        for i in range(5):
            x = 160 + i * 220 + (seed % 17)
            draw.line([(x, 100), (x, H - 100)], fill=accent + (160,), width=3)
    elif kind == "bim":
        base_y = 480
        for i in range(8):
            w = 70 + (seed + i * 13) % 50
            h = 90 + (seed + i * 29) % 180
            x = 180 + seed % 40 + i * 110
            y = base_y - h
            draw.rectangle([x, y, x + w, base_y], outline=accent + (210,), width=2)
    elif kind == "qs":
        for r in range(10):
            for c in range(8):
                x0, y0 = 100 + c * 120, 140 + r * 48
                draw.rectangle([x0, y0, x0 + 120, y0 + 48], outline=accent + (150,), width=1)
    elif kind == "infra":
        draw.polygon([(0, H - 40), (W // 2 - 40, 280), (W // 2 + 40, 280), (W, H - 40)], outline=accent + (200,))
        for i in range(12):
            t = i / 12
            y = int(280 + t * (H - 320))
            w = int(40 + t * (W * 0.9))
            x = W // 2 - w // 2
            draw.line([(x, y), (x + w, y)], fill=accent + (160,), width=2)
    elif kind == "auto":
        for i, (cx, cy) in enumerate([(280, 320), (640, 260), (980, 360)]):
            r = 70 + (seed + i * 11) % 40
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent + (210,), width=4)
    elif kind == "energy":
        cx, cy = 200 + seed % 40, 180
        draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=accent + (230,), width=3)
        for i in range(6):
            x = 420 + i * 110
            y = 360 + (i % 2) * 40
            draw.polygon([(x, y + 80), (x + 90, y + 50), (x + 90, y + 10), (x, y + 40)], outline=accent + (210,), width=2)
    elif kind == "finance":
        pts = []
        for i in range(14):
            x = 120 + i * 75
            h = 80 + ((seed >> (i % 8)) + i * 37) % 220
            y1 = H - 120 - h
            draw.rectangle([x, y1, x + 28, H - 140], outline=accent + (200,), width=2)
            pts.append((x + 14, y1))
        if len(pts) > 1:
            draw.line(pts, fill=accent + (220,), width=3)
    elif kind == "lead":
        nodes = [(W // 2, 160), (W // 4, 340), (W // 2, 340), (3 * W // 4, 340), (W // 6, 540), (W // 3, 540), (W // 2, 540), (2 * W // 3, 540), (5 * W // 6, 540)]
        for a, b in [(0, 1), (0, 2), (0, 3), (1, 4), (1, 5), (2, 6), (3, 7), (3, 8)]:
            draw.line([nodes[a], nodes[b]], fill=accent + (170,), width=3)
        for x, y in nodes:
            draw.ellipse([x - 22, y - 22, x + 22, y + 22], outline=accent + (220,), width=3)
    else:
        for i in range(5):
            r = 40 + i * 50
            draw.ellipse([W // 2 - r, H // 2 - r, W // 2 + r, H // 2 + r], outline=accent + (120,), width=2)


def render(source_id: str, title: str, cat_slug: str, cat_name: str) -> Image.Image:
    pal = CATEGORY_PALETTES.get(cat_slug, FALLBACK)
    seed = seed_from(source_id)
    shift = (seed % 40) - 20
    # Stronger per-id hue shift
    c0 = tuple(max(0, min(255, pal["c0"][i] + shift + (seed >> (i * 5)) % 30 - 10)) for i in range(3))
    c1 = tuple(max(0, min(255, pal["c1"][i] + shift // 2 + (seed >> (i * 2)) % 20)) for i in range(3))
    accent = tuple(max(0, min(255, pal["c2"][i] + (seed % 40) - 20)) for i in range(3))

    strip = Image.new("RGB", (2, H))
    sd = ImageDraw.Draw(strip)
    bias = (seed % 50) / 200
    for y in range(H):
        tt = y / H
        tt = tt * tt * (3 - 2 * tt)
        sd.point((0, y), fill=lerp(c0, c1, (tt + bias) % 1.0))
        sd.point((1, y), fill=lerp(c0, c1, (tt + bias + 0.08) % 1.0))
    img = strip.resize((W, H), Image.Resampling.BILINEAR)

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    phase = seed % 11
    step = 18 + (seed % 10)
    for i in range(0, W, step):
        tt = i / W
        col = accent + (int(20 + 50 * abs(math.sin(tt * math.pi + phase))),)
        od.polygon([(i, 0), (i + 140, 0), (i - 30, H), (i - 170, H)], fill=col)
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img, "RGBA")
    motif(draw, pal["motif"], seed, accent)

    # Unique fingerprint shapes
    rng = seed
    for n in range(14):
        rng = (rng * 1103515245 + 12345) & 0x7FFFFFFF
        x = 40 + (rng % (W - 80))
        rng = (rng * 1103515245 + 12345) & 0x7FFFFFFF
        y = 40 + (rng % (H - 220))
        rng = (rng * 1103515245 + 12345) & 0x7FFFFFFF
        r = 10 + (rng % 56)
        col = accent + (50 + (rng % 120),)
        if n % 3 == 0:
            draw.ellipse([x - r, y - r, x + r, y + r], outline=col, width=2 + n % 3)
        elif n % 3 == 1:
            draw.rectangle([x - r, y - r // 2, x + r, y + r // 2], outline=col, width=2)
        else:
            draw.line([(x - r, y), (x + r, y + r // 2)], fill=col, width=3)

    mono = "".join(ch for ch in source_id.upper() if ch.isalnum())[:5] or "CAI"
    mf = font(68)
    mx = 60 + (seed % 720)
    my = 50 + ((seed // 9) % 300)
    draw.text((mx + 2, my + 2), mono, font=mf, fill=(0, 0, 0, 70))
    draw.text((mx, my), mono, font=mf, fill=accent + (100,))

    # Title plate
    draw.rounded_rectangle([48, H - 168, W - 48, H - 40], radius=16, fill=(10, 24, 40, 210))
    draw.rectangle([48, H - 168, 56, H - 40], fill=accent + (255,))
    cat_label = (cat_name or pal["name"]).upper()[:48]
    draw.text((72, H - 152), cat_label, font=font(20), fill=(180, 200, 230, 255))
    words = title.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if len(trial) > 42 and cur:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    ty = H - 118
    for line in lines[:2]:
        draw.text((72, ty), line, font=font(32), fill=(255, 255, 255, 255))
        ty += 38
    draw.text((72, H - 58), "CAITECH GLOBAL INSTITUTE", font=font(16), fill=accent + (255,))
    return img.convert("RGB")


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    PUB.mkdir(parents=True, exist_ok=True)
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    courses = m["courses"]
    hashes: dict[str, str] = {}
    dups = []
    entries = []

    for i, e in enumerate(courses, 1):
        sid = e["source_id"]
        img = render(sid, e["title"], e.get("category_slug") or "", e.get("category_name") or "")
        fname = f"{sid}.webp"
        abs_path = OUT / fname
        img.save(abs_path, "WEBP", quality=WEBP_QUALITY, method=4)
        img.save(PUB / fname, "WEBP", quality=WEBP_QUALITY, method=4)
        digest = sha(abs_path)
        if digest in hashes:
            dups.append({"a": hashes[digest], "b": sid})
        else:
            hashes[digest] = sid
        size = abs_path.stat().st_size
        e2 = dict(e)
        e2.update(
            {
                "asset_path": f"course_thumbnails/official/{fname}",
                "public_path": f"/images/courses/official/{fname}",
                "media_url": f"/media/course_thumbnails/official/{fname}",
                "bytes": size,
                "sha256": digest,
                "status": "assigned",
                "notes": f"Motif={CATEGORY_PALETTES.get(e.get('category_slug') or '', FALLBACK)['motif']}; uniqueness fingerprint + monogram",
                "width": W,
                "height": H,
                "format": "webp",
            }
        )
        entries.append(e2)
        if i % 20 == 0:
            print(f"  {i}/{len(courses)}")

    # sqlite path repair
    if DB.exists():
        con = sqlite3.connect(DB)
        for e in entries:
            con.execute(
                "UPDATE courses_course SET image=? WHERE source_id=?",
                (e["asset_path"], e["source_id"]),
            )
        con.commit()
        con.close()
        print("sqlite image paths updated")

    m["courses"] = entries
    m["assigned"] = len(entries)
    m["unique_assets"] = len(hashes)
    m["duplicate_hashes"] = dups
    m["generated_at"] = datetime.now(timezone.utc).isoformat()
    m["generator"] = "tools/course_images/improve_visual_uniqueness.py"
    MANIFEST.write_text(json.dumps(m, indent=2), encoding="utf-8")
    sizes = [e["bytes"] for e in entries]
    print(
        json.dumps(
            {
                "assigned": len(entries),
                "unique": len(hashes),
                "dups": len(dups),
                "min": min(sizes),
                "max": max(sizes),
                "avg": int(sum(sizes) / len(sizes)),
            },
            indent=2,
        )
    )
    if dups:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
