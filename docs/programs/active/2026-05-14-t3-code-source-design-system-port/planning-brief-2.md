---
title: "T3 Code Structural Source Planning Brief 2"
program_id: "t3-code-source-design-system-port"
brief_version: 2
status: "superseded"
summary: "Refresh the next slice around literal T3 Code structure adoption and retirement of old design/frontend doctrine docs."
read_when:
  - "Writing the replacement child ExecPlan after the foundation-only slice was rejected."
  - "Planning T3 Code file-shape, directory-shape, and underscore cleanup work."
---

# T3 Code Structural Source Planning Brief 2

## Slice

Structural source adoption and doctrine retirement.

## Desired Outcome

Stop treating the migration as a token/docs preservation pass. The next child ExecPlan should make T3 Code's repo and app shape the source, then retire or route around Ship by Sunday's current design/frontend doctrine files instead of rewriting them as permanent authorities.

The target is broader than colors, fonts, and primitives. Copy the way T3 Code organizes browser code: plain feature files and directories under `src/components`, `src/hooks`, `src/lib`, `src/routes`, `src/rpc`, `src/environments`, and `src/observability`, with colocated `.logic.ts` and `.test.ts` files where useful. Ship by Sunday's deep App Router private-folder pattern (`_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, `_metadata`) is replacement inventory.

Because Ship by Sunday is still a Next.js app, keep Next-required files and route segments where the framework requires them. Route groups such as `(auth)`, `(marketing)`, and `(app)` are not the cleanup target. Move implementation toward T3 Code-style plain modules and names. Framework constraints are compatibility details, not design or structure source truth.

## Scope

In scope for the replacement child ExecPlan:

- Update `AGENTS.md`, `apps/web/AGENTS.md`, and docs routing that currently force `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, or `docs/ship-by-sunday/design-pack/` as canonical design/frontend doctrine.
- Retire, delete, or convert `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and `docs/ship-by-sunday/design-pack/` so they no longer act as a preserved visual or frontend authority.
- Add a source-map artifact in the Program that maps T3 Code app structure to Ship by Sunday replacement targets.
- Inventory underscore-prefixed implementation directories and file-name patterns in `apps/web/src`, route by route.
- Define a safe rename/move strategy for `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata`.
- Start with a small, validated structural migration slice that proves imports, Next routes, and tests still work after moving one bounded feature area out of underscore folders.
- Keep T3 Code visual foundation work in scope after the structural contract is corrected, not before it.
- Keep generated customer repositories in the broader Program; structural changes there are later-slice work after the tracked app pattern is clear.

Out of scope for the replacement child ExecPlan:

- A repo-wide underscore rename in one unreviewable diff.
- Breaking Next.js required route files or route segment behavior.
- Rewriting every route screen before the structure plan is proven.
- Generated-codebase compiler/template implementation.
- Telegram widget implementation.
- Auth, checkout, billing, and entitlement behavior rewrites beyond import/path updates.

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/research-pass-t3-code-and-current-ui.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/dependency-graph.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/plan-split-recommendation.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md`
- `/Users/bazelrex/Developer/t3code/apps/web/src`
- `/Users/bazelrex/Developer/t3code/apps/web/src/components`
- `/Users/bazelrex/Developer/t3code/apps/web/src/routes`
- `/Users/bazelrex/Developer/t3code/apps/web/src/hooks`
- `/Users/bazelrex/Developer/t3code/apps/web/src/lib`
- `apps/web/src`
- `AGENTS.md`
- `apps/web/AGENTS.md`

## Acceptance

- The replacement child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- The Program explicitly says `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and the old design-pack docs are cleanup targets, not permanent doctrine.
- The Program explicitly includes T3 Code directory/file-shape adoption, including underscore-private-folder cleanup.
- The replacement child plan names one bounded structural migration proof slice and its validation commands.
- T3 Code visual foundation work remains required, but no plan treats old doctrine docs as things to preserve.
- `bun run programs:lint` passes after the Program refresh.

## Watchpoints

- Do not let Next.js compatibility become an excuse to keep Ship by Sunday's `_components` / `_lib` architecture everywhere.
- Do not target `(auth)`, `(marketing)`, `(app)`, or other Next.js route groups merely because they look different from T3 Code.
- Do not delete docs that AGENTS still require without updating those AGENTS references in the same implementation slice.
- Do not perform a repo-wide move without import proof and route-level validation.
- Do not rename route files or route directories in a way that silently changes public URLs.
- Do not drop generated-codebase scope; defer it only until the tracked app structure target is proven.
