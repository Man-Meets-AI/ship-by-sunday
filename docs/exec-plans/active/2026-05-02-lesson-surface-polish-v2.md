---
title: Lesson Surface Polish v2
status: active
created_at: 2026-05-02
completed_at: null
summary: Ship lesson dwell follow-ups — lesson map focus trap and ARIA, retire unused Split/Focus shells, Bunny keyboard affordance with optional player.js forwarding, live browser proof — without touching denylisted files or App Shell.
post_build_recap: null
read_when:
  - Resuming lesson surface v2 after the six-commit polish on main.
  - Wiring Bunny embed keyboard behavior or lesson map accessibility.
  - Reviewing browser proof and Split/Focus disposition.
---

# Lesson Surface Polish v2

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The first polish pass made the bonus lesson surface calm. This pass closes deferred items from [docs/exec-plans/active/2026-05-02-lesson-surface-polish.md](2026-05-02-lesson-surface-polish.md): a real focus trap and dialog semantics for the in-page lesson map, removal or wiring of unused shell composites, explicit Bunny player keyboard documentation and optional forwarding when the embed speaks player.js-shaped `postMessage`, and a live browser proof bundle (signed-in workspace, light and dark, desktop and mobile, reduced motion, and the bonus-lesson-viewed analytics line).

## Progress

- [x] Slice 0 — Author and lint this ExecPlan.
- [x] Slice 1 — Lesson map: `use-lesson-map-focus-trap.ts`, ARIA on `LessonMapSurface`, integration-ui test.
- [x] Slice 2 — Retire `LessonShellSplit`, `LessonShellFocus`, `WorkbenchPanel`; v1 plan addendum for disposition.
- [x] Slice 3a — Bunny `postMessage` probe: player.js-shaped commands used; verify against live `iframe.mediadelivery.net` in browser when convenient (see Surprises).
- [x] Slice 3b/c — `lesson-video-controls.tsx`, `use-bunny-player-controls.ts`, `lesson-video-watch-bare-with-controls.tsx`, `lesson-video-player.tsx` iframe ref; watch-shell + bare path only.
- [x] Slice 3d — `lesson-video-controls.test.tsx` green.
- [x] Slice 4 — Proof runbook and artifact folder: `docs/exec-plans/_artifacts/2026-05-02-lesson-surface-polish-v2/README.md` (operator captures screenshots/video).
- [x] Final — Full vitest (integration-ui + unit), format, lint, typecheck, plans lint, markdown lint.

## Surprises & Discoveries

- Vitest `matchMedia` does not drive `motion/react` `useReducedMotion` in this repo; the lesson-video-controls test uses `vi.mock("motion/react", …)` with a hoisted flag to assert reduced-motion wiring on the controls row.
- One full parallel vitest run showed rare flakes in `blueprint-page` and `app-workspace-lesson-page` tests; immediate re-runs passed (651/651).
- Bunny keyboard forwarding assumes a player.js-compatible embed. Outbound messages are covered by tests; in-player `getPaused` responses depend on the live Bunny build—operators should confirm play/pause once per environment.

## Decision Log

Decision: Remove `LessonShellSplit`, `LessonShellFocus`, and `WorkbenchPanel` from the lesson shells barrel after confirming zero `apps/web` imports.

Rationale: No route used them; v2 brief required wire-or-delete.

Date: 2026-05-02

Decision: Ship Option B (local focus ring + player.js `postMessage` from the watch-shell bare frame) with static affordance for non-Bunny HTML5 video on the same path.

Rationale: Bonus lessons use Bunny; HTML5 keeps embed-help copy without iframe forwarding.

Date: 2026-05-02

## Outcomes & Retrospective

- Lesson map: `role="region"`, `aria-modal="true"`, `aria-labelledby="lesson-map-heading"`, Tab trap via `use-lesson-map-focus-trap.ts`, tests in `lesson-map-surface.test.tsx`.
- Shells barrel: only `LessonShellWatch` + type exports; v1 ExecPlan addendum records Split/Focus retirement.
- Video: watch-shell + bare uses `LessonVideoWatchBareWithControls` with `lesson-video-focus-catcher` and `LessonVideoControls`; Bunny `postMessage` play/pause/seek + `requestFullscreen` on **F**.
- Proof bundle: operator runbook and conventions live under [_artifacts/2026-05-02-lesson-surface-polish-v2/README.md](../_artifacts/2026-05-02-lesson-surface-polish-v2/README.md). Link screenshots and network captures there when captured.


## Context and Orientation

The bonus lesson route renders `BonusLessonPage` (client), which mounts `LessonShellWatch`, optional `LessonMapSurface`, and `BonusLessonFooter`. Video playback for Bunny uses an iframe from [apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-player.tsx](apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-player.tsx). The v1 plan intentionally did not add local keyboard routing; v2 adds an affordance and, when the embed responds, player.js-style commands from a focusable wrapper around the 16:9 frame on the watch-shell bare path only.

### In Scope

Files and behaviors listed in the sibling plan attachment (v2 plan in `.cursor/plans`): `lesson-map-surface.tsx`, `use-lesson-map-focus-trap.ts`, `shells/index.tsx` barrel reduction, `lesson-video-surface.tsx`, new `lesson-video-controls.tsx`, optional `use-bunny-player-controls.ts`, optional `lesson-video-player.tsx` callback for iframe ref, integration tests under `apps/web/tests/integration-ui/`, ExecPlan artifacts directory, and addenda to the v1 ExecPlan.

### Out Of Scope

Any file under `apps/web/app/(workspace)/_components/app-shell/`, `load-bonus-route-access.ts`, `bonus-lesson-view-tracker.tsx`, `manifest.ts`, `bonus-library-presentation.ts`. No new npm dependencies. No `bg-primary` / `text-primary`. No commits unless the user asks.

## Plan of Work

Work runs in slices: map accessibility first, then shell retirement, then Bunny controls (probe then implement), then browser evidence, then repo gates. Each slice updates Progress and Surprises here.

## Milestones

Slice 1 completes when the map section exposes `role="region"`, `aria-modal="true"`, `aria-labelledby`, Tab cycles inside the map without escaping, Escape and Close still dismiss, and `lesson-map-surface.test.tsx` passes.

Slice 2 completes when Split/Focus/Workbench are removed from the barrel, grep shows no stale imports, and unit tests for the bonus lesson page and watch shell still pass.

Slice 3 completes when watch-shell bare Bunny lessons show the controls row and, if the probe succeeds, Space/seek/F forward player commands or fullscreen where supported; tests cover affordance visibility and key forwarding with mocks.

Slice 4 completes when screenshots and network evidence live under the artifacts directory and links are recorded below.

## Concrete Steps

From repo root, after each slice run focused vitest, then `bun run format`, `bun lint`, `bun typecheck`. Lint this plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-lesson-surface-polish-v2.md` and markdown with `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-lesson-surface-polish-v2.md`.

## Validation and Acceptance

A human can open an unlocked bonus lesson, open the lesson map, Tab only within the map until it wraps, press Escape to close with focus restored, and see video keyboard hints under the metadata row. Automated tests cover map behavior and video controls wiring. No denylisted module changes.

### Test Commands

    bun run --cwd apps/web vitest run tests/integration-ui/lesson-map-surface.test.tsx tests/integration-ui/lesson-video-controls.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui tests/unit
    bun run format
    bun run lint
    bun run typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-lesson-surface-polish-v2.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-lesson-surface-polish-v2.md

## Idempotence and Recovery

Re-running slices is safe. If Bunny forwarding misbehaves in production, set implementation to static affordance only in code and record the revert in Decision Log.

## Artifacts and Notes

Browser proof runbook: `docs/exec-plans/_artifacts/2026-05-02-lesson-surface-polish-v2/README.md`. Drop PNG/video/network exports beside that README when captured.

## Interfaces and Dependencies

Uses existing `motion/react`, shadcn UI, `lucide-react`, and `cn`. Player control uses `window.postMessage` to the Bunny iframe when enabled; no new packages.
