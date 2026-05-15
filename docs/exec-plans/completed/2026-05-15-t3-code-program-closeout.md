---
title: T3 Code Program Closeout
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Finish the T3 Code migration by updating the Telegram widget, generated customer app output, proof, and Program closeout records.
post_build_recap: Migrated the Telegram widget CSS, generated design defaults, starter template source, generated app overlays, focused tests, browser proof, and Program archive records to the T3 Code visual contract.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/completed/2026-05-14-t3-code-source-design-system-port/planning-brief-12.md
read_when:
  - Resuming the final T3 Code Program closeout.
  - Validating the Telegram widget and generated-codebase migration.
  - Reviewing the completed T3 Code Program retrospective.
---

# T3 Code Program Closeout

This document is a living execution plan for finishing the T3 Code Source Design System Port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The current app already moved to the T3 Code visual system, but the Program cannot complete while the standalone support widget and generated customer codebases still carry older styling. After this plan, the widget, starter template, compiler-generated design facts, and Program closeout docs all agree on the same T3 Code contract: DM Sans, zinc semantic surfaces, blue primary accents, compact radii, quiet borders, and dense operational layouts.

## Progress

- [x] 2026-05-15: Read root instructions, Program document, Program contract, ExecPlan contract, planning brief 11, and compiler package owner guidance.
- [x] 2026-05-15: Added planning brief 12 to include generated-codebase closeout work that planning brief 11 intentionally excluded.
- [x] 2026-05-15: Migrate Telegram widget CSS and tests.
- [x] 2026-05-15: Migrate generated starter template visuals, compiler default design facts, and tests.
- [x] 2026-05-15: Run package, compiler, Program, plan, markdown, and repo validation.
- [x] 2026-05-15: Capture representative browser proof or record exact blockers.
- [x] 2026-05-15: Complete the Program retrospective and move the Program packet to completed.

## Surprises & Discoveries

The existing Telegram widget already exposes host CSS variables, but its launcher, panel, transcript, composer, and messages still hardcode a dark-only shell with white text and lime focus/online accents.

The generated starter template source is pinned by `templates/starter-app/template-source.json`; any template-source visual edit must update the manifest digest and the test expectation in `packages/codebase-compiler/tests/starter-template-source-contract.test.ts`.

The generated starter's web-only dev server needs a valid-shape Clerk publishable key and a dummy `CLERK_SECRET_KEY` even for the public marketing page because Clerk's Next proxy runs before rendering. The browser proof used local-only dummy values and did not run Convex local mode.

The in-app browser refused `data:` and `file:` proof URLs, so the standalone widget proof used a local HTTP server serving ignored `codex-scripts/` HTML harnesses that import the real package CSS. The generated app dark proof used captured Next HTML with the `dark` class applied and Next assets loaded from the local dev server.

## Decision Log

Decision: Use one final closeout ExecPlan instead of separate Telegram and generated-codebase plans. Rationale: the user asked to complete the whole Program, the Program has no active child ExecPlans, and the remaining acceptance criteria are coupled by the final Program retrospective and proof. Date: 2026-05-15.

Decision: Preserve package and generated starter runtime behavior while changing visual contracts. Rationale: the remaining Program work is design-system migration, not provider, support, billing, auth, or chat behavior changes. Date: 2026-05-15.

## Outcomes & Retrospective

This plan completed the final T3 Code Program closeout. `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css` now defines semantic `--sbs-chat-*` fallbacks backed by app tokens and supports light, dark, host `.dark`, host `[data-theme="dark"]`, explicit widget `data-theme`, and system dark mode without the old dark-only shell. `packages/telegram-chat-widget/tests/styles-contract.test.ts` proves the token contract and rejects the retired hardcoded shell values.

Generated customer app output now defaults to T3 Code. `packages/codebase-compiler/src/design-system/design-preset-catalog.ts` adds the `t3-code` preset and makes it the default, `preset-design-system.ts` emits the T3 blue primary, and canonical/default starter facts point at T3 Code sources. `templates/starter-app/source` now uses DM Sans, zinc semantic globals, compact local UI primitives, T3-style layout chrome, public marketing, app dashboard, chat, Convex readiness, billing, auth, and error surfaces. The template-source digest is current at `sha256-6681c4e9492ea7cb07634a9beb7d8c656b2dec556e939b8fe01c7f35fff79c0c`.

Proof covered both static contracts and rendered browser states. Focused package and compiler gates passed, and browser artifacts under `codex-scripts/artifacts/t3-closeout/` show the widget in light desktop and dark mobile states plus the generated app in light and dark desktop/mobile states.

## Context and Orientation

The standalone widget lives in `packages/telegram-chat-widget`. Its public CSS is `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css`, exported as `@shipbysunday/telegram-chat-widget/styles.css` and imported by the tracked web app from `apps/web/src/app/layout.tsx`.

Generated customer repositories are assembled by `packages/codebase-compiler`. The starter source copied into generated repos lives under `templates/starter-app/source`, while generated overlays live in `packages/codebase-compiler/src/repo-generation/render-generated-template-app-files.ts` and generated design facts live in `packages/codebase-compiler/src/design-system`.

### In Scope

This plan changes widget CSS, focused widget tests, starter template visual source, compiler design-preset defaults, compiler tests, manifest digest records, and Program/ExecPlan closeout docs.

### Out Of Scope

This plan does not change Telegram transport, support API routes, Convex support state, screenshot upload behavior, analytics event names, generated provider setup behavior, billing/auth logic, or the already-migrated tracked app route surfaces.

## Plan of Work

First, rewrite the widget CSS around semantic `--sbs-chat-*` tokens backed by app tokens such as `--background`, `--foreground`, `--card`, `--border`, `--primary`, `--muted`, `--destructive`, and `--ring`. Add a package test that reads the CSS and asserts the token contract plus absence of the old dark-only shell values.

Next, move the generated design preset default to a T3 Code source preset and update the default starter facts to reference T3 Code. Update compiler tests that assert the default preset label, style, font, and references.

Then, update the pinned starter template source: globals, root font loading, primitives, layout chrome, and representative public/protected surfaces. Recompute the template source digest and update the pinned manifest and tests.

Finally, run validation, use browser proof for the app-hosted widget and generated app where practical, complete the Program retrospective, and move the Program folder from active to completed.

## Milestones

Milestone 1 migrates the Telegram widget. Success means package tests pass and the CSS exposes light/dark semantic tokens without the old hardcoded dark-only shell values.

Milestone 2 migrates generated-codebase visual truth. Success means compiler tests pass, the default generated design system is T3 Code-oriented, and the starter template source digest is current.

Milestone 3 closes the Program. Success means proof is recorded, validation results are documented, and the Program packet is in `docs/programs/completed/`.

## Concrete Steps

Run focused package commands from the repo root:

    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check
    bun run --cwd packages/telegram-chat-widget typecheck
    bun run --cwd packages/telegram-chat-widget test

Run focused compiler commands from the repo root:

    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler format:check
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler test

Run closeout docs and repo checks from the repo root:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-program-closeout.md
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-14-t3-code-source-design-system-port docs/exec-plans/completed/2026-05-15-t3-code-program-closeout.md
    bun run lint
    bun run typecheck
    git diff --check

## Validation and Acceptance

Acceptance is observable when the widget CSS contract test passes, generated design-system tests name T3 Code defaults, generated repo tests include T3 source markers, browser proof shows no blank or broken widget/generated app states in light and dark mode, and the completed Program contains a final retrospective with no required next slice.

### Test Commands

    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check
    bun run --cwd packages/telegram-chat-widget typecheck
    bun run --cwd packages/telegram-chat-widget test
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler format:check
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler test
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-program-closeout.md
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-14-t3-code-source-design-system-port docs/exec-plans/completed/2026-05-15-t3-code-program-closeout.md
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    git diff --check

## Idempotence and Recovery

All edits are source edits and can be rerun safely. If template-source digest validation fails, recompute the digest from the current `templates/starter-app/source` tree and update both `templates/starter-app/template-source.json` and the pinned test expectation. If browser proof cannot run because the app needs unavailable provider state, use synthetic or no-provider states and record the exact limitation here and in the Program.

## Artifacts and Notes

Focused validation:

- `bun run --cwd packages/telegram-chat-widget lint` passed.
- `bun run --cwd packages/telegram-chat-widget format:check` passed.
- `bun run --cwd packages/telegram-chat-widget typecheck` passed.
- `bun run --cwd packages/telegram-chat-widget test` passed, 5 files and 19 tests.
- `bun run --cwd packages/codebase-compiler lint` passed.
- `bun run --cwd packages/codebase-compiler format:check` passed.
- `bun run --cwd packages/codebase-compiler typecheck` passed.
- `bun run --cwd packages/codebase-compiler test` passed, 15 files and 59 tests.
- `bun run format` passed.
- `bun run programs:lint` passed.
- `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-program-closeout.md` passed.
- `bun run markdown:lint -- --paths AGENTS.md DESIGN.md apps/web/AGENTS.md docs/DESIGN.md docs/FRONTEND.md docs/index.md docs/programs/README.md docs/programs/active/index.md docs/programs/completed/index.md docs/ship-by-sunday/design-pack docs/programs/completed/2026-05-14-t3-code-source-design-system-port docs/exec-plans/completed/2026-05-15-t3-code-program-closeout.md MISTAKES.md` passed.
- `bun run lint` passed.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck` passed.
- `git diff --check` passed.

Browser proof artifacts:

- `codex-scripts/artifacts/t3-closeout/widget-desktop-light.png`
- `codex-scripts/artifacts/t3-closeout/widget-mobile-dark.png`
- `codex-scripts/artifacts/t3-closeout/generated-app-desktop-light.png`
- `codex-scripts/artifacts/t3-closeout/generated-app-desktop-dark.png`
- `codex-scripts/artifacts/t3-closeout/generated-app-mobile-light.png`
- `codex-scripts/artifacts/t3-closeout/generated-app-mobile-dark.png`

## Interfaces and Dependencies

The widget public interface is `TelegramChatWidget` plus `@shipbysunday/telegram-chat-widget/styles.css`. The generated repo public interface is the customer-safe snapshot from `materializeRepoSnapshot`. The starter template source manifest is the integrity boundary for generated app source. The Program packet is the initiative-level source of truth and must move to `docs/programs/completed/` only after acceptance is met.
