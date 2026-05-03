---
title: UI Design System Alignment Planning Brief 2
program_id: ui-design-system-alignment
brief_version: 2
status: current
summary: Write and execute the typography and tracking alignment child ExecPlan across operational app UI.
read_when:
  - Writing the typography and tracking alignment child ExecPlan.
  - Continuing the UI design-system alignment Program after the color slice.
---

# UI Design System Alignment Planning Brief 2

## Planning Context

The first child slice, `docs/exec-plans/completed/2026-05-03-color-token-alignment.md`, promoted the initial semantic app color roles and documented homepage exceptions. The next slice should address typography drift without becoming a homepage redesign or a route-level rewrite.

The detailed audit target is `docs/design-docs/ui-design-library.md`. It says operational UI letter spacing should be `0`, while the current global stylesheet still applies `letter-spacing: -0.02em` on `body`. Root `DESIGN.md` still documents that older global Inter rule, so this slice must reconcile the durable docs and implementation.

The Program packet lives at `docs/programs/active/2026-05-03-ui-design-system-alignment/`.

## Next Plan Recommendation

Exact next plan title: `Typography Tracking Alignment`.

Exact target path: `docs/exec-plans/active/2026-05-03-typography-tracking-alignment.md`.

Exact scope: audit operational typography and tracking usage, reset inherited letter spacing to `0` on app, identity, access-required, and checkout shell boundaries, preserve explicit wordmark, code, number, homepage, docs, blog, and named custom homepage editorial typography, reconcile root `DESIGN.md` with the screenshot-grounded design library, and prove the touched shell routes render with normal tracking in light and dark mode.

Exact implementation boundaries: stay inside app shell, identity shell, access-required shell, checkout success/cancel presentation, root styling/docs, Program docs, and the child ExecPlan. Do not rewrite homepage custom graphics or font treatments, do not normalize every explicit `tracking-tight` heading, do not change copy, product routing, auth, checkout behavior, entitlement, Convex data, provider setup, package dependencies, docs article typography, blog typography, generated customer docs, or marketing section composition.

Exact validation boundaries: run focused tests for touched app shell, identity, checkout, access-required, and integration UI where available. Run `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-03-typography-tracking-alignment.md`, `bun run programs:lint`, markdown lint for the Program and child ExecPlan, `bun run format`, `bun lint`, `bun typecheck`, `git diff --check`, and browser proof for reachable desktop and mobile routes.

## Required Second-Slice Decisions

The child ExecPlan must decide whether to remove global body negative tracking or override it only at operational shell boundaries. Prefer shell-boundary overrides for the first patch so named homepage editorial sections remain visually untouched by this Program slice.

The child ExecPlan must classify explicit tracking utilities before changing them. `tracking-wide`, `tracking-wider`, and `tracking-[...]` are often intentional for wordmarks, all-caps labels, keyboard shortcuts, or mono metadata. `tracking-tight` on app headings can be drift, but it should not be mass-rewritten in the first tracking patch unless a touched shell proves it is wrong.

The child ExecPlan must update root `DESIGN.md` if implementation confirms operational UI should now use normal tracking. The design library already states this, but root `DESIGN.md` is the high-level visual source of truth and should not keep contradicting the implementation.

The child ExecPlan must continue treating the named homepage editorial sections as out of scope even if their font sizes, tracking, typefaces, or section art differ from the app UI design library.

## Success Criteria

The slice succeeds when operational shell boundaries no longer inherit global negative tracking, design docs agree that product UI uses normal tracking, explicit homepage/editorial/wordmark/mono exceptions remain preserved, focused tests and broad gates pass, and browser proof confirms normal app text tracking on reachable desktop and mobile routes.
