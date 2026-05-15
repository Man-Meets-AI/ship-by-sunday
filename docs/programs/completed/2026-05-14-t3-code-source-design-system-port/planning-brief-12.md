---
title: "T3 Code Program Closeout Planning Brief 12"
program_id: "t3-code-source-design-system-port"
brief_version: 12
status: "current"
summary: "Final closeout slice for the Telegram widget, generated customer codebase visual system, proof, and Program completion."
read_when:
  - "Writing or resuming the final T3 Code Program closeout ExecPlan."
  - "Changing the Telegram widget, generated starter template, compiler design facts, or Program completion evidence."
---

# T3 Code Program Closeout Planning Brief 12

## Slice

Final closeout: migrate the standalone Telegram support widget and generated customer codebase output to the T3 Code visual system, add focused contract tests, run representative proof, and move the Program to completed when no required slices remain.

## Desired Outcome

Ship by Sunday's current app, support widget, and generated customer repositories should share the same T3 Code visual contract: DM Sans, zinc-based light and dark semantic tokens, blue primary accents, compact radii, quiet bordered surfaces, dense operational layouts, and no old hardcoded dark-only widget shell or warm editorial generated starter styling. The generated output should still be customer-safe, no-provider-safe, and driven by the compiler's facts and pinned starter template source.

## Scope

In scope:

- update `packages/telegram-chat-widget` CSS so launcher, panel, transcript, composer, messages, attachment chips, bug-report fields, and errors use T3-compatible light and dark tokens with host overrides
- add focused widget tests for CSS token contracts and removal of the old dark-only shell values
- update `templates/starter-app/source` visual foundations and shared primitives so generated apps inherit T3 Code tokens, DM Sans, compact radii, and quiet app/marketing surfaces
- update `packages/codebase-compiler` design preset facts and generated app tests so the default generated design system names the T3 Code source contract
- update generated customer-facing docs or mirrors when source-generated contracts change
- run package/widget/compiler tests, Program/plan lint, markdown lint for touched docs, and representative browser proof where practical
- write the final Program retrospective and move the Program packet to `docs/programs/completed/`

Out of scope:

- changing Telegram transport, support API routes, Convex support functions, provider setup, analytics event schemas, screenshot upload behavior, or live Telegram messages
- changing billing, Clerk, Convex, Stripe, OpenAI, Sentry, PostHog, or Resend runtime behavior in the generated starter
- redesigning the current tracked app surfaces already completed by earlier child ExecPlans
- changing generated repo business logic beyond visual-system and design-source contracts

## Inputs

- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/planning-brief-11.md`
- `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css`
- `templates/starter-app/source/src/app/globals.css`
- `templates/starter-app/source/src/app/layout.tsx`
- `templates/starter-app/source/src/components/ui`
- `templates/starter-app/source/src/components/layout`
- `templates/starter-app/source/src/app/(marketing)/page.tsx`
- `packages/codebase-compiler/src/design-system/design-preset-catalog.ts`
- `packages/codebase-compiler/src/design-system/generated-design-system.ts`
- `packages/codebase-compiler/src/repo-generation/default-starter-template-project-definition.ts`
- `packages/codebase-compiler/tests`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/index.css`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- The Telegram widget keeps package exports, props, support route defaults, privacy constants, event helpers, bug-report payload behavior, attachment limits, and realtime behavior intact.
- The Telegram widget CSS uses semantic T3-compatible token fallbacks for light and dark mode and no longer presents the old hardcoded dark shell as the only supported appearance.
- The generated design-system default is T3 Code-oriented and emits DM Sans, zinc base tokens, blue primary accents, compact radius semantics, and T3 Code source references.
- The starter template source uses the generated visual contract in its globals, font loading, primitives, route shells, public chrome, protected chrome, marketing page, dashboard, chat, auth, and error surfaces.
- The starter template source manifest digest is updated after source changes.
- Focused tests prove widget CSS tokens, generated design-system default facts, and generated repo output include the T3 Code contract.
- Representative browser proof covers the current app widget in light and dark mode and a generated app in light and dark mode, or exact blockers are recorded.
- `bun run --cwd packages/telegram-chat-widget lint`, `bun run --cwd packages/telegram-chat-widget format:check`, `bun run --cwd packages/telegram-chat-widget typecheck`, `bun run --cwd packages/telegram-chat-widget test`, `bun run --cwd packages/codebase-compiler lint`, `bun run --cwd packages/codebase-compiler format:check`, `bun run --cwd packages/codebase-compiler typecheck`, `bun run --cwd packages/codebase-compiler test`, Program/plan lint, markdown lint for touched docs, repo `bun run lint`, repo `bun run typecheck`, and `git diff --check` pass or exact blockers are recorded.
- The Program is complete only after the retrospective is written, `completed_at` and `post_build_recap` are filled, `Next Slice` says no required slice remains, and the folder is moved to `docs/programs/completed/`.

## Watchpoints

- The widget is standalone CSS, so do not rely on Tailwind or app-only classes inside `packages/telegram-chat-widget`.
- Generated repo changes must remain customer-safe and no-provider-safe.
- Template source changes require updating `templates/starter-app/template-source.json` digest and any contract tests that pin the digest.
- Program references must point to the completed Program path after the folder moves.
