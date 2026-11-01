#!/usr/bin/env python3
"""Generate official_catalogue_manifest.json from Phase 3 source inventory."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "backend" / "courses" / "data" / "official_catalogue_manifest.json"
MD = ROOT / "docs" / "phase3" / "OFFICIAL_COURSE_INVENTORY.md"

CATEGORIES = [
    {"id": "mep-building-services", "name": "MEP & Building Services", "slug": "mep-building-services", "display_order": 1},
    {"id": "architecture-bim-digital-construction", "name": "Architecture, BIM & Digital Construction", "slug": "architecture-bim-digital-construction", "display_order": 2},
    {"id": "quantity-surveying-cost-management", "name": "Quantity Surveying & Cost Management", "slug": "quantity-surveying-cost-management", "display_order": 3},
    {"id": "project-management-infrastructure", "name": "Project Management & Infrastructure", "slug": "project-management-infrastructure", "display_order": 4},
    {"id": "industrial-engineering-automation", "name": "Industrial Engineering & Automation", "slug": "industrial-engineering-automation", "display_order": 5},
    {"id": "renewable-energy-sustainability", "name": "Renewable Energy & Sustainability", "slug": "renewable-energy-sustainability", "display_order": 6},
    {"id": "engineering-finance-investment", "name": "Engineering Finance & Investment", "slug": "engineering-finance-investment", "display_order": 7},
    {"id": "corporate-strategy-leadership", "name": "Corporate Strategy & Leadership", "slug": "corporate-strategy-leadership", "display_order": 8},
]

RAW: list[dict] = []


def add(
    sid: str,
    title: str,
    group: str,
    desc: str,
    audience: str | None,
    cat: str,
    num: int,
    *,
    notes: str = "",
    sync: bool = True,
    duplicate_of: str | None = None,
    relation: str | None = None,
) -> None:
    RAW.append(
        {
            "source_id": sid,
            "title": title,
            "source_group": group,
            "description": desc,
            "target_audience": audience,
            "primary_category_id": cat,
            "source_number": num,
            "eligible_for_sync": sync,
            "duplicate_of": duplicate_of,
            "relation": relation,
            "notes": notes,
        }
    )


def slugify(title: str, sid: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    base = base[:72].strip("-")
    return base or sid


def short_desc(desc: str) -> str:
    if len(desc) <= 280:
        return desc
    return desc[:277].rsplit(" ", 1)[0] + "..."


def main() -> None:
    # Import course definitions from sibling module to keep this file short
    from generate_official_manifest_courses import register_all

    register_all(add)

    courses = []
    for e in RAW:
        item = dict(e)
        item["proposed_slug"] = slugify(e["title"], e["source_id"])
        item["short_description"] = short_desc(e["description"] or "")
        courses.append(item)

    eligible = [c for c in courses if c["eligible_for_sync"]]
    excluded = [c for c in courses if not c["eligible_for_sync"]]
    by_cat: dict[str, int] = {}
    for c in eligible:
        by_cat[c["primary_category_id"]] = by_cat.get(c["primary_category_id"], 0) + 1

    manifest = {
        "version": 1,
        "schema": "caitech.official_catalogue.v1",
        "source": {
            "name": "CAITECH Global Institute official corporate course catalogue",
            "provided_in": "Phase 3 assignment body (official course document text)",
            "notes": (
                "Titles, descriptions, and audiences preserved from source wording. "
                "Missing audiences recorded as null."
            ),
        },
        "taxonomy": CATEGORIES,
        "sync_policy": {
            "default": "additive_non_destructive",
            "match_key": "source_id",
            "source_owned_fields": [
                "title",
                "description",
                "short_description",
                "target_audience",
                "category (via primary_category_id)",
                "is_official",
            ],
            "never_overwrite": [
                "price",
                "original_price",
                "currency",
                "seat_capacity",
                "image",
                "is_published",
                "is_free",
                "level",
                "course_type",
                "duration",
                "delivery_modes",
                "intake_status",
                "whatsapp_inquiry_url",
                "instructor",
                "learning_outcomes",
            ],
            "on_create_defaults": {
                "is_published": True,
                "is_free": True,
                "price": "0.00",
                "course_type": "certificate",
                "level": "",
            },
        },
        "stats": {
            "total_source_entries": len(courses),
            "eligible_for_sync": len(eligible),
            "excluded_from_sync": len(excluded),
            "exact_or_near_duplicates_excluded": len(
                [
                    c
                    for c in excluded
                    if c.get("relation") in ("exact_duplicate", "near_duplicate")
                ]
            ),
            "by_primary_category": by_cat,
        },
        "categories": CATEGORIES,
        "courses": courses,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# Phase 3 — Official Course Inventory",
        "",
        "Canonical machine-readable manifest: `backend/courses/data/official_catalogue_manifest.json`",
        "",
        f"- Total source entries: **{len(courses)}**",
        f"- Eligible for automatic sync: **{len(eligible)}**",
        f"- Excluded (duplicates/near-duplicates): **{len(excluded)}**",
        "",
        "## Public taxonomy (8)",
        "",
    ]
    for cat in CATEGORIES:
        lines.append(f"- `{cat['slug']}` — {cat['name']} (order {cat['display_order']})")
    lines += ["", "## Category counts (eligible only)", ""]
    for cat in CATEGORIES:
        lines.append(f"- {cat['name']}: {by_cat.get(cat['id'], 0)}")
    lines += ["", "## Excluded from automatic sync", ""]
    for c in excluded:
        lines.append(
            f"- `{c['source_id']}` — {c['title']} ({c.get('relation')}; "
            f"duplicate_of={c.get('duplicate_of')}) — {c.get('notes', '')}"
        )
    lines += ["", "## All source entries", ""]
    for c in courses:
        aud = c["target_audience"] or "*(not provided in source)*"
        flag = "SYNC" if c["eligible_for_sync"] else "SKIP"
        lines.append(f"### {c['source_id']} [{flag}]")
        lines.append(f"- **Title:** {c['title']}")
        lines.append(f"- **Group:** {c['source_group']} (#{c['source_number']})")
        lines.append(f"- **Primary category:** {c['primary_category_id']}")
        lines.append(f"- **Audience:** {aud}")
        if c.get("relation"):
            lines.append(f"- **Relation:** {c['relation']} → {c.get('duplicate_of')}")
        if c.get("notes"):
            lines.append(f"- **Notes:** {c['notes']}")
        lines.append("")
    MD.parent.mkdir(parents=True, exist_ok=True)
    MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} courses={len(courses)} eligible={len(eligible)}")
    print("by_cat", by_cat)
    print("excluded", [(c["source_id"], c.get("relation")) for c in excluded])


if __name__ == "__main__":
    main()
