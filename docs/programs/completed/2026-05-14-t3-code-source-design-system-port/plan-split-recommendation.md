---
title: "T3 Code Source Design System Plan Split Recommendation"
summary: "Recommended child ExecPlan split for replacing Ship by Sunday's current visual system with T3 Code."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Creating child ExecPlans under this Program."
  - "Deciding how to split the T3 Code visual-system migration."
---

# T3 Code Source Design System Plan Split Recommendation

## Recommended Split

1. Structural source adoption and doctrine retirement.
2. App foundation: fonts, tokens, dark/light mode, and generated-design override removal.
3. Dependency and primitive API strategy.
4. Shared primitive migration.
5. App shell and protected chrome migration.
6. Protected operational surfaces migration.
7. Public marketing, docs, and blog migration.
8. Tutorials, course, auth, checkout, and edge-surface sweep.
9. Telegram widget visual migration.
10. Generated codebase compiler/template migration.
11. Final visual proof, stale-design cleanup, underscore cleanup, and validation.

## First Slice

The first child ExecPlan should be `Structural source adoption and doctrine retirement`.

It should:

- Update `AGENTS.md`, `apps/web/AGENTS.md`, and docs routing so old `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and design-pack docs are not treated as preserved doctrine.
- Use `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md` as the structural map.
- Preserve useful Next.js route groups such as `(auth)`, `(marketing)`, and `(app)`.
- Target underscore implementation folders such as `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata`.
- Name one small structural proof slice that moves implementation toward T3 Code-style plain modules without changing public URLs.
- Keep visual token/font foundation work as the next slice after the structural contract is corrected.

It should not:

- Implement `packages/codebase-compiler` changes in the first slice.
- Implement `templates/starter-app` changes in the first slice.
- Regenerate `docs/generated` in the first slice.
- Port every primitive in the first slice.
- Rename Next route groups or route files in a way that changes public URLs.
- Perform a repo-wide underscore cleanup in one diff.

## Why This Split

The migration crosses structure, global styling, primitive APIs, route shells, public pages, protected dashboards, package CSS, and generated output. A single ExecPlan would be too broad to prove. The split puts source shape and source truth first, then app foundation, then primitives, then surfaces.

The first slice is intentionally structure-heavy because a token-only pass would preserve the disliked Ship by Sunday app shape. The foundation slice follows once the repo stops pointing agents at old doctrine and underscore implementation folders as the desired architecture.

## Child ExecPlan Requirements

Every child ExecPlan should include:

- `program_id: "t3-code-source-design-system-port"` in frontmatter.
- `planning_brief` pointing at the exact versioned planning brief used.
- A risk classification for touched surfaces.
- A statement identifying whether generated-codebase surfaces are touched in that slice.
- Desktop and mobile visual proof for user-facing UI slices.
- Focused behavior validation for auth, checkout, support, billing, or protected-route surfaces when touched.
