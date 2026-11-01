#!/usr/bin/env python3
"""Generate unique course covers, assign Course.image, write image manifest.

Purpose-created CAITECH covers (Pillow). Project-owned commercial use.
One distinct asset per official course; uniqueness enforced via SHA-256.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.chdir(BACKEND)

import django

django.setup()

from django.core.files import File  # noqa: E402
from courses.models import Course  # noqa: E402

OUT_DIR = BACKEND / "media" / "course_thumbnails" / "official"
MANIFEST_PATH = BACKEND / "courses" / "data" / "course_image_manifest.json"
FRONTEND_PUBLIC = ROOT / "frontend" / "public" / "images" / "courses" / "official"

W, H = 1280, 800
WEBP_QUALITY = 82

CATEGORY_PALETTES = {
    "mep-building-services": {
        "name": "MEP & Building Services",
        "c0": (15, 55, 95),
        "c1": (22, 119, 255),
        "c2": (180, 140, 40),
        "motif": "mep",
    },
    "architecture-bim-digital-construction": {
        "name": "Architecture, BIM & Digital Construction",
        "c0": (20, 40, 70),
        "c1": (70, 110, 160),
        "c2": (200, 170, 90),
        "motif": "bim",
    },
    "quantity-surveying-cost-management": {
        "name": "Quantity Surveying & Cost Management",
        "c0": (30, 50, 55),
        "c1": (40, 100, 110),
        "c2": (210, 160, 60),
        "motif": "qs",
    },
    "project-management-infrastructure": {
        "name": "Project Management & Infrastructure",
        "c0": (25, 45, 75),
        "c1": (35, 90, 150),
        "c2": (190, 120, 50),
        "motif": "infra",
    },
    "industrial-engineering-automation": {
        "name": "Industrial Engineering & Automation",
        "c0": (18, 30, 48),
        "c1": (50, 80, 120),
        "c2": (0, 160, 180),
        "motif": "auto",
    },
    "renewable-energy-sustainability": {
        "name": "Renewable Energy & Sustainability",
        "c0": (12, 50, 45),
        "c1": (20, 120, 90),
        "c2": (230, 180, 40),
        "motif": "energy",
    },
    "engineering-finance-investment": {
        "name": "Engineering Finance & Investment",
        "c0": (25, 35, 55),
        "c1": (45, 75, 130),
        "c2": (180, 150, 70),
        "motif": "finance",
    },
    "corporate-strategy-leadership": {
        "name": "Corporate Strategy & Leadership",
        "c0": (30, 35, 55),
        "c1": (55, 70, 110),
        "c2": (200, 160, 50),
        "motif": "lead",
    },
}

FALLBACK_PALETTE = {
    "name": "CAITECH",
    "c0": (21, 54, 91),
    "c1": (22, 119, 255),
    "c2": (196, 154, 58),
    "motif": "generic",
}


def _lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _seed_from(source_id: str) -> int:
    return int(hashlib.sha256(source_id.encode()).hexdigest()[:8], 16)


def _font(size: int):
    for p in (
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def _motif_mep(draw, seed, accent):
    for i in range(6):
        y = 120 + i * 100 + (seed >> i) % 40
        draw.rectangle([80, y, W - 80, y + 18], outline=accent + (180,), width=2)
        for x in range(120, W - 100, 140 + (seed % 30)):
            draw.ellipse([x, y - 8, x + 34, y + 26], outline=accent + (200,), width=2)
    for i in range(5):
        x = 160 + i * 220 + (seed % 17)
        draw.line([(x, 100), (x, H - 100)], fill=accent + (160,), width=3)


def _motif_bim(draw, seed, accent):
    base_x, base_y = 180 + seed % 40, 480
    for i in range(8):
        w = 70 + (seed + i * 13) % 50
        h = 90 + (seed + i * 29) % 180
        x = base_x + i * 110
        y = base_y - h
        draw.rectangle([x, y, x + w, base_y], outline=accent + (210,), width=2)
        draw.polygon([(x, y), (x + w // 2, y - 24), (x + w, y)], outline=accent + (180,))
        for wy in range(y + 20, base_y - 20, 28):
            for wx in range(x + 12, x + w - 12, 22):
                draw.rectangle([wx, wy, wx + 10, wy + 14], outline=accent + (140,), width=1)


def _motif_qs(draw, seed, accent):
    left, top = 100, 140
    cols, rows = 8, 10
    cw, rh = 120, 48
    for r in range(rows):
        for c in range(cols):
            x0 = left + c * cw
            y0 = top + r * rh
            draw.rectangle([x0, y0, x0 + cw, y0 + rh], outline=accent + (150,), width=1)
            if (r + c + seed) % 5 == 0:
                draw.rectangle(
                    [x0 + 4, y0 + 4, x0 + cw - 4, y0 + rh - 4], fill=accent + (40,)
                )
    draw.rectangle([80, H - 90, W - 80, H - 70], outline=accent + (200,), width=2)


def _motif_infra(draw, seed, accent):
    draw.polygon(
        [(0, H - 40), (W // 2 - 40, 280), (W // 2 + 40, 280), (W, H - 40)],
        outline=accent + (200,),
    )
    for i in range(12):
        t = i / 12
        y = int(280 + t * (H - 320))
        w = int(40 + t * (W * 0.9))
        x = W // 2 - w // 2
        draw.line([(x, y), (x + w, y)], fill=accent + (160,), width=2)
    for x in (W // 3, 2 * W // 3):
        draw.rectangle([x - 12, 300, x + 12, H - 40], outline=accent + (180,), width=2)


def _motif_auto(draw, seed, accent):
    centers = [(280 + seed % 30, 320), (640, 260), (980, 360)]
    for i, (cx, cy) in enumerate(centers):
        r = 70 + (seed + i * 11) % 40
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent + (210,), width=4)
        for a in range(0, 360, 30):
            rad = math.radians(a + (seed % 15))
            x0 = cx + int((r - 8) * math.cos(rad))
            y0 = cy + int((r - 8) * math.sin(rad))
            x1 = cx + int((r + 18) * math.cos(rad))
            y1 = cy + int((r + 18) * math.sin(rad))
            draw.line([(x0, y0), (x1, y1)], fill=accent + (190,), width=6)
        draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], outline=accent + (220,), width=3)
    draw.line([(200, 600), (420, 380), (620, 420)], fill=accent + (200,), width=8)


def _motif_energy(draw, seed, accent):
    cx, cy = 200 + seed % 40, 180
    draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=accent + (230,), width=3)
    for a in range(0, 360, 20):
        rad = math.radians(a)
        draw.line(
            [
                (cx + int(60 * math.cos(rad)), cy + int(60 * math.sin(rad))),
                (cx + int(95 * math.cos(rad)), cy + int(95 * math.sin(rad))),
            ],
            fill=accent + (200,),
            width=3,
        )
    for i in range(6):
        x = 420 + i * 110
        y = 360 + (i % 2) * 40
        draw.polygon(
            [(x, y + 80), (x + 90, y + 50), (x + 90, y + 10), (x, y + 40)],
            outline=accent + (210,),
            width=2,
        )
    for r in (80, 120, 160):
        draw.arc(
            [900 - r, 200 - r, 900 + r, 200 + r], 200, 340, fill=accent + (180,), width=3
        )


def _motif_finance(draw, seed, accent):
    pts = []
    for i in range(14):
        x = 120 + i * 75
        h = 80 + ((seed >> (i % 8)) + i * 37) % 220
        y1 = H - 120 - h
        up = (i + seed) % 2 == 0
        col = accent + (200,)
        if up:
            draw.rectangle([x, y1, x + 28, H - 140], outline=col, width=2)
        else:
            draw.rectangle(
                [x, y1, x + 28, H - 140], fill=accent + (60,), outline=col, width=2
            )
        draw.line([(x + 14, y1 - 30), (x + 14, H - 120)], fill=col, width=2)
        pts.append((x + 14, y1))
    if len(pts) > 1:
        draw.line(pts, fill=accent + (220,), width=3)


def _motif_lead(draw, seed, accent):
    nodes = [
        (W // 2, 160),
        (W // 4, 340),
        (W // 2, 340),
        (3 * W // 4, 340),
        (W // 6, 540),
        (W // 3, 540),
        (W // 2, 540),
        (2 * W // 3, 540),
        (5 * W // 6, 540),
    ]
    edges = [(0, 1), (0, 2), (0, 3), (1, 4), (1, 5), (2, 6), (3, 7), (3, 8)]
    for a, b in edges:
        draw.line([nodes[a], nodes[b]], fill=accent + (170,), width=3)
    for i, (x, y) in enumerate(nodes):
        r = 28 if i == 0 else 22
        draw.ellipse(
            [x - r, y - r, x + r, y + r], outline=accent + (220,), width=3
        )


def _motif_generic(draw, seed, accent):
    for i in range(5):
        r = 40 + i * 50 + seed % 20
        draw.ellipse(
            [W // 2 - r, H // 2 - r, W // 2 + r, H // 2 + r],
            outline=accent + (120,),
            width=2,
        )


MOTIFS = {
    "mep": _motif_mep,
    "bim": _motif_bim,
    "qs": _motif_qs,
    "infra": _motif_infra,
    "auto": _motif_auto,
    "energy": _motif_energy,
    "finance": _motif_finance,
    "lead": _motif_lead,
    "generic": _motif_generic,
}


def render_cover(
    source_id: str, title: str, category_slug: str, category_name: str
) -> Image.Image:
    pal = CATEGORY_PALETTES.get(category_slug, FALLBACK_PALETTE)
    seed = _seed_from(source_id)
    shift = (seed % 40) - 20
    c0 = tuple(
        max(0, min(255, pal["c0"][i] + shift + (seed >> (i * 3)) % 15))
        for i in range(3)
    )
    c1 = tuple(max(0, min(255, pal["c1"][i] + shift // 2)) for i in range(3))
    accent = tuple(
        max(0, min(255, pal["c2"][i] + (seed % 25) - 12)) for i in range(3)
    )

    # Fast vertical gradient via 2px strip scaled to full size
    strip = Image.new("RGB", (2, H))
    sd = ImageDraw.Draw(strip)
    bias = (seed % 50) / 200
    for y in range(H):
        tt = y / H
        tt = tt * tt * (3 - 2 * tt)
        sd.point((0, y), fill=_lerp(c0, c1, (tt + bias) % 1.0))
        sd.point((1, y), fill=_lerp(c0, c1, (tt + bias + 0.05) % 1.0))
    img = strip.resize((W, H), Image.Resampling.BILINEAR)

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    # Fewer wash bands for speed; still unique via seed phase
    phase = seed % 7
    for i in range(0, W, 24):
        tt = i / W
        col = accent + (int(28 + 40 * abs(math.sin(tt * math.pi + phase))),)
        od.polygon([(i, 0), (i + 160, 0), (i - 20, H), (i - 180, H)], fill=col)
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img, "RGBA")

    MOTIFS.get(pal["motif"], _motif_generic)(draw, seed, accent)

    # Per-course geometric fingerprint (breaks near-duplicate category templates)
    rng = seed
    for n in range(12):
        rng = (rng * 1103515245 + 12345) & 0x7FFFFFFF
        x = 40 + (rng % (W - 80))
        rng = (rng * 1103515245 + 12345) & 0x7FFFFFFF
        y = 40 + (rng % (H - 220))
        rng = (rng * 1103515245 + 12345) & 0x7FFFFFFF
        r = 8 + (rng % 48)
        col = accent + (55 + (rng % 100),)
        if n % 3 == 0:
            draw.ellipse([x - r, y - r, x + r, y + r], outline=col, width=2)
        elif n % 3 == 1:
            draw.rectangle([x - r, y - r // 2, x + r, y + r // 2], outline=col, width=2)
        else:
            draw.line([(x - r, y), (x + r, y + r // 2)], fill=col, width=3)

    # Unique monogram from source_id chars
    mono = "".join(ch for ch in source_id.upper() if ch.isalnum())[:4] or "CAI"
    mf = _font(72)
    # position varies by seed
    mx = 80 + (seed % 700)
    my = 60 + ((seed // 7) % 280)
    draw.text((mx + 2, my + 2), mono, font=mf, fill=(0, 0, 0, 60))
    draw.text((mx, my), mono, font=mf, fill=accent + (90,))

    draw.rounded_rectangle(
        [48, H - 168, W - 48, H - 40], radius=16, fill=(10, 24, 40, 200)
    )
    draw.rectangle([48, H - 168, 56, H - 40], fill=accent + (255,))

    font_sm = _font(22)
    font_title = _font(34)
    font_brand = _font(18)

    cat_label = (category_name or pal["name"]).upper()[:48]
    draw.text((72, H - 152), cat_label, font=font_sm, fill=(180, 200, 230, 255))

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
    lines = lines[:2]
    ty = H - 118
    for line in lines:
        draw.text((72, ty), line, font=font_title, fill=(255, 255, 255, 255))
        ty += 40

    draw.text(
        (72, H - 58),
        "CAITECH GLOBAL INSTITUTE",
        font=font_brand,
        fill=accent + (255,),
    )

    vig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    for i in range(40):
        vd.rectangle(
            [i, i, W - 1 - i, H - 1 - i], outline=(0, 0, 0, int(i * 1.2))
        )
    img = Image.alpha_composite(img.convert("RGBA"), vig).convert("RGB")
    return img


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    FRONTEND_PUBLIC.mkdir(parents=True, exist_ok=True)

    courses = list(
        Course.objects.filter(is_official=True)
        .select_related("category")
        .order_by("id")
    )
    print(f"Official courses: {len(courses)}")

    entries = []
    hashes: dict[str, str] = {}
    duplicates = []
    assigned = 0

    skip_existing = "--force" not in sys.argv

    for c in courses:
        source_id = c.source_id or f"id-{c.id}"
        cat_slug = c.category.slug if c.category else ""
        cat_name = c.category.name if c.category else ""

        fname = f"{source_id}.webp"
        abs_path = OUT_DIR / fname
        pub_path = FRONTEND_PUBLIC / fname

        if skip_existing and abs_path.exists() and abs_path.stat().st_size > 1000 and c.image:
            # Reuse existing asset; still record in manifest
            digest = file_sha256(abs_path)
            if digest in hashes:
                duplicates.append({"a": hashes[digest], "b": source_id, "sha256": digest})
            else:
                hashes[digest] = source_id
            size = abs_path.stat().st_size
            rel_media = f"course_thumbnails/official/{fname}"
            assigned += 1
            motif = CATEGORY_PALETTES.get(cat_slug, FALLBACK_PALETTE)["motif"]
            entries.append({
                "course_id": c.id,
                "source_id": source_id,
                "slug": c.slug,
                "title": c.title,
                "category_slug": cat_slug,
                "category_name": cat_name,
                "asset_path": rel_media,
                "public_path": f"/images/courses/official/{fname}",
                "media_url": f"/media/{rel_media}",
                "alt": f"Cover visual for {c.title} — {cat_name or 'CAITECH course'}",
                "source": "purpose-created",
                "provider": "CAITECH / Pillow generative cover",
                "licence": "All rights reserved — created for CAITECH Global Institute commercial website use",
                "width": W,
                "height": H,
                "format": "webp",
                "bytes": size,
                "sha256": digest,
                "status": "assigned-existing",
                "notes": f"Motif={motif}; reused existing asset",
            })
            if assigned % 20 == 0:
                print(f"  ... {assigned}/{len(courses)}")
            continue

        img = render_cover(source_id, c.title, cat_slug, cat_name)
        img.save(abs_path, "WEBP", quality=WEBP_QUALITY, method=4)
        img.save(pub_path, "WEBP", quality=WEBP_QUALITY, method=4)

        digest = file_sha256(abs_path)
        if digest in hashes:
            duplicates.append(
                {"a": hashes[digest], "b": source_id, "sha256": digest}
            )
        else:
            hashes[digest] = source_id

        size = abs_path.stat().st_size
        rel_media = f"course_thumbnails/official/{fname}"

        # Point ImageField at the stable official path without deleting the
        # file we just wrote (delete() would unlink abs_path when names match).
        rel_name = f"course_thumbnails/official/{fname}"
        # Clear old dated upload copies if different path
        old_name = c.image.name if c.image else ""
        if old_name and old_name.replace("\\", "/") != rel_name:
            try:
                c.image.delete(save=False)
            except Exception:
                pass
        c.image.name = rel_name
        c.save(update_fields=["image"])

        assigned += 1
        motif = CATEGORY_PALETTES.get(cat_slug, FALLBACK_PALETTE)["motif"]
        entries.append(
            {
                "course_id": c.id,
                "source_id": source_id,
                "slug": c.slug,
                "title": c.title,
                "category_slug": cat_slug,
                "category_name": cat_name,
                "asset_path": rel_media,
                "public_path": f"/images/courses/official/{fname}",
                "media_url": f"/media/{rel_media}",
                "alt": f"Cover visual for {c.title} — {cat_name or 'CAITECH course'}",
                "source": "purpose-created",
                "provider": "CAITECH / Pillow generative cover",
                "licence": (
                    "All rights reserved — created for CAITECH Global "
                    "Institute commercial website use"
                ),
                "width": W,
                "height": H,
                "format": "webp",
                "bytes": size,
                "sha256": digest,
                "status": "assigned",
                "notes": f"Motif={motif}; unique seed from source_id",
            }
        )
        if assigned % 20 == 0:
            print(f"  ... {assigned}/{len(courses)}")

    manifest = {
        "version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generator": "tools/course_images/generate_and_assign.py",
        "total_official_courses": len(courses),
        "assigned": assigned,
        "unique_assets": len(hashes),
        "duplicate_hashes": duplicates,
        "quality_targets": {
            "aspect": "16:10",
            "dimensions": f"{W}x{H}",
            "format": "webp",
            "target_bytes": "50-150KB typical",
        },
        "courses": entries,
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    sizes = [e["bytes"] for e in entries]
    print(
        json.dumps(
            {
                "assigned": assigned,
                "unique": len(hashes),
                "duplicates": len(duplicates),
                "bytes_min": min(sizes) if sizes else 0,
                "bytes_max": max(sizes) if sizes else 0,
                "bytes_avg": int(sum(sizes) / len(sizes)) if sizes else 0,
                "manifest": str(MANIFEST_PATH),
            },
            indent=2,
        )
    )
    if duplicates:
        print("ERROR: duplicate image hashes detected", duplicates)
        sys.exit(2)


if __name__ == "__main__":
    main()
