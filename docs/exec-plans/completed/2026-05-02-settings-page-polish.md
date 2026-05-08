---
title: Settings Page Polish
status: complete
created_at: 2026-05-02
completed_at: 2026-05-08
summary: Polish the workspace settings surface with a sticky lg+ section TOC, first-class Codex connection UI, confirmed disconnect, motion-gated feedback, split starter-repo card, and semantic headings without touching AppShell or data contracts.
post_build_recap: This historical settings polish plan is administratively closed in the completed archive; no new implementation evidence was added during the 2026-05-08 closeout pass.
read_when:
  - Resuming settings polish implementation or validation.
  - Regressing Codex disconnect, starter repo form, or Clerk manage-account on /settings.
---

# Settings Page Polish

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

`/settings` is where buyers fix account, Codex, and starter-repo configuration. This pass adds a sticky left table of contents at `lg+`, anchored sections, a first-class Codex connection surface with AlertDialog disconnect confirmation and reduced-motion-gated feedback, starter repo layout split under the 150-line rule, and account identity polish with optional Clerk avatar. No AppShell files, `useCodexConnectionCard`, Convex query shapes, or `starter-repo-access-copy` contracts change.

## Progress

- [x] 2026-05-02: Author this ExecPlan in repo.
- [x] 2026-05-08: Baseline browser capture follow-up administratively closed with this historical plan.
- [x] 2026-05-08: Page TOC, anchors, and intro follow-up administratively closed with this historical plan.
- [x] 2026-05-08: Codex status, skeleton, rate limits, actions, dialog, and feedback-motion follow-up administratively closed with this historical plan.
- [x] 2026-05-08: Starter repo split and form accessibility follow-up administratively closed with this historical plan.
- [x] 2026-05-08: Account card follow-up administratively closed with this historical plan.
- [x] 2026-05-08: Full validation matrix and recap follow-up administratively closed with this historical plan.

## Surprises & Discoveries

On 2026-05-08 Parker chose to close this historical completed-path plan instead of moving it back to active. No fresh implementation evidence was added during that metadata cleanup.

## Decision Log

Decision: Sticky left-rail TOC at `lg+` with anchors; AlertDialog for Codex disconnect; no `bg-primary` / `text-primary` on touched surfaces.

Rationale: Product choices from planning; house styling rules.

Date: 2026-05-02

## Outcomes & Retrospective

This plan is complete as a historical archive. It records the intended settings polish scope and constraints, but the 2026-05-08 closeout did not add new implementation, validation, or browser-proof evidence.

## Context and Orientation

Render path: `apps/web/app/(workspace)/settings/page.tsx` → `SettingsPageShell` → `SettingsPageContent` in `settings/_components/settings-page.tsx`.

In-scope UI: `settings/_components/*`, `apps/web/app/(workspace)/_components/settings-account-card.tsx`, `codex-connection-card/*` (except hook and model types), `starter-repo-access/*`.

### In Scope

Presentation-only changes that preserve hooks, Clerk calls, Convex API usage, `data-testid` values, and analytics.

### Out Of Scope

AppShell, `page.tsx` gates, `use-codex-connection-card.ts`, `codex-connection-card-model.ts`, copy in `starter-repo-access-copy.ts` unless explicitly required, PostHog and unrelated tree files.

## Plan of Work

Implement the slices described in the approved Cursor plan: responsive layout with sticky TOC, semantic `h2`/`h3` in cards, Codex status dot+chip and skeleton parity, rate limit scannability, Connect as foreground-tone CTA, disconnect confirmation, motion on feedback, starter repo file split under 150 lines, form `aria-describedby`, account avatar and manage affordance.

## Milestones

M1: Page shell + tests. M2: Codex core. M3: Rate limits + feedback. M4: Starter repo + form. M5: Account + full gates.

## Concrete Steps

From repo root: run narrow vitest on touched paths after each slice; finish with `bun run format`, `bun lint`, `bun typecheck`, `bun run --cwd apps/web vitest run tests/integration-ui tests/unit`, `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-settings-page-polish.md`, `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-settings-page-polish.md`. Manual browser proof on `/settings` in light and dark at 1440 and 390 with reduced motion once.

## Validation and Acceptance

Settings reads as intentional IA. Codex flows unchanged except disconnect requires confirmation. No new primary utility classes. All listed tests and repo gates pass.

### Test Commands

    bun run --cwd apps/web vitest run tests/unit/settings-page.test.tsx
    bun run --cwd apps/web vitest run tests/unit/starter-repo-access-card.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui/starter-repo-access-form.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui tests/unit
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-settings-page-polish.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-settings-page-polish.md

## Idempotence and Recovery

Revert by file; re-run vitest. Adjust TOC `top-*` only in `settings-page` if AppShell overlap appears.

## Artifacts and Notes

Capture screenshots and state matrix in this section when closing the plan.

## Interfaces and Dependencies

Stable: `useCodexConnectionCard` API, Convex `api.course.*`, Clerk `openUserProfile`, `AppShell` mount from `SettingsPageShell`.

UI: `motion/react`, shadcn `AlertDialog`, `Item`, `Button`, `Avatar`.
