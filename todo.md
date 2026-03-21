# todo

## recent

- **2026-03-20 15:58 EDT** — SEO follow-up: added docs canonical/OG/Twitter metadata helpers, included FAQ schema and docs `lastModified` hints, added browser-smoke + unit regression coverage for rendered metadata/crawl routes, and hardened `/checkout/success` to skip authenticated access preloading when no checkout session is present.
- **2026-03-20 15:56 EDT** — Lesson-key follow-through: repaired stage-unlock repair buttons so they route through canonical lesson keys instead of stale numeric lesson URLs, and refreshed mission-page regression coverage to use lesson-key mission fixtures.
- **2026-03-20 15:51 EDT** — SEO hardening: added root metadata defaults, canonical host resolution, generated `robots.txt` and `sitemap.xml`, app-route social preview images, homepage JSON-LD, and explicit `noindex` coverage for protected/auth/recovery flows. Also fixed a small `components/ui/globe.tsx` typing issue so `bun run build` passes with the new metadata routes.
- **2026-03-20 12:51 EDT** — Curriculum kernel rewrite: centralized lesson order/labels/routes/video attachment in `features/course/lesson/model/curriculum.ts`, moved lesson runtime + Convex state to stable `lessonKey`, switched lesson routes to `/lesson/[lessonKey]`, and aligned mission + footer rail labels with canonical lesson display labels.
- **2026-03-20 12:15 EDT** — Docs sync: documented the access-hydration fix so the starter now describes server-fetched initial product-access/mission data, Clerk-gated live Convex queries after hydration, and the `Unauthorized`-during-load troubleshooting path.
- **2026-03-20 12:03 EDT** — Docs sync: updated repo setup/docs/tooling references to match the Bun migration, removed active `pnpm`/`eslint` guidance from runtime docs and CI, and aligned QA helper instructions with `bun run` / `bunx`.
- **2026-03-20 11:10 EDT** — Docs sync: updated `README.md` and public builder docs to match the new generic `product access` model, the shared protected route-group layout in `app/(app)/layout.tsx`, and the Convex `access` subsystem (`convex/access.ts`, `productAccessGrants`, `viewerProductAccess`).
- **2025-03-20** — Artifacts UI (shadcn-only): `artifacts-block-section` → ItemGroup/Item/Card; `artifact-preview-content` → Label/Separator/CardDescription + `artifact-preview-gallery-grid` (AspectRatio+Card). Added tracked `components/ui/aspect-ratio.tsx` (was missing from repo).
- **omit from this land**: mass asset/PDF deletions, `public/` image deletions, `tsconfig.json` format-only diff, untracked bulk `components/ui/*` and other features — not part of artifacts work.

## follow-ups

- Restore or reconcile deleted `assets/` + `public/course/build-guide-images` if unintended local cleanup.
