"""Build labelled contact sheets of official course covers for visual QA."""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "backend" / "courses" / "data" / "course_image_manifest.json"
PUBLIC = ROOT / "frontend" / "public" / "images" / "courses" / "official"
OUT_DIR = ROOT / "docs" / "phase3" / "qa"
THUMB_W, THUMB_H = 320, 200
COLS = 6
PAD = 12
LABEL_H = 44


def font(size: int):
    for p in (
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    courses = sorted(m["courses"], key=lambda e: (e.get("category_slug") or "", e["source_id"]))

    f_id = font(14)
    f_title = font(12)
    f_hdr = font(22)

    cell_w = THUMB_W + PAD
    cell_h = THUMB_H + LABEL_H + PAD
    rows = math.ceil(len(courses) / COLS)
    # Split into pages of 36 (6x6) for readability
    per_page = 36
    pages = math.ceil(len(courses) / per_page)

    all_stats = {
        "courses": len(courses),
        "pages": pages,
        "decoded_ok": 0,
        "decode_fail": [],
        "near_identical_pairs": [],
        "page_files": [],
    }

    # Perceptual fingerprint: downscale mean + std of RGB for near-dup detection
    fingerprints: list[tuple[str, tuple]] = []

    for page in range(pages):
        chunk = courses[page * per_page : (page + 1) * per_page]
        n_rows = math.ceil(len(chunk) / COLS)
        sheet_w = COLS * cell_w + PAD
        sheet_h = 56 + n_rows * cell_h + PAD
        sheet = Image.new("RGB", (sheet_w, sheet_h), (245, 248, 252))
        draw = ImageDraw.Draw(sheet)
        draw.rectangle([0, 0, sheet_w, 48], fill=(21, 54, 91))
        draw.text(
            (16, 12),
            f"CAITECH official course covers — page {page + 1}/{pages} ({len(chunk)} of {len(courses)})",
            font=f_hdr,
            fill=(255, 255, 255),
        )

        for i, e in enumerate(chunk):
            r, c = divmod(i, COLS)
            x = PAD + c * cell_w
            y = 56 + r * cell_h
            sid = e["source_id"]
            title = e["title"]
            path = PUBLIC / f"{sid}.webp"
            if not path.exists():
                media = ROOT / "backend" / "media" / e["asset_path"]
                path = media if media.exists() else path
            try:
                im = Image.open(path).convert("RGB")
                im.verify()  # type: ignore[attr-defined]
                im = Image.open(path).convert("RGB")
                all_stats["decoded_ok"] += 1
                # fingerprint
                small = im.resize((16, 10), Image.Resampling.BOX)
                px = list(small.getdata())
                n = len(px)
                means = tuple(sum(p[ch] for p in px) / n for ch in range(3))
                fingerprints.append((sid, means))
                thumb = im.resize((THUMB_W, THUMB_H), Image.Resampling.LANCZOS)
            except Exception as exc:
                all_stats["decode_fail"].append({"id": sid, "error": str(exc)})
                thumb = Image.new("RGB", (THUMB_W, THUMB_H), (180, 40, 40))
                td = ImageDraw.Draw(thumb)
                td.text((12, 80), "DECODE FAIL", font=f_id, fill=(255, 255, 255))

            sheet.paste(thumb, (x, y))
            # label
            draw.rectangle(
                [x, y + THUMB_H, x + THUMB_W, y + THUMB_H + LABEL_H],
                fill=(15, 39, 68),
            )
            draw.text((x + 6, y + THUMB_H + 4), sid[:28], font=f_id, fill=(232, 197, 106))
            # title wrap ~36 chars
            tline = title if len(title) <= 38 else title[:35] + "…"
            draw.text((x + 6, y + THUMB_H + 22), tline, font=f_title, fill=(230, 236, 245))

        out = OUT_DIR / f"course_covers_contact_sheet_p{page + 1}.jpg"
        sheet.save(out, "JPEG", quality=88, optimize=True)
        all_stats["page_files"].append(str(out.relative_to(ROOT)))
        print("wrote", out, out.stat().st_size)

    # Near-duplicate detection on mean RGB distance
    for i in range(len(fingerprints)):
        for j in range(i + 1, len(fingerprints)):
            a, ma = fingerprints[i]
            b, mb = fingerprints[j]
            dist = sum((ma[k] - mb[k]) ** 2 for k in range(3)) ** 0.5
            if dist < 8.0:  # very similar average colour
                all_stats["near_identical_pairs"].append(
                    {"a": a, "b": b, "rgb_dist": round(dist, 2)}
                )

    # Also write a single overview strip of first 24 for quick glance
    overview_n = min(24, len(courses))
    ow = COLS * cell_w + PAD
    oh = 56 + 4 * cell_h + PAD
    overview = Image.new("RGB", (ow, oh), (245, 248, 252))
    od = ImageDraw.Draw(overview)
    od.rectangle([0, 0, ow, 48], fill=(21, 54, 91))
    od.text((16, 12), "CAITECH covers — sample overview (first 24 by category order)", font=f_hdr, fill=(255, 255, 255))
    for i, e in enumerate(courses[:overview_n]):
        r, c = divmod(i, COLS)
        x = PAD + c * cell_w
        y = 56 + r * cell_h
        path = PUBLIC / f"{e['source_id']}.webp"
        im = Image.open(path).convert("RGB").resize((THUMB_W, THUMB_H), Image.Resampling.LANCZOS)
        overview.paste(im, (x, y))
        od.rectangle([x, y + THUMB_H, x + THUMB_W, y + THUMB_H + LABEL_H], fill=(15, 39, 68))
        od.text((x + 6, y + THUMB_H + 4), e["source_id"], font=f_id, fill=(232, 197, 106))
        tline = e["title"] if len(e["title"]) <= 38 else e["title"][:35] + "…"
        od.text((x + 6, y + THUMB_H + 22), tline, font=f_title, fill=(230, 236, 245))
    ov = OUT_DIR / "course_covers_overview_24.jpg"
    overview.save(ov, "JPEG", quality=90, optimize=True)
    all_stats["overview"] = str(ov.relative_to(ROOT))

    report = OUT_DIR / "contact_sheet_report.json"
    report.write_text(json.dumps(all_stats, indent=2), encoding="utf-8")
    print(json.dumps(all_stats, indent=2))


if __name__ == "__main__":
    main()
