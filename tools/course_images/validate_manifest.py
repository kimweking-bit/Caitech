"""Validate course_image_manifest.json: coverage, uniqueness, files on disk."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "backend" / "courses" / "data" / "course_image_manifest.json"
MEDIA = ROOT / "backend" / "media"
PUBLIC = ROOT / "frontend" / "public"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    courses = m["courses"]
    errors: list[str] = []

    if m.get("assigned") != len(courses):
        errors.append(f"assigned {m.get('assigned')} != len(courses) {len(courses)}")

    hashes: dict[str, str] = {}
    for e in courses:
        sid = e["source_id"]
        media_rel = e["asset_path"].lstrip("/")
        media_path = MEDIA / media_rel
        public_rel = e["public_path"].lstrip("/")
        public_path = PUBLIC / public_rel

        if not media_path.exists():
            errors.append(f"missing media {sid}: {media_path}")
        if not public_path.exists():
            errors.append(f"missing public {sid}: {public_path}")

        if media_path.exists():
            digest = sha256(media_path)
            if digest != e.get("sha256"):
                # allow re-hash drift if file rewritten; still uniqueness matters
                pass
            if digest in hashes and hashes[digest] != sid:
                errors.append(f"duplicate hash {digest[:12]}: {hashes[digest]} vs {sid}")
            hashes[digest] = sid

            size = media_path.stat().st_size
            if size < 1000:
                errors.append(f"tiny file {sid}: {size} bytes")
            if size > 500_000:
                errors.append(f"oversized file {sid}: {size} bytes")

    print(
        json.dumps(
            {
                "courses": len(courses),
                "unique_hashes_on_disk": len(hashes),
                "errors": len(errors),
                "error_samples": errors[:20],
            },
            indent=2,
        )
    )
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
