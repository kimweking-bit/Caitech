# Course image catalogue

**Authoritative mapping:** `backend/courses/data/course_image_manifest.json`  
**DB field:** `courses.Course.image` (ImageField → `media/course_thumbnails/official/{source_id}.webp`)  
**Frontend public mirror:** `frontend/public/images/courses/official/{source_id}.webp`  
**Resolver:** `frontend/lib/content/course-images.ts` → `resolveCourseImage()`

## Inventory (verified)

| Metric | Value |
| --- | --- |
| Official source document entries | 111 |
| Eligible / synced official courses | 108 |
| Excluded source entries | 3 |
| Distinct assigned covers | 108 |
| Duplicate SHA-256 hashes | 0 |
| Typical WebP size | ~18–39 KB (avg ~26 KB) |
| Dimensions | 1280×800 (16:10) |

### Exclusions (from official catalogue sync)

| Source id | Title | Reason |
| --- | --- | --- |
| arch-bim-05 | Building Information Modelling (BIM) Coordination and Clash Detection | Duplicate of arch-bim-04 |
| arch-bim-06 | BIM for Facility Management and Asset Lifecycle | Duplicate of arch-bim-04 |
| qs-01 | Quantity Surveying Fundamentals and Measurement | Superseded / ineligible per sync policy |

## Provenance

- **Source:** purpose-created CAITECH generative covers (Pillow)
- **Provider:** `tools/course_images/generate_and_assign.py`
- **Licence:** All rights reserved — created for CAITECH Global Institute commercial website use
- **Uniqueness:** SHA-256 per file; validation via `tools/course_images/validate_manifest.py`

## Regeneration

```bash
python tools/course_images/generate_and_assign.py          # skip existing
python tools/course_images/generate_and_assign.py --force  # regenerate all
python tools/course_images/make_fallbacks.py
python tools/course_images/validate_manifest.py
```

After assignment, official covers are also mirrored under `frontend/public/images/courses/official/` so the Next.js app can serve them without depending on Django media in every environment.
