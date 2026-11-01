"""Create category + default fallback covers from official assets."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OFF = ROOT / "frontend" / "public" / "images" / "courses" / "official"
MEDIA = ROOT / "backend" / "media" / "course_thumbnails" / "official"
MANIFEST = ROOT / "backend" / "courses" / "data" / "course_image_manifest.json"


def main() -> None:
    OFF.mkdir(parents=True, exist_ok=True)
    for f in MEDIA.glob("*.webp"):
        dest = OFF / f.name
        if not dest.exists():
            shutil.copy2(f, dest)

    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    # Prefer a representative source_id whose prefix matches the discipline
    prefer = {
        "mep-building-services": "mep-",
        "architecture-bim-digital-construction": "arch-bim-",
        "quantity-surveying-cost-management": "qs-",
        "project-management-infrastructure": "pm-",
        "industrial-engineering-automation": "ie-",
        "renewable-energy-sustainability": "re-",
        "engineering-finance-investment": "ef-",
        "corporate-strategy-leadership": "cs-",
    }
    by_list: dict[str, list[str]] = {}
    for e in m["courses"]:
        by_list.setdefault(e["category_slug"], []).append(e["source_id"])

    cmap = {
        "mep-building-services": "_cat-mep.webp",
        "architecture-bim-digital-construction": "_cat-bim.webp",
        "quantity-surveying-cost-management": "_cat-qs.webp",
        "project-management-infrastructure": "_cat-infra.webp",
        "industrial-engineering-automation": "_cat-auto.webp",
        "renewable-energy-sustainability": "_cat-energy.webp",
        "engineering-finance-investment": "_cat-finance.webp",
        "corporate-strategy-leadership": "_cat-lead.webp",
    }
    for slug, fn in cmap.items():
        ids = by_list.get(slug) or []
        pref = prefer.get(slug, "")
        sid = next((i for i in ids if i.startswith(pref)), ids[0] if ids else None)
        src = OFF / f"{sid}.webp" if sid else None
        if sid and src and src.exists() and src.stat().st_size > 1000:
            shutil.copy2(src, OFF / fn)
            print("cat", fn, "<-", sid)
        else:
            print("skip", fn, sid)

    img = Image.new("RGB", (1280, 800), (15, 39, 68))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 330, 1280, 470], fill=(196, 154, 58))
    try:
        font = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 42)
    except Exception:
        font = ImageFont.load_default()
    d.text((100, 370), "CAITECH — course cover", font=font, fill=(15, 39, 68))
    img.save(OFF / "_fallback.webp", "WEBP", quality=80)
    print("public assets", len(list(OFF.glob("*.webp"))))


if __name__ == "__main__":
    main()
